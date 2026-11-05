/** Electric control (SPEC §6.4) and reference circuits R6–R7 (SPEC §11). */
import { validateProject } from '../../src/core/validation';
import { getComponentDef } from '../../src/components/registry';
import { solveCircuit } from '../../src/engine/electric/solver';
import { build, loadFixture, position, pulse, simulate } from './helpers';

describe('solveCircuit', () => {
  it('energises a load bridged from +24 V to 0 V by closed contacts', () => {
    const r = solveCircuit(['P'], ['M'], [['P', 'a']], [{ id: 'k', a: 'a', b: 'M' }]);
    expect([...r.energized]).toEqual(['k']);
    expect(r.short).toEqual([]);
  });

  it('does not energise a load with an open path, in either orientation', () => {
    expect(solveCircuit(['P'], ['M'], [], [{ id: 'k', a: 'a', b: 'M' }]).energized.size).toBe(0);
    const r = solveCircuit(['P'], ['M'], [['M', 'a']], [{ id: 'k', a: 'a', b: 'P' }]);
    expect([...r.energized]).toEqual(['k']);
  });

  it('detects a short circuit', () => {
    const r = solveCircuit(
      ['P'],
      ['M'],
      [
        ['P', 'x'],
        ['x', 'M'],
      ],
      [],
    );
    expect(r.short.length).toBeGreaterThan(0);
  });
});

describe.each(['r6-self-holding.automalab.json', 'r7-abab-relays-reed.automalab.json'])(
  'fixture %s',
  (name) => {
    it('validates without errors or warnings', () => {
      expect(validateProject(loadFixture(name), getComponentDef)).toEqual([]);
    });
  },
);

describe('R6: self-holding with start/stop', () => {
  it('a start pulse latches K1, Y1 extends the cylinder and the lamp lights', () => {
    const sim = simulate(loadFixture('r6-self-holding.automalab.json'));
    expect(sim.relayEnergized('K1')).toBe(false);
    pulse(sim, 's1');
    expect(sim.relayEnergized('K1')).toBe(true);
    expect(sim.isEnergized('y1')).toBe(true);
    expect(sim.isEnergized('h1')).toBe(true);
    sim.run(1500);
    expect(position(sim, 'c1')).toBe(1);
    expect(sim.warnings).toEqual([]);
  });

  it('stop releases K1 and the cylinder returns', () => {
    const sim = simulate(loadFixture('r6-self-holding.automalab.json'));
    pulse(sim, 's1');
    sim.run(1500);
    pulse(sim, 's0');
    expect(sim.relayEnergized('K1')).toBe(false);
    sim.run(1500);
    expect(sim.eventNames()).toEqual(['1A+', '1A-']);
    expect(sim.signals.map((s) => s.name)).toEqual([
      'K1=1',
      'Y1=1',
      'H1=1',
      'K1=0',
      'Y1=0',
      'H1=0',
    ]);
  });

  it('stop has priority when both buttons are pressed', () => {
    const sim = simulate(loadFixture('r6-self-holding.automalab.json'));
    sim.press('s0');
    sim.press('s1');
    expect(sim.relayEnergized('K1')).toBe(false);
    sim.release('s0');
    expect(sim.relayEnergized('K1')).toBe(true);
  });

  it('wires show +24 V / 0 V and contacts their state', () => {
    const sim = simulate(loadFixture('r6-self-holding.automalab.json'));
    expect(sim.electricState('s0', '12')).toBe('plus'); // through the closed NC stop
    // Between the open start button and the coil: no potential (a coil is not a conductor).
    expect(sim.electricState('s1', '14')).toBe('off');
    expect(sim.electricState('k1', 'A2')).toBe('minus');
    expect(sim.componentState<{ closed: boolean }>('k1a').closed).toBe(false);
    pulse(sim, 's1');
    expect(sim.componentState<{ closed: boolean }>('k1a').closed).toBe(true);
    expect(sim.componentState<{ on: boolean }>('k1').on).toBe(true);
  });
});

describe('R7: A+ B+ A- B- with relays and reed sensors', () => {
  it('runs the sequence continuously while K1 is latched', () => {
    const sim = simulate(loadFixture('r7-abab-relays-reed.automalab.json'));
    sim.run(1000);
    expect(sim.events).toEqual([]);
    pulse(sim, 's1');
    sim.run(8500);
    expect(sim.eventNames().slice(0, 8)).toEqual([
      '1A+',
      '2A+',
      '1A-',
      '2A-',
      '1A+',
      '2A+',
      '1A-',
      '2A-',
    ]);
    expect(sim.warnings).toEqual([]);
  });

  it('stop ends the cycle at the initial position', () => {
    const sim = simulate(loadFixture('r7-abab-relays-reed.automalab.json'));
    pulse(sim, 's1');
    sim.run(1500); // A+ done, B+ under way
    pulse(sim, 's0');
    sim.run(10000);
    expect(sim.eventNames()).toEqual(['1A+', '2A+', '1A-', '2A-']);
    expect(position(sim, 'cA')).toBe(0);
    expect(position(sim, 'cB')).toBe(0);
  });

  it('reed sensors follow the cylinder positions', () => {
    const sim = simulate(loadFixture('r7-abab-relays-reed.automalab.json'));
    expect(sim.isMechanicallyActuated('b11')).toBe(true); // A retracted
    expect(sim.isMechanicallyActuated('b12')).toBe(false);
    expect(sim.isEnergized('y4')).toBe(true); // B- held at rest
  });
});

describe('electric edge cases', () => {
  it('reports a short circuit once and a toggle switch keeps its state', () => {
    const p = build((b) => {
      const plus = b.add('el.plus');
      const minus = b.add('el.minus');
      const sw = b.add('el.switch.no', 'S1');
      b.wire([plus, 'p'], [sw, '13']);
      b.wire([sw, '14'], [minus, 'p']);
    });
    const sim = simulate(p);
    expect(sim.warnings).toEqual([]);
    const sw = p.components.find((c) => c.type === 'el.switch.no')!.id;
    sim.setInput(sw, { left: true });
    sim.run(10);
    expect(sim.warnings.filter((w) => w.code === 'shortCircuit')).toHaveLength(1);
    expect(sim.electricState(sw, '14')).toBe('short');
  });

  it('a relay that switches itself off oscillates and is reported', () => {
    const p = build((b) => {
      const plus = b.add('el.plus');
      const minus = b.add('el.minus');
      const nc = b.add('el.relay.nc', undefined, { relay: 'K1' });
      const k = b.add('el.relay.coil', 'K1');
      b.wire([plus, 'p'], [nc, '21']);
      b.wire([nc, '22'], [k, 'A1']);
      b.wire([k, 'A2'], [minus, 'p']);
    });
    const sim = simulate(p);
    expect(sim.warnings.some((w) => w.code === 'oscillation')).toBe(true);
  });

  it('electric components are not reported as unsupported', () => {
    const sim = simulate(loadFixture('r6-self-holding.automalab.json'));
    expect(sim.warnings.some((w) => w.code === 'unsupported')).toBe(false);
  });
});
