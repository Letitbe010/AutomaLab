/** GRAFCET editing operations: pure, mutate a draft (like editor/model/ops.ts). */
import type { Grafcet, GrafcetAction, GrafcetStep, GrafcetTransition } from '../../core/grafcet';

export const G_SNAP = 20;
const DOWN = 90;
const SIDE = 200;

export const snapG = (v: number) => Math.round(v / G_SNAP) * G_SNAP;

const newId = (taken: Iterable<string>, prefix: string) => {
  const ids = new Set(taken);
  for (let n = 1; ; n++) if (!ids.has(`${prefix}${n}`)) return `${prefix}${n}`;
};

const nextNumber = (g: Grafcet) => Math.max(0, ...g.steps.map((s) => s.number)) + 1;

function createStep(g: Grafcet, x: number, y: number, initial = false): GrafcetStep {
  const step: GrafcetStep = {
    id: newId(
      g.steps.map((s) => s.id),
      'x',
    ),
    number: nextNumber(g),
    initial,
    x,
    y,
    comment: '',
    actions: [],
  };
  g.steps.push(step);
  return step;
}

function createTransition(g: Grafcet, x: number, y: number, from: string[]): GrafcetTransition {
  const t: GrafcetTransition = {
    id: newId(
      g.transitions.map((k) => k.id),
      't',
    ),
    receptivity: '',
    x,
    y,
    comment: '',
    from,
    to: [],
  };
  g.transitions.push(t);
  return t;
}

/** A step in a free place; the first one of a GRAFCET is initial. */
export function addStep(g: Grafcet): string {
  const x = g.steps.length ? Math.max(...g.steps.map((s) => s.x)) + SIDE : 200;
  return createStep(g, x, 60, g.steps.length === 0).id;
}

/** Adds "transition + step" below a step, or the next step of an open transition. */
export function addBelow(g: Grafcet, selectedId: string): string | null {
  const s = g.steps.find((k) => k.id === selectedId);
  if (s) {
    const t = createTransition(g, s.x, s.y + DOWN, [s.id]);
    const next = createStep(g, s.x, s.y + 2 * DOWN);
    t.to = [next.id];
    return next.id;
  }
  const t = g.transitions.find((k) => k.id === selectedId);
  if (t && t.to.length === 0) {
    const next = createStep(g, t.x, t.y + DOWN);
    t.to = [next.id];
    return next.id;
  }
  return null;
}

/** OR divergence: one more "transition + step" branch out of a step. */
export function addOrBranch(g: Grafcet, stepId: string): string | null {
  const s = g.steps.find((k) => k.id === stepId);
  if (!s) return null;
  const outgoing = g.transitions.filter((t) => t.from.includes(stepId));
  const x = outgoing.length ? Math.max(...outgoing.map((t) => t.x)) + SIDE : s.x;
  const t = createTransition(g, x, s.y + DOWN, [s.id]);
  const next = createStep(g, x, s.y + 2 * DOWN);
  t.to = [next.id];
  return next.id;
}

/** AND divergence: one more step after a transition. */
export function addAndBranch(g: Grafcet, transitionId: string): string | null {
  const t = g.transitions.find((k) => k.id === transitionId);
  if (!t) return null;
  const targets = g.steps.filter((s) => t.to.includes(s.id));
  const x = targets.length ? Math.max(...targets.map((s) => s.x)) + SIDE : t.x;
  const y = targets[0]?.y ?? t.y + DOWN;
  const next = createStep(g, x, y);
  t.to.push(next.id);
  return next.id;
}

/** Sets the next step of a transition: jump back, or OR convergence. */
export function linkNext(g: Grafcet, transitionId: string, stepId: string): void {
  const t = g.transitions.find((k) => k.id === transitionId);
  if (t && g.steps.some((s) => s.id === stepId)) t.to = [stepId];
}

/** Adds a previous step to a transition (AND convergence). */
export function addPrevious(g: Grafcet, transitionId: string, stepId: string): void {
  const t = g.transitions.find((k) => k.id === transitionId);
  if (t && !t.from.includes(stepId) && g.steps.some((s) => s.id === stepId)) t.from.push(stepId);
}

export function removeItem(g: Grafcet, id: string): void {
  g.steps = g.steps.filter((s) => s.id !== id);
  g.transitions = g.transitions.filter((t) => t.id !== id);
  for (const t of g.transitions) {
    t.from = t.from.filter((s) => s !== id);
    t.to = t.to.filter((s) => s !== id);
  }
  // A transition with nothing before it can never fire.
  g.transitions = g.transitions.filter((t) => t.from.length > 0);
}

export function moveItem(g: Grafcet, id: string, x: number, y: number): void {
  const item = g.steps.find((s) => s.id === id) ?? g.transitions.find((t) => t.id === id);
  if (item) {
    item.x = Math.max(G_SNAP * 2, snapG(x));
    item.y = Math.max(G_SNAP * 2, snapG(y));
  }
}

export function addAction(step: GrafcetStep): void {
  const id = newId(
    step.actions.map((a) => a.id),
    'a',
  );
  step.actions.push({ id, kind: 'N', operand: '', condition: '' } satisfies GrafcetAction);
}
