import type { Grafcet } from '../../src/core/grafcet';
import {
  addAction,
  addAndBranch,
  addBelow,
  addOrBranch,
  addPrevious,
  addStep,
  linkNext,
  moveItem,
  removeItem,
} from '../../src/ui/plc/grafcetModel';

const empty = (): Grafcet => ({ steps: [], transitions: [] });

describe('GRAFCET editing model', () => {
  it('the first step is initial and steps are numbered in order', () => {
    const g = empty();
    const a = addStep(g);
    const b = addBelow(g, a)!;
    expect(g.steps[0]).toMatchObject({ number: 1, initial: true });
    expect(g.steps[1]).toMatchObject({ id: b, number: 2, initial: false });
    expect(g.transitions[0]).toMatchObject({ from: [a], to: [b] });
  });

  it('OR divergence adds another transition from the same step, to the side', () => {
    const g = empty();
    const a = addStep(g);
    addBelow(g, a);
    addOrBranch(g, a);
    expect(g.transitions.filter((t) => t.from.includes(a))).toHaveLength(2);
    expect(g.transitions[1]!.x).toBeGreaterThan(g.transitions[0]!.x);
  });

  it('AND divergence adds another next step at the same height', () => {
    const g = empty();
    const a = addStep(g);
    const b = addBelow(g, a)!;
    const c = addAndBranch(g, g.transitions[0]!.id)!;
    expect(g.transitions[0]!.to).toEqual([b, c]);
    expect(g.steps.find((s) => s.id === c)!.y).toBe(g.steps.find((s) => s.id === b)!.y);
  });

  it('links a jump back and an AND convergence', () => {
    const g = empty();
    const a = addStep(g);
    const b = addBelow(g, a)!;
    const c = addBelow(g, b)!;
    linkNext(g, g.transitions[1]!.id, a);
    expect(g.transitions[1]!.to).toEqual([a]);
    addPrevious(g, g.transitions[1]!.id, c);
    addPrevious(g, g.transitions[1]!.id, c);
    expect(g.transitions[1]!.from).toEqual([b, c]);
  });

  it('removing a step cleans the links and drops transitions without previous steps', () => {
    const g = empty();
    const a = addStep(g);
    const b = addBelow(g, a)!;
    addBelow(g, b);
    removeItem(g, a);
    expect(g.transitions).toHaveLength(1);
    expect(g.transitions[0]!.from).toEqual([b]);
    removeItem(g, g.steps[1]!.id);
    expect(g.transitions[0]!.to).toEqual([]);
    expect(addBelow(g, g.transitions[0]!.id)).not.toBeNull();
  });

  it('snaps moves to the grid and adds actions with unique ids', () => {
    const g = empty();
    const a = addStep(g);
    moveItem(g, a, 133, 251);
    expect(g.steps[0]).toMatchObject({ x: 140, y: 260 });
    addAction(g.steps[0]!);
    addAction(g.steps[0]!);
    expect(new Set(g.steps[0]!.actions.map((x) => x.id)).size).toBe(2);
  });
});
