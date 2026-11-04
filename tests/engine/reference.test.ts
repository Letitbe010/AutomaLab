/** Reference circuits R1–R3 (SPEC §11), simulated headless at the logic level. */
import { validateProject } from '../../src/core/validation';
import { getComponentDef } from '../../src/components/registry';
import { loadFixture, position, pulse, simulate } from './helpers';

describe.each([
  'r1-single-button.automalab.json',
  'r2-double-bistable.automalab.json',
  'r3-and-or.automalab.json',
])('fixture %s', (name) => {
  it('loads and validates without errors or free ports', () => {
    const issues = validateProject(loadFixture(name), getComponentDef);
    expect(issues).toEqual([]);
  });
});

describe('R1: single-acting cylinder + 3/2 push-button valve', () => {
  it('extends while the button is pressed and retracts when released', () => {
    const sim = simulate(loadFixture('r1-single-button.automalab.json'));
    expect(sim.portState('c1', 'A')).toBe('EXHAUST'); // vented through the free port 3
    expect(position(sim, 'c1')).toBe(0);

    sim.press('v1');
    expect(sim.portState('c1', 'A')).toBe('PRESSURE');
    expect(sim.runUntil(() => sim.eventNames().includes('1A+'), 2000)).toBe(true);
    // Default stroke time is 1 s at the logic level (SPEC §6.2).
    expect(sim.events[0]!.timeMs).toBeCloseTo(1000, -1);

    sim.release('v1');
    expect(sim.portState('c1', 'A')).toBe('EXHAUST');
    expect(sim.runUntil(() => sim.eventNames().includes('1A-'), 2000)).toBe(true);
    expect(sim.eventNames()).toEqual(['1A+', '1A-']);
  });

  it('retracts by the spring as soon as the button is released mid-stroke', () => {
    const sim = simulate(loadFixture('r1-single-button.automalab.json'));
    pulse(sim, 'v1', 400);
    expect(position(sim, 'c1')).toBeCloseTo(0.4, 2);
    sim.run(100);
    expect(position(sim, 'c1')).toBeCloseTo(0.3, 2);
  });
});

describe('R2: double-acting cylinder + 5/2 bistable pilot valve', () => {
  it('each pulse changes the valve position and the valve keeps it', () => {
    const sim = simulate(loadFixture('r2-double-bistable.automalab.json'));
    // At rest the valve feeds B (1 -> 2): the cylinder is held retracted.
    expect(sim.componentState<{ position: number }>('v1').position).toBe(1);
    expect(sim.portState('c1', 'B')).toBe('PRESSURE');
    expect(sim.portState('c1', 'A')).toBe('EXHAUST');

    pulse(sim, 'b1'); // short pulse on 14
    expect(sim.componentState<{ position: number }>('v1').position).toBe(0);
    sim.run(1500);
    expect(position(sim, 'c1')).toBe(1);
    expect(sim.componentState<{ position: number }>('v1').position).toBe(0); // memory

    pulse(sim, 'b2'); // short pulse on 12
    sim.run(1500);
    expect(position(sim, 'c1')).toBe(0);
    expect(sim.eventNames()).toEqual(['1A+', '1A-']);
  });

  it('with both pilot signals present, keeps the previous position', () => {
    const sim = simulate(loadFixture('r2-double-bistable.automalab.json'));
    sim.press('b2');
    sim.press('b1');
    expect(sim.componentState<{ position: number }>('v1').position).toBe(1);
  });

  it('is deterministic', () => {
    const run = () => {
      const sim = simulate(loadFixture('r2-double-bistable.automalab.json'));
      pulse(sim, 'b1', 30);
      sim.run(1200);
      pulse(sim, 'b2', 30);
      sim.run(1200);
      return sim.events;
    };
    expect(run()).toEqual(run());
  });
});

describe('R3: AND and OR valves (truth tables)', () => {
  it.each([
    [false, false, 'EXHAUST', 'EXHAUST'],
    [true, false, 'EXHAUST', 'PRESSURE'],
    [false, true, 'EXHAUST', 'PRESSURE'],
    [true, true, 'PRESSURE', 'PRESSURE'],
  ] as const)('X=%s Y=%s -> AND %s, OR %s', (x, y, and, or) => {
    const sim = simulate(loadFixture('r3-and-or.automalab.json'));
    if (x) sim.press('bx');
    if (y) sim.press('by');
    expect(sim.portState('a1', '2')).toBe(and);
    expect(sim.portState('o1', '2')).toBe(or);
  });

  it('outputs vent again when the inputs are released', () => {
    const sim = simulate(loadFixture('r3-and-or.automalab.json'));
    sim.press('bx');
    sim.press('by');
    sim.release('bx');
    expect(sim.portState('a1', '2')).toBe('EXHAUST');
    expect(sim.portState('o1', '2')).toBe('PRESSURE');
    sim.release('by');
    expect(sim.portState('o1', '2')).toBe('EXHAUST');
  });
});

describe('both signals on a bistable valve', () => {
  it('is reported once while the conflict lasts', () => {
    const sim = simulate(loadFixture('r2-double-bistable.automalab.json'));
    sim.press('b2');
    sim.press('b1');
    sim.run(20);
    sim.release('b1');
    sim.press('b1');
    const both = sim.warnings.filter((w) => w.code === 'bothSignals');
    expect(both.map((w) => w.code === 'bothSignals' && w.componentId)).toEqual(['v1', 'v1']);
  });
});
