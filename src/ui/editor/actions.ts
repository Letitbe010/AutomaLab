/** Editor commands shared by the toolbar, keyboard shortcuts and panels. */
import { getComponentDef } from '../../components/registry';
import { transformLocal, GRID } from '../../core/geometry';
import type { Point } from '../../core/types';
import {
  addComponent,
  copyItems,
  deleteItems,
  mirrorComponents,
  pasteItems,
  rotateComponents,
} from './model/ops';
import { validateProject } from '../../core/validation';
import { useSim } from '../sim/simStore';
import { useEditor } from './store';

const s = () => useEditor.getState();
const editable = () => s().mode === 'edit';

/** Enters simulation mode; refused while the schematic has errors (SPEC §4 validation). */
export function enterSim(): boolean {
  const st = s();
  const errors = validateProject(st.project, getComponentDef).filter((i) => i.severity === 'error');
  if (errors.length) {
    st.setNotice('editor.sim.hasErrors');
    return false;
  }
  st.setMode('sim');
  st.setNotice(null);
  useSim.getState().start(st.project);
  return true;
}

export function exitSim() {
  useSim.getState().stop();
  s().setMode('edit');
}

export function screenToWorld([sx, sy]: Point): Point {
  const { view } = s();
  return [(sx - view.x) / view.zoom, (sy - view.y) / view.zoom];
}

export function addAtViewCenter(type: string) {
  if (!editable()) return;
  const { viewport, project } = s();
  // Cascade new parts so repeated clicks do not stack them exactly.
  const n = project.components.length % 6;
  const [x, y] = screenToWorld([viewport.width / 2, viewport.height / 2]);
  const id = s().apply((p) => addComponent(p, type, x + n * 20, y + n * 20));
  s().select({ components: [id] });
}

export function addAt(type: string, world: Point) {
  if (!editable()) return;
  const id = s().apply((p) => addComponent(p, type, world[0], world[1]));
  s().select({ components: [id] });
}

export function rotateSelection() {
  const ids = s().selection.components;
  if (editable() && ids.length) s().apply((p) => rotateComponents(p, ids));
}

export function mirrorSelection() {
  const ids = s().selection.components;
  if (editable() && ids.length) s().apply((p) => mirrorComponents(p, ids));
}

export function deleteSelection() {
  const { components, connections } = s().selection;
  if (!editable() || (!components.length && !connections.length)) return;
  s().apply((p) => deleteItems(p, components, connections));
  s().select({});
}

export function copySelection() {
  const ids = s().selection.components;
  if (ids.length) s().setClipboard(copyItems(s().project, ids));
}

export function paste() {
  const { clipboard, pasteCount } = s();
  if (!editable() || !clipboard) return;
  const offset = (pasteCount + 1) * 2 * GRID;
  const ids = s().apply((p) => pasteItems(p, clipboard, offset, offset));
  useEditor.setState({ pasteCount: pasteCount + 1 });
  s().select({ components: ids });
}

export function selectAll() {
  const { project } = s();
  s().select({
    components: project.components.map((c) => c.id),
    connections: project.connections.map((w) => w.id),
  });
}

export function zoomBy(factor: number, center?: Point) {
  const { view, viewport } = s();
  const [cx, cy] = center ?? [viewport.width / 2, viewport.height / 2];
  const zoom = Math.min(4, Math.max(0.25, view.zoom * factor));
  const k = zoom / view.zoom;
  s().setView({ zoom, x: cx - (cx - view.x) * k, y: cy - (cy - view.y) * k });
}

/** World-space bounding box of a placed component. */
export function componentBox(c: {
  type: string;
  x: number;
  y: number;
  rot: 0 | 90 | 180 | 270;
  mirror: boolean;
}) {
  const def = getComponentDef(c.type);
  const [bx, by, bw, bh] = def?.bounds ?? [-1, -1, 2, 2];
  const corners: Point[] = [
    [bx, by],
    [bx + bw, by],
    [bx, by + bh],
    [bx + bw, by + bh],
  ].map(([x, y]) => transformLocal([x! * GRID, y! * GRID], c.rot, c.mirror));
  const xs = corners.map((p) => p[0] + c.x);
  const ys = corners.map((p) => p[1] + c.y);
  return { x1: Math.min(...xs), y1: Math.min(...ys), x2: Math.max(...xs), y2: Math.max(...ys) };
}

export function fitView() {
  const { project, viewport } = s();
  if (!project.components.length) {
    s().setView({ x: 80, y: 80, zoom: 1.5 });
    return;
  }
  const boxes = project.components.map(componentBox);
  const x1 = Math.min(...boxes.map((b) => b.x1)) - 40;
  const y1 = Math.min(...boxes.map((b) => b.y1)) - 40;
  const x2 = Math.max(...boxes.map((b) => b.x2)) + 40;
  const y2 = Math.max(...boxes.map((b) => b.y2)) + 40;
  const zoom = Math.min(
    3,
    Math.max(0.25, Math.min(viewport.width / (x2 - x1), viewport.height / (y2 - y1))),
  );
  s().setView({
    zoom,
    x: viewport.width / 2 - ((x1 + x2) / 2) * zoom,
    y: viewport.height / 2 - ((y1 + y2) / 2) * zoom,
  });
}
