/** Logic-level behaviours of individual pneumatic parts (SPEC §6.2). */
import { build, position, pulse, simulate } from './helpers';

describe('nets and venting', () => {
  it('free exhaust ports of a valve vent; a connected but closed line is blocked', () => {
    const p = build((b) => {
      const s = b.add('pn.source');
      const v = b.add('pn.valve.3-2.button-spring');
      const g = b.add('pn.gauge');
      b.wire([s, '1'], [v, '1']);
      b.wire([v, '2'], [g, '1']);
    });
    const sim = simulate(p);
    expect(sim.portState('c3', '1')).toBe('EXHAUST');
    expect(sim.portState('c2', '1')).toBe('PRESSURE');
  });

  it('a line with no supply and no vent is BLOCKED', () => {
    const p = build((b) => {
      const g1 = b.add('pn.gauge');
      const g2 = b.add('pn.gauge');
      b.wire([g1, '1'], [g2, '1']);
    });
    expect(simulate(p).portState('c1', '1')).toBe('BLOCKED');
  });

  it('warns when the supply is connected straight to atmosphere', () => {
    const p = build((b) => {
      const s = b.add('pn.source');
      const e = b.add('pn.exhaust');
      b.wire([s, '1'], [e, '1']);
    });
    expect(simulate(p).warnings.map((w) => w.code)).toContain('supplyVented');
  });
});

describe('check valve', () => {
  it('lets air through 1 -> 2 only', () => {
    const forward = build((b) => {
      const s = b.add('pn.source');
      const c = b.add('pn.valve.check');
      const g = b.add('pn.gauge');
      b.wire([s, '1'], [c, '1']);
      b.wire([c, '2'], [g, '1']);
    });
    expect(simulate(forward).portState('c3', '1')).toBe('PRESSURE');

    const reverse = build((b) => {
      const s = b.add('pn.source');
      const c = b.add('pn.valve.check');
      const g = b.add('pn.gauge');
      b.wire([s, '1'], [c, '2']);
      b.wire([c, '1'], [g, '1']);
    });
    expect(simulate(reverse).portState('c3', '1')).toBe('BLOCKED');
  });
});

/** Double-acting cylinder driven by a 5/2 solenoid valve (solenoid driven as an input). */
function solenoidCylinder(throttleOnB: boolean, valveType = 'pn.valve.5-2.sol-spring') {
  return build((b) => {
    const s = b.add('pn.source');
    const v = b.add(valveType);
    const c = b.add('pn.cyl.double', '1A');
    b.wire([s, '1'], [v, '1']);
    b.wire([v, '4'], [c, 'A']);
    if (throttleOnB) {
      // Meter-out: exhaust from B flows through the throttled direction 1 -> 2.
      const f = b.add('pn.valve.flow-oneway', '1V2', { speedFactor: 0.5 });
      b.wire([c, 'B'], [f, '1']);
      b.wire([f, '2'], [v, '2']);
    } else {
      b.wire([v, '2'], [c, 'B']);
    }
  });
}

describe('cylinder speed and one-way flow control', () => {
  it('extends in the stroke time without throttle', () => {
    const sim = simulate(solenoidCylinder(false));
    sim.press('c2');
    sim.runUntil(() => sim.eventNames().includes('1A+'), 5000);
    expect(sim.events[0]!.timeMs).toBeCloseTo(1000, -1);
  });

  it('meter-out throttle slows extension (factor 0.5) but not retraction', () => {
    const sim = simulate(solenoidCylinder(true));
    sim.press('c2');
    sim.runUntil(() => sim.eventNames().includes('1A+'), 5000);
    expect(sim.events[0]!.timeMs).toBeCloseTo(2000, -1);
    const t0 = sim.timeMs;
    sim.release('c2');
    sim.runUntil(() => sim.eventNames().includes('1A-'), 5000);
    expect(sim.timeMs - t0).toBeCloseTo(1000, -1);
  });
});

describe('5/3 valves', () => {
  it('closed centre holds a cylinder mid-stroke', () => {
    const sim = simulate(solenoidCylinder(false, 'pn.valve.5-3c.sol'));
    pulse(sim, 'c2', 500);
    const held = position(sim, 'c3');
    expect(held).toBeCloseTo(0.5, 2);
    expect(sim.portState('c3', 'A')).toBe('BLOCKED');
    sim.run(1000);
    expect(position(sim, 'c3')).toBe(held);
  });

  it('right solenoid retracts, spring centring stops it', () => {
    const sim = simulate(solenoidCylinder(false, 'pn.valve.5-3e.sol'));
    sim.press('c2');
    sim.run(1200);
    sim.release('c2');
    expect(sim.componentState<{ position: number }>('c2').position).toBe(1);
    pulse(sim, 'c2', 300, 'right');
    expect(position(sim, 'c3')).toBeCloseTo(0.7, 2);
  });
});

describe('pneumatic timer and sequence valve', () => {
  function timerCircuit(type: string, params: Record<string, number> = {}) {
    return build((b) => {
      const s = b.add('pn.source');
      const btn = b.add('pn.valve.3-2.button-spring');
      const t = b.add(type, '1V2', params);
      const g = b.add('pn.gauge');
      b.wire([s, '1'], [btn, '1']);
      b.wire([s, '1'], [t, '1']);
      b.wire([btn, '2'], [t, '12']);
      b.wire([t, '2'], [g, '1']);
    });
  }

  it('NC timer switches only after the delay and resets at once', () => {
    const sim = simulate(timerCircuit('pn.timer.nc', { delayS: 0.5 }));
    sim.press('c2');
    sim.run(450);
    expect(sim.portState('c4', '1')).toBe('EXHAUST');
    sim.run(60);
    expect(sim.portState('c4', '1')).toBe('PRESSURE');
    sim.release('c2');
    sim.run(1);
    expect(sim.portState('c4', '1')).toBe('EXHAUST');
  });

  it('NO timer cuts the output after the delay', () => {
    const sim = simulate(timerCircuit('pn.timer.no', { delayS: 0.2 }));
    expect(sim.portState('c4', '1')).toBe('PRESSURE');
    sim.press('c2');
    sim.run(250);
    expect(sim.portState('c4', '1')).toBe('EXHAUST');
  });

  it('sequence valve switches only if the supply reaches the set pressure', () => {
    const low = simulate(timerCircuit('pn.valve.sequence', { switchBar: 3 }));
    low.press('c2');
    expect(low.portState('c4', '1')).toBe('PRESSURE');

    const high = simulate(timerCircuit('pn.valve.sequence', { switchBar: 8 }));
    high.press('c2');
    expect(high.portState('c4', '1')).toBe('EXHAUST');
  });
});

describe('quick exhaust valve', () => {
  it('feeds the cylinder from 1 and vents it directly when 1 drops', () => {
    const p = build((b) => {
      const s = b.add('pn.source');
      const v = b.add('pn.valve.3-2.button-spring');
      const q = b.add('pn.valve.quick-exhaust');
      const c = b.add('pn.cyl.single', '1A');
      b.wire([s, '1'], [v, '1']);
      b.wire([v, '2'], [q, '1']);
      b.wire([q, '2'], [c, 'A']);
    });
    const sim = simulate(p);
    sim.press('c2');
    expect(sim.portState('c4', 'A')).toBe('PRESSURE');
    sim.run(1100);
    sim.release('c2');
    expect(sim.portState('c4', 'A')).toBe('EXHAUST');
    sim.run(1100);
    expect(sim.eventNames()).toEqual(['1A+', '1A-']);
  });
});

describe('fixed point', () => {
  it('reports an oscillation when a valve pilots itself off', () => {
    // A normally open pilot valve whose output feeds its own pilot 10.
    const p = build((b) => {
      const s = b.add('pn.source');
      const v = b.add('pn.valve.3-2no.pilot-spring');
      b.wire([s, '1'], [v, '1']);
      b.wire([v, '2'], [v, '10']);
    });
    const sim = simulate(p);
    expect(sim.warnings.map((w) => w.code)).toContain('oscillation');
  });

  it('a self-holding (memory) circuit with a bistable valve is stable', () => {
    const p = build((b) => {
      const s = b.add('pn.source');
      const v = b.add('pn.valve.5-2.pilot');
      const btn = b.add('pn.valve.3-2.button-spring');
      b.wire([s, '1'], [v, '1']);
      b.wire([s, '1'], [btn, '1']);
      b.wire([btn, '2'], [v, '14']);
      b.wire([v, '4'], [v, '14']);
    });
    const sim = simulate(p);
    pulse(sim, 'c3');
    sim.run(10);
    expect(sim.componentState<{ position: number }>('c2').position).toBe(0);
    expect(sim.warnings.map((w) => w.code)).not.toContain('oscillation');
  });
});

describe('motor', () => {
  it('turns in the direction of the pressurized port', () => {
    const p = build((b) => {
      const s = b.add('pn.source');
      const v = b.add('pn.valve.5-2.sol-spring');
      const m = b.add('pn.motor');
      b.wire([s, '1'], [v, '1']);
      b.wire([v, '4'], [m, 'A']);
      b.wire([v, '2'], [m, 'B']);
    });
    const sim = simulate(p);
    sim.run(1);
    expect(sim.componentState<{ direction: number }>('c3').direction).toBe(-1);
    sim.press('c2');
    sim.run(1);
    expect(sim.componentState<{ direction: number }>('c3').direction).toBe(1);
  });
});
