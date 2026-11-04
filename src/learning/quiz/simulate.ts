/**
 * Runs the stimuli of a "predict" question on the template circuit, headless
 * (SPEC §8.6: "the simulation shows the truth").
 */
import { getComponentDef } from '../../components/registry';
import type { Project } from '../../core/types';
import { Simulation } from '../../engine/scheduler';
import type { PredictQuestion, Stimulus } from './types';

export const DEFAULT_PULSE_MS = 100;
/** Time left after the last stimulus so movements can finish. */
export const SETTLE_MS = 6000;

export class StimulusError extends Error {}

export function runStimuli(project: Project, stimuli: Stimulus[]): string[] {
  const sim = new Simulation(project, { getDef: getComponentDef });
  const idOf = (label: string) => {
    const c = project.components.find((k) => k.params.label === label);
    if (!c) throw new StimulusError(`No component labelled ${label}`);
    return c.id;
  };
  for (const s of stimuli) {
    if (s[0] === 'wait') sim.run(s[1]);
    else if (s[0] === 'press') sim.press(idOf(s[1]));
    else if (s[0] === 'release') sim.release(idOf(s[1]));
    else {
      const id = idOf(s[1]);
      sim.press(id);
      sim.run(s[2] ?? DEFAULT_PULSE_MS);
      sim.release(id);
    }
  }
  sim.run(SETTLE_MS);
  return sim.eventNames();
}

const same = (a: string[], b: string[]) => a.length === b.length && a.every((x, i) => x === b[i]);

/** Index of the option the simulation agrees with, or -1. */
export function simulatedOption(project: Project, q: PredictQuestion): number {
  const events = runStimuli(project, q.stimuli);
  return q.optionEvents.findIndex((e) => same(e, events));
}
