/** PLC in the simulation (SPEC §6.5): R8 and R7 with Ladder (phase 5 acceptance). */
import { validateProject } from '../../src/core/validation';
import { getComponentDef } from '../../src/components/registry';
import { loadFixture, position, pulse, simulate } from './helpers';

describe.each(['r8-ladder-ton.automalab.json', 'r7-ladder.automalab.json'])(
  'fixture %s',
  (name) => {
    it('validates without errors', () => {
      const errors = validateProject(loadFixture(name), getComponentDef).filter(
        (i) => i.severity === 'error',
      );
      expect(errors).toEqual([]);
    });
  },
);

describe('R8: Ladder TON 2 s', () => {
  it('the output comes on 2 s (± one scan) after the input', () => {
    const sim = simulate(loadFixture('r8-ladder-ton.automalab.json'));
    sim.press('s1');
    const start = sim.timeMs;
    expect(sim.runUntil(() => sim.isEnergized('h1'), 3000)).toBe(true);
    const delay = sim.timeMs - start;
    expect(Math.abs(delay - 2000)).toBeLessThanOrEqual(10 + 1);
    expect(sim.plcState()).toEqual({ inputs: ['I0.0'], outputs: ['Q0.0'] });
    sim.release('s1');
    sim.run(30);
    expect(sim.isEnergized('h1')).toBe(false);
  });

  it('a press shorter than PT never switches the output on', () => {
    const sim = simulate(loadFixture('r8-ladder-ton.automalab.json'));
    pulse(sim, 's1', 1500);
    sim.run(3000);
    expect(sim.signals.map((s) => s.name)).toEqual([]);
  });
});

describe('R7 with Ladder: same sequence as with relays', () => {
  it('runs A+ B+ A- B- continuously and stops at the end of the cycle', () => {
    const relays = simulate(loadFixture('r7-abab-relays-reed.automalab.json'));
    const ladder = simulate(loadFixture('r7-ladder.automalab.json'));
    for (const sim of [relays, ladder]) {
      pulse(sim, 's1');
      sim.run(5500);
      pulse(sim, 's0');
      sim.run(10000);
    }
    expect(ladder.eventNames()).toEqual(relays.eventNames());
    expect(ladder.eventNames().slice(0, 5)).toEqual(['1A+', '2A+', '1A-', '2A-', '1A+']);
    expect(position(ladder, 'cA')).toBe(0);
    expect(position(ladder, 'cB')).toBe(0);
    expect(ladder.warnings).toEqual([]);
  });

  it('the stop button wired NC is read as 1 at rest', () => {
    const sim = simulate(loadFixture('r7-ladder.automalab.json'));
    expect(sim.plcState()!.inputs).toEqual(['I0.0', 'I0.2', 'I0.4']);
  });
});
