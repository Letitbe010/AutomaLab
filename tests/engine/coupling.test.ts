/** Mechanical coupling (rollers) and reference circuits R4–R5 (SPEC §6.1 step 6, §11). */
import { findLimitBindings, limitActuated } from '../../src/engine/coupling/mechanical';
import { validateProject } from '../../src/core/validation';
import { getComponentDef } from '../../src/components/registry';
import { build, loadFixture, position, pulse, simulate } from './helpers';

describe('limitActuated', () => {
  const roller = { valveId: 'v', cylinderId: 'c', at: '+' as const, idle: false };
  const idle = { ...roller, idle: true };

  it('a roller is pressed only at its end position', () => {
    expect(limitActuated(roller, 1, 1)).toBe(true);
    expect(limitActuated(roller, 0.99, 0.98)).toBe(false);
    expect(limitActuated({ ...roller, at: '-' }, 0, 0)).toBe(true);
  });

  it('an idle-return roller is tripped near the end, only while moving towards it', () => {
    expect(limitActuated(idle, 0.97, 0.96)).toBe(true); // arriving
    expect(limitActuated(idle, 1, 1)).toBe(false); // stopped at the end
    expect(limitActuated(idle, 0.97, 0.98)).toBe(false); // leaving
    expect(limitActuated(idle, 0.5, 0.49)).toBe(false); // too far
  });
});

describe('findLimitBindings', () => {
  it('binds rollers by cylinder label and skips unbound or unknown ones', () => {
    const p = build((b) => {
      b.add('pn.cyl.double', '1A');
      b.add('pn.valve.3-2.roller-spring', '1S1', { cylinder: '1A', at: '-' });
      b.add('pn.valve.3-2.idleroller-spring', '1S2', { cylinder: '1A', at: '+' });
      b.add('pn.valve.3-2.roller-spring', '1S3', { cylinder: '' });
      b.add('pn.valve.3-2.roller-spring', '1S4', { cylinder: '9A' });
    });
    expect(findLimitBindings(p.components)).toEqual([
      { valveId: 'c2', cylinderId: 'c1', at: '-', idle: false },
      { valveId: 'c3', cylinderId: 'c1', at: '+', idle: true },
    ]);
  });

  it('validation warns about unbound rollers and unknown cylinders', () => {
    const p = build((b) => {
      b.add('pn.cyl.double', '1A');
      b.add('pn.valve.3-2.roller-spring', '1S3', { cylinder: '' });
      b.add('pn.valve.3-2.roller-spring', '1S4', { cylinder: '9A' });
    });
    const codes = validateProject(p, getComponentDef).map((i) => i.code);
    expect(codes).toContain('limitUnbound');
    expect(codes).toContain('limitUnknownCylinder');
  });
});

describe('idle-return roller in a circuit', () => {
  it('gives a short pulse while the rod arrives, and none on the way back', () => {
    const p = build((b) => {
      const s = b.add('pn.source');
      const v = b.add('pn.valve.3-2.button-spring');
      const c = b.add('pn.cyl.single', '1A');
      const r = b.add('pn.valve.3-2.idleroller-spring', '1S2', { cylinder: '1A', at: '+' });
      const g = b.add('pn.gauge');
      b.wire([s, '1'], [v, '1']);
      b.wire([v, '2'], [c, 'A']);
      b.wire([s, '1'], [r, '1']);
      b.wire([r, '2'], [g, '1']);
    });
    const sim = simulate(p);
    const seen: string[] = [];
    sim.press('c2');
    for (let t = 0; t < 1200; t++) {
      sim.step();
      const state = sim.portState('c5', '1');
      if (seen[seen.length - 1] !== state) seen.push(state);
    }
    expect(seen).toEqual(['EXHAUST', 'PRESSURE', 'EXHAUST']);
    sim.release('c2');
    for (let t = 0; t < 1200; t++) {
      sim.step();
      expect(sim.portState('c5', '1')).toBe('EXHAUST');
    }
  });
});

describe.each(['r4-reciprocation.automalab.json', 'r5-cascade-abba.automalab.json'])(
  'fixture %s',
  (name) => {
    it('validates without errors or warnings', () => {
      expect(validateProject(loadFixture(name), getComponentDef)).toEqual([]);
    });
  },
);

describe('R4: automatic reciprocation with rollers', () => {
  it('cycles continuously while the on/off valve is open (about 2 s per cycle)', () => {
    const sim = simulate(loadFixture('r4-reciprocation.automalab.json'));
    sim.run(4500);
    expect(sim.eventNames()).toEqual(['1A+', '1A-', '1A+', '1A-']);
    const times = sim.events.map((e) => e.timeMs);
    for (const [i, t] of times.entries()) expect(t).toBeGreaterThanOrEqual((i + 1) * 1000 - 5);
    for (const [i, t] of times.entries()) expect(t).toBeLessThanOrEqual((i + 1) * 1000 + 10);
  });

  it('stops at the retracted end once the valve is closed', () => {
    const sim = simulate(loadFixture('r4-reciprocation.automalab.json'));
    sim.run(500);
    sim.press('sw'); // closes the shut-off valve
    sim.run(5000);
    expect(sim.eventNames()).toEqual(['1A+', '1A-']);
    expect(position(sim, 'c1')).toBe(0);
  });
});

describe('R5: A+ B+ B- A- cascade (2 groups)', () => {
  it('stays at rest until the start button is pressed', () => {
    const sim = simulate(loadFixture('r5-cascade-abba.automalab.json'));
    sim.run(3000);
    expect(sim.events).toEqual([]);
    expect(sim.portState('mem', '2')).toBe('PRESSURE'); // group II line at rest
  });

  it('runs one full cycle in the right order, without blocking', () => {
    const sim = simulate(loadFixture('r5-cascade-abba.automalab.json'));
    pulse(sim, 'st', 50);
    sim.run(5000);
    expect(sim.eventNames()).toEqual(['1A+', '2A+', '2A-', '1A-']);
    expect(sim.warnings).toEqual([]);
    expect(position(sim, 'cA')).toBe(0);
    expect(position(sim, 'cB')).toBe(0);
  });

  it('repeats the cycle on every start and ignores start while running', () => {
    const sim = simulate(loadFixture('r5-cascade-abba.automalab.json'));
    pulse(sim, 'st', 50);
    sim.run(1500);
    pulse(sim, 'st', 50); // pressed mid-cycle: no effect (group I active)
    sim.run(4000);
    pulse(sim, 'st', 50);
    sim.run(5000);
    expect(sim.eventNames()).toEqual(['1A+', '2A+', '2A-', '1A-', '1A+', '2A+', '2A-', '1A-']);
  });
});
