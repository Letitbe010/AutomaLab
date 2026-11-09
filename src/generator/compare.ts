/**
 * Compare mode (SPEC §8.8): runs the user's circuit headless and reports the
 * first step where it differs from the requested sequence.
 */
import { getComponentDef } from '../components/registry';
import type { Project } from '../core/types';
import { validateProject } from '../core/validation';
import { Simulation } from '../engine/scheduler';
import { cylinderLabel, lettersOf, moveText, type Move } from './sequence';

/** Long enough for the PLC to see the press (10 ms scan). */
export const START_PULSE_MS = 200;
/** A move takes about 1 s at the logic level; slow circuits get a margin. */
const PER_STEP_MS = 3000;
const IDLE_LIMIT_MS = 4000;
const SLICE_MS = 250;

const MANUAL = /^pn\.valve\.[^.]+\.(button|lever|pedal)|^el\.(button|switch)/;

/** Components that can start a cycle, the most likely first. */
export function startCandidates(project: Project): { id: string; label: string }[] {
  const out = project.components
    .filter((c) => MANUAL.test(c.type))
    .map((c) => ({ id: c.id, label: typeof c.params.label === 'string' ? c.params.label : c.id }));
  const rank = (l: string) => (/^(0S1|S1|1S1)$/.test(l) ? 0 : 1);
  return out.sort((a, b) => rank(a.label) - rank(b.label));
}

export type CompareResult =
  | { status: 'same'; events: string[] }
  | { status: 'invalid'; count: number }
  | { status: 'missingCylinder'; letter: string; label: string }
  | { status: 'noStart' }
  | { status: 'unstable' }
  | { status: 'different'; step: number; expected: string; got: string; events: string[] }
  | { status: 'stopped'; step: number; expected: string; events: string[] };

/** Label of the cylinder for a letter: 1A, or the plain letter if the user used it. */
function cylinderFor(project: Project, letter: string): string | undefined {
  const labels = project.components.map((c) => c.params.label);
  const standard = cylinderLabel(letter);
  if (labels.includes(standard)) return standard;
  return labels.includes(letter) ? letter : undefined;
}

export function compareWithSequence(
  project: Project,
  moves: Move[],
  startId: string | null,
): CompareResult {
  const errors = validateProject(project, getComponentDef).filter((i) => i.severity === 'error');
  if (errors.length) return { status: 'invalid', count: errors.length };
  const names = new Map<string, string>();
  for (const letter of lettersOf(moves)) {
    const label = cylinderFor(project, letter);
    if (!label) return { status: 'missingCylinder', letter, label: cylinderLabel(letter) };
    names.set(letter, label);
  }
  if (!startId || !project.components.some((c) => c.id === startId)) return { status: 'noStart' };

  const sim = new Simulation(project, { getDef: getComponentDef });
  sim.press(startId);
  sim.run(START_PULSE_MS);
  sim.release(startId);

  // Runs until the cycle is complete, or nothing has moved for a while.
  const limit = sim.timeMs + moves.length * PER_STEP_MS + IDLE_LIMIT_MS;
  let seen = sim.events.length;
  let lastChange = sim.timeMs;
  while (sim.timeMs < limit && sim.events.length < moves.length) {
    sim.run(SLICE_MS);
    if (sim.events.length !== seen) {
      seen = sim.events.length;
      lastChange = sim.timeMs;
    } else if (sim.timeMs - lastChange > IDLE_LIMIT_MS) break;
  }
  if (sim.warnings.some((w) => w.code === 'oscillation')) return { status: 'unstable' };

  const events = sim.eventNames();
  for (const [i, m] of moves.entries()) {
    const wanted = `${names.get(m.letter)!}${m.sign}`;
    const got = events[i];
    if (got === undefined) {
      return { status: 'stopped', step: i + 1, expected: moveText(m), events };
    }
    if (got !== wanted) {
      return { status: 'different', step: i + 1, expected: wanted, got, events };
    }
  }
  return { status: 'same', events: events.slice(0, moves.length) };
}
