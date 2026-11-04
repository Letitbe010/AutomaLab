import { createEmptyProject } from '../../src/core/project';
import { addComponent, moveComponents } from '../../src/ui/editor/model/ops';
import { HISTORY_LIMIT, useEditor } from '../../src/ui/editor/store';

const st = () => useEditor.getState();

beforeEach(() => {
  st().loadProject(createEmptyProject('t'));
});

describe('editor store history', () => {
  it('undoes and redoes edits', () => {
    st().apply((p) => addComponent(p, 'pn.source', 0, 0));
    st().apply((p) => addComponent(p, 'pn.source', 50, 0));
    expect(st().project.components).toHaveLength(2);
    st().undo();
    expect(st().project.components).toHaveLength(1);
    st().redo();
    expect(st().project.components).toHaveLength(2);
  });

  it('clears redo after a new edit', () => {
    st().apply((p) => addComponent(p, 'pn.source', 0, 0));
    st().undo();
    st().apply((p) => addComponent(p, 'pn.cyl.single', 0, 0));
    expect(st().future).toHaveLength(0);
  });

  it('keeps at least 100 undo steps (SPEC §7.2)', () => {
    for (let i = 0; i < HISTORY_LIMIT + 20; i++) {
      st().apply((p) => addComponent(p, 'pn.source', i * 10, 0));
    }
    expect(HISTORY_LIMIT).toBeGreaterThanOrEqual(100);
    expect(st().past).toHaveLength(HISTORY_LIMIT);
  });

  it('records a drag gesture as one undo step', () => {
    const id = st().apply((p) => addComponent(p, 'pn.source', 0, 0));
    st().beginGesture();
    for (let i = 0; i < 5; i++) st().apply((p) => moveComponents(p, [id], 10, 0), false);
    st().endGesture();
    expect(st().project.components[0]!.x).toBe(50);
    st().undo();
    expect(st().project.components[0]!.x).toBe(0);
  });

  it('drops the gesture step when nothing changed (plain click)', () => {
    st().apply((p) => addComponent(p, 'pn.source', 0, 0));
    const before = st().past.length;
    st().beginGesture();
    st().endGesture();
    expect(st().past).toHaveLength(before);
  });

  it('prunes the selection after undo removes selected items', () => {
    const id = st().apply((p) => addComponent(p, 'pn.source', 0, 0));
    st().select({ components: [id] });
    st().undo();
    expect(st().selection.components).toEqual([]);
  });
});
