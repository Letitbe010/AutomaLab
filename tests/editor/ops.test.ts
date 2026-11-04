import { produce } from 'immer';
import { createEmptyProject } from '../../src/core/project';
import type { Project } from '../../src/core/types';
import { validateProject } from '../../src/core/validation';
import { getComponentDef } from '../../src/components/registry';
import {
  addComponent,
  connect,
  copyItems,
  deleteItems,
  insertBendPoint,
  JUNCTION_TYPE,
  moveComponents,
  pasteItems,
  rotateComponents,
  setParam,
  splitWire,
  wirePolyline,
} from '../../src/ui/editor/model/ops';

/** Source at (100,300) -> valve 3/2 at (90,160) -> cylinder at (90,60). */
function circuit() {
  let ids: Record<string, string> = {};
  const p = produce(createEmptyProject('t'), (d: Project) => {
    const s = addComponent(d, 'pn.source', 100, 300);
    const v = addComponent(d, 'pn.valve.3-2.button-spring', 90, 160);
    const c = addComponent(d, 'pn.cyl.single', 90, 60);
    ids = { s, v, c };
  });
  return { p, ids };
}

describe('editor operations', () => {
  it('adds components snapped to the grid with suggested labels', () => {
    const p = produce(createEmptyProject('t'), (d: Project) => {
      addComponent(d, 'pn.cyl.single', 103, 57);
      addComponent(d, 'pn.cyl.single', 0, 0);
      addComponent(d, 'pn.valve.3-2.button-spring', 0, 0);
    });
    expect(p.components.map((c) => [c.id, c.x, c.y, c.params.label])).toEqual([
      ['c1', 100, 60, '1A'],
      ['c2', 0, 0, '2A'],
      ['c3', 0, 0, '1V1'],
    ]);
  });

  it('connects compatible ports and refuses duplicates and same port', () => {
    const { p, ids } = circuit();
    let results: unknown[] = [];
    const next = produce(p, (d) => {
      results = [
        connect(d, [ids.s!, '1'], [ids.v!, '1']),
        connect(d, [ids.v!, '1'], [ids.s!, '1']),
        connect(d, [ids.v!, '2'], [ids.v!, '2']),
      ];
    });
    expect(results).toEqual([
      { ok: true, id: 'w1' },
      { ok: false, reason: 'duplicate' },
      { ok: false, reason: 'samePort' },
    ]);
    expect(next.connections).toHaveLength(1);
  });

  it('routes connections orthogonally between port positions', () => {
    const { p, ids } = circuit();
    const next = produce(p, (d) => {
      connect(d, [ids.s!, '1'], [ids.v!, '1']);
    });
    // source port 1 at (100, 270); valve port 1 at (100, 210): straight vertical line
    expect(wirePolyline(next, next.connections[0]!)).toEqual([
      [100, 270],
      [100, 210],
    ]);
  });

  it('splits a line with a T-junction and keeps both halves connected', () => {
    const { p, ids } = circuit();
    let jid: string | null = null;
    const next = produce(p, (d) => {
      connect(d, [ids.v!, '2'], [ids.c!, 'A']);
      jid = splitWire(d, 'w1', [101, 122]);
      connect(d, [ids.v!, '3'], [jid!, 'j']);
    });
    const j = next.components.find((c) => c.id === jid)!;
    expect(j.type).toBe(JUNCTION_TYPE);
    expect([j.x, j.y]).toEqual([100, 120]);
    expect(next.connections.map((w) => [w.from, w.to])).toEqual([
      [
        [ids.v, '2'],
        [jid, 'j'],
      ],
      [
        [jid, 'j'],
        [ids.c, 'A'],
      ],
      [
        [ids.v, '3'],
        [jid, 'j'],
      ],
    ]);
    const codes = validateProject(next, getComponentDef).map((i) => i.code);
    expect(codes).not.toContain('missingPort');
    expect(codes).not.toContain('kindMismatch');
  });

  it('deletes components with their lines and removes orphan junctions', () => {
    const { p, ids } = circuit();
    const next = produce(p, (d) => {
      connect(d, [ids.v!, '2'], [ids.c!, 'A']);
      const j = splitWire(d, 'w1', [100, 120])!;
      connect(d, [ids.v!, '3'], [j, 'j']);
      deleteItems(d, [ids.v!], []);
    });
    // Only the cylinder line to the junction survives, so the junction stays.
    expect(next.connections).toHaveLength(1);
    const next2 = produce(next, (d) => deleteItems(d, [ids.c!], []));
    expect(next2.components.some((c) => c.type === JUNCTION_TYPE)).toBe(false);
  });

  it('moves bend points only when both ends move', () => {
    const { p, ids } = circuit();
    const next = produce(p, (d) => {
      connect(d, [ids.s!, '1'], [ids.v!, '1'], [[150, 240]]);
      connect(d, [ids.v!, '2'], [ids.c!, 'A'], [[200, 100]]);
      moveComponents(d, [ids.s!, ids.v!], 10, 20);
    });
    expect(next.connections[0]!.points).toEqual([[160, 260]]);
    expect(next.connections[1]!.points).toEqual([[200, 100]]);
  });

  it('rotates in 90 degree steps', () => {
    const { p, ids } = circuit();
    const next = produce(p, (d) => {
      for (let i = 0; i < 5; i++) rotateComponents(d, [ids.c!]);
    });
    expect(next.components.find((c) => c.id === ids.c)!.rot).toBe(90);
  });

  it('inserts a bend point on the clicked segment', () => {
    const { p, ids } = circuit();
    const next = produce(p, (d) => {
      connect(d, [ids.s!, '1'], [ids.v!, '1']);
      insertBendPoint(d, 'w1', [101, 241]);
    });
    expect(next.connections[0]!.points).toEqual([[100, 240]]);
  });

  it('copies and pastes with new ids, offset and fresh labels', () => {
    const { p, ids } = circuit();
    const withWire = produce(p, (d) => {
      connect(d, [ids.v!, '2'], [ids.c!, 'A']);
    });
    const clip = copyItems(withWire, [ids.v!, ids.c!]);
    let created: string[] = [];
    const next = produce(withWire, (d) => {
      created = pasteItems(d, clip, 20, 20);
    });
    expect(created).toEqual(['c4', 'c5']);
    const pasted = next.components.filter((c) => created.includes(c.id));
    expect(pasted.map((c) => c.params.label)).toEqual(['1V2', '2A']);
    expect(pasted.map((c) => [c.x, c.y])).toEqual([
      [110, 180],
      [110, 80],
    ]);
    expect(next.connections[1]).toMatchObject({ from: ['c4', '2'], to: ['c5', 'A'] });
  });
});

describe('setParam on roller valves', () => {
  it('renames a roller a0/a1 when it is bound, but keeps custom labels', () => {
    const p = produce(createEmptyProject('t'), (d: Project) => {
      addComponent(d, 'pn.cyl.double', 0, 0); // 1A
      addComponent(d, 'pn.valve.3-2.roller-spring', 0, 100); // 1S1
      addComponent(d, 'pn.valve.3-2.roller-spring', 0, 200); // 1S2
    });
    const next = produce(p, (d) => {
      setParam(d, 'c2', 'cylinder', '1A');
      setParam(d, 'c2', 'at', '-');
      d.components[2]!.params.label = 'Atea';
      setParam(d, 'c3', 'cylinder', '1A');
    });
    expect(next.components[1]!.params.label).toBe('a0');
    expect(next.components[2]!.params.label).toBe('Atea');
  });
});
