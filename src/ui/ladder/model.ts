/**
 * Ladder editing operations (pure, mutate a draft like editor/model/ops.ts).
 * Rungs are series lists; a parallel element holds branches (series lists).
 */
import { walkElements, type LadderElement, type Rung } from '../../core/plc';

export type ElementTemplate =
  'no' | 'nc' | 'p' | 'n' | 'out' | 'set' | 'reset' | 'TON' | 'TOF' | 'TP' | 'CTU' | 'CTD';

function allIds(rungs: Rung[]): Set<string> {
  const ids = new Set<string>();
  for (const r of rungs) {
    ids.add(r.id);
    for (const e of walkElements(r.elements)) ids.add(e.id);
  }
  return ids;
}

export function newId(rungs: Rung[], prefix: 'e' | 'r'): string {
  const ids = allIds(rungs);
  for (let n = 1; ; n++) if (!ids.has(`${prefix}${n}`)) return `${prefix}${n}`;
}

/** Next free instance name for timers (T1…) or counters (C1…). */
export function nextInstance(rungs: Rung[], letter: 'T' | 'C'): string {
  const used = new Set(
    rungs.flatMap((r) =>
      walkElements(r.elements).flatMap((e) =>
        e.kind === 'timer' || e.kind === 'counter' ? [e.name] : [],
      ),
    ),
  );
  for (let n = 1; ; n++) if (!used.has(`${letter}${n}`)) return `${letter}${n}`;
}

export function makeElement(rungs: Rung[], t: ElementTemplate, id: string): LadderElement {
  switch (t) {
    case 'no':
    case 'nc':
    case 'p':
    case 'n':
      return { id, kind: 'contact', type: t, operand: '' };
    case 'out':
    case 'set':
    case 'reset':
      return { id, kind: 'coil', type: t, operand: '' };
    case 'TON':
    case 'TOF':
    case 'TP':
      return { id, kind: 'timer', type: t, name: nextInstance(rungs, 'T'), ptMs: 1000 };
    case 'CTU':
    case 'CTD':
      return {
        id,
        kind: 'counter',
        type: t,
        name: nextInstance(rungs, 'C'),
        pv: 3,
        resetOperand: '',
      };
  }
}

export interface Location {
  rung: Rung;
  list: LadderElement[];
  index: number;
  /** Parallel element that owns `list` (null when `list` is the rung itself). */
  parent: Extract<LadderElement, { kind: 'parallel' }> | null;
}

function findIn(
  rung: Rung,
  list: LadderElement[],
  id: string,
  parent: Location['parent'],
): Location | null {
  for (let i = 0; i < list.length; i++) {
    const e = list[i]!;
    if (e.id === id) return { rung, list, index: i, parent };
    if (e.kind === 'parallel') {
      for (const b of e.branches) {
        const found = findIn(rung, b, id, e);
        if (found) return found;
      }
    }
  }
  return null;
}

export function locate(rungs: Rung[], id: string): Location | null {
  for (const r of rungs) {
    const found = findIn(r, r.elements, id, null);
    if (found) return found;
  }
  return null;
}

export function findElement(rungs: Rung[], id: string): LadderElement | null {
  const loc = locate(rungs, id);
  return loc ? loc.list[loc.index]! : null;
}

/** Inserts after the element `afterId`, or at the end of the rung when afterId is null. */
export function insertElement(
  rungs: Rung[],
  rungId: string,
  afterId: string | null,
  element: LadderElement,
): void {
  if (afterId) {
    const loc = locate(rungs, afterId);
    if (loc) {
      loc.list.splice(loc.index + 1, 0, element);
      return;
    }
  }
  rungs.find((r) => r.id === rungId)?.elements.push(element);
}

/**
 * Opens a parallel branch around an element with `element` as the new branch;
 * on a parallel element, adds one more branch.
 */
export function addParallel(
  rungs: Rung[],
  targetId: string,
  element: LadderElement,
  parId: string,
): void {
  const loc = locate(rungs, targetId);
  if (!loc) return;
  const target = loc.list[loc.index]!;
  if (target.kind === 'parallel') {
    target.branches.push([element]);
    return;
  }
  loc.list[loc.index] = { id: parId, kind: 'parallel', branches: [[target], [element]] };
}

/** Removes an element; empty branches disappear and a single-branch parallel is unwrapped. */
export function removeElement(rungs: Rung[], id: string): void {
  const loc = locate(rungs, id);
  if (!loc) return;
  loc.list.splice(loc.index, 1);
  const par = loc.parent;
  if (!par) return;
  par.branches = par.branches.filter((b) => b.length > 0);
  if (par.branches.length <= 1) {
    const outer = locate(rungs, par.id);
    if (!outer) return;
    outer.list.splice(outer.index, 1, ...(par.branches[0] ?? []));
  }
}

export function updateElement(rungs: Rung[], id: string, patch: Partial<LadderElement>): void {
  const loc = locate(rungs, id);
  if (!loc) return;
  Object.assign(loc.list[loc.index]!, patch);
}

export function addRung(rungs: Rung[], afterRungId: string | null): string {
  const id = newId(rungs, 'r');
  const at = afterRungId ? rungs.findIndex((r) => r.id === afterRungId) + 1 : rungs.length;
  rungs.splice(at <= 0 ? rungs.length : at, 0, { id, comment: '', elements: [] });
  return id;
}

export function removeRung(rungs: Rung[], rungId: string): void {
  const i = rungs.findIndex((r) => r.id === rungId);
  if (i >= 0) rungs.splice(i, 1);
}

export function moveRung(rungs: Rung[], rungId: string, delta: -1 | 1): void {
  const i = rungs.findIndex((r) => r.id === rungId);
  const j = i + delta;
  if (i < 0 || j < 0 || j >= rungs.length) return;
  const [r] = rungs.splice(i, 1);
  rungs.splice(j, 0, r!);
}
