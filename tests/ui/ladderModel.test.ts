import type { Rung } from '../../src/core/plc';
import {
  addParallel,
  addRung,
  findElement,
  insertElement,
  makeElement,
  moveRung,
  newId,
  removeElement,
  removeRung,
  updateElement,
} from '../../src/ui/ladder/model';

function base(): Rung[] {
  return [
    {
      id: 'r1',
      comment: '',
      elements: [
        { id: 'e1', kind: 'contact', type: 'no', operand: 'I0.0' },
        { id: 'e2', kind: 'coil', type: 'out', operand: 'Q0.0' },
      ],
    },
  ];
}

describe('ladder editing model', () => {
  it('inserts after an element or at the end of the rung', () => {
    const r = base();
    insertElement(r, 'r1', 'e1', makeElement(r, 'nc', 'e3'));
    insertElement(r, 'r1', null, makeElement(r, 'set', 'e4'));
    expect(r[0]!.elements.map((e) => e.id)).toEqual(['e1', 'e3', 'e2', 'e4']);
  });

  it('opens a parallel branch, adds branches and unwraps when one is left', () => {
    const r = base();
    addParallel(r, 'e1', makeElement(r, 'no', 'e3'), 'p1');
    const par = r[0]!.elements[0]!;
    expect(par.kind).toBe('parallel');
    addParallel(r, 'p1', makeElement(r, 'no', 'e4'), 'p2');
    expect(par.kind === 'parallel' && par.branches.length).toBe(3);
    removeElement(r, 'e4');
    removeElement(r, 'e3');
    expect(r[0]!.elements.map((e) => e.id)).toEqual(['e1', 'e2']);
  });

  it('names timers and counters T1, T2… / C1… and generates unique ids', () => {
    const r = base();
    const t1 = makeElement(r, 'TON', newId(r, 'e'));
    insertElement(r, 'r1', 'e1', t1);
    const t2 = makeElement(r, 'TP', newId(r, 'e'));
    expect(t1.kind === 'timer' && t1.name).toBe('T1');
    expect(t2.kind === 'timer' && t2.name).toBe('T2');
    expect(t2.id).not.toBe(t1.id);
    expect(makeElement(r, 'CTU', 'x').kind === 'counter').toBe(true);
  });

  it('updates, adds, moves and removes rungs', () => {
    const r = base();
    updateElement(r, 'e1', { operand: 'I0.1' });
    expect(findElement(r, 'e1')).toMatchObject({ operand: 'I0.1' });
    const id = addRung(r, null);
    moveRung(r, id, -1);
    expect(r[0]!.id).toBe(id);
    removeRung(r, id);
    expect(r.map((x) => x.id)).toEqual(['r1']);
  });
});
