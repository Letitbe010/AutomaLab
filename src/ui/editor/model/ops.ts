/**
 * Pure editing operations on a Project. They mutate the given object, so the
 * store calls them inside an Immer draft (undo/redo comes from snapshots).
 */
import { defaultParams } from '../../../core/componentDef';
import { portPosition } from '../../../core/geometry';
import type {
  ComponentInstance,
  Connection,
  ParamValue,
  Point,
  PortRef,
  Project,
} from '../../../core/types';
import { getComponentDef } from '../../../components/registry';
import { isAutoLimitLabel, limitLabel, suggestLabel } from './labels';
import { nearestOnPolyline, routeWire, snap, snapPoint } from './routing';

export const JUNCTION_TYPE = 'fluid.junction';
export const ELECTRIC_JUNCTION_TYPE = 'el.junction';
const isJunction = (type: string) => type === JUNCTION_TYPE || type === ELECTRIC_JUNCTION_TYPE;

export function newId(project: Project, prefix: string): string {
  let max = 0;
  const re = new RegExp(`^${prefix}(\\d+)$`);
  for (const item of [...project.components, ...project.connections]) {
    const m = re.exec(item.id);
    if (m) max = Math.max(max, Number(m[1]));
  }
  return `${prefix}${max + 1}`;
}

function labels(project: Project): string[] {
  return project.components
    .map((c) => c.params.label)
    .filter((l): l is string => typeof l === 'string' && l !== '');
}

export function addComponent(project: Project, type: string, x: number, y: number): string {
  const def = getComponentDef(type);
  if (!def) throw new Error(`Unknown component type: ${type}`);
  const id = newId(project, isJunction(type) ? 'j' : 'c');
  const params = defaultParams(def);
  if ('label' in params) params.label = suggestLabel(def.labelPrefix, labels(project));
  project.components.push({ id, type, x: snap(x), y: snap(y), rot: 0, mirror: false, params });
  return id;
}

export function findPort(project: Project, [compId, portId]: PortRef) {
  const comp = project.components.find((c) => c.id === compId);
  const def = comp && getComponentDef(comp.type);
  const port = def?.ports.find((p) => p.id === portId);
  return comp && port ? { comp, port } : undefined;
}

export function portPoint(project: Project, ref: PortRef): Point | undefined {
  const found = findPort(project, ref);
  return found && portPosition(found.comp, found.port);
}

/** Full routed polyline of a connection (canvas pixels), or null if an end is missing. */
export function wirePolyline(project: Project, wire: Connection): Point[] | null {
  const a = portPoint(project, wire.from);
  const b = portPoint(project, wire.to);
  return a && b ? routeWire(a, wire.points, b) : null;
}

export type ConnectResult =
  | { ok: true; id: string }
  | { ok: false; reason: 'missing' | 'samePort' | 'kindMismatch' | 'duplicate' };

export function connect(
  project: Project,
  from: PortRef,
  to: PortRef,
  points: Point[] = [],
): ConnectResult {
  const a = findPort(project, from);
  const b = findPort(project, to);
  if (!a || !b) return { ok: false, reason: 'missing' };
  if (from[0] === to[0] && from[1] === to[1]) return { ok: false, reason: 'samePort' };
  if (a.port.kind !== b.port.kind) return { ok: false, reason: 'kindMismatch' };
  const key = (r: PortRef) => r.join('\u0000');
  const dup = project.connections.some(
    (w) =>
      (key(w.from) === key(from) && key(w.to) === key(to)) ||
      (key(w.from) === key(to) && key(w.to) === key(from)),
  );
  if (dup) return { ok: false, reason: 'duplicate' };
  const id = newId(project, 'w');
  project.connections.push({
    id,
    kind: a.port.kind,
    from,
    to,
    points: points.map((pt) => snapPoint(pt)),
  });
  return { ok: true, id };
}

/**
 * Inserts a T-junction on a connection at the point closest to `at`, splitting
 * the connection in two. Returns the junction id.
 */
export function splitWire(project: Project, wireId: string, at: Point): string | null {
  const wire = project.connections.find((w) => w.id === wireId);
  if (!wire) return null;
  const poly = wirePolyline(project, wire);
  if (!poly) return null;
  const hit = nearestOnPolyline(poly, at);
  if (!hit) return null;
  const type = wire.kind === 'electric' ? ELECTRIC_JUNCTION_TYPE : JUNCTION_TYPE;
  const jid = addComponent(project, type, hit.point[0], hit.point[1]);
  const junction = project.components.find((c) => c.id === jid)!;
  // Keep the junction exactly on the line even if the line is off-grid.
  junction.x = hit.point[0];
  junction.y = hit.point[1];
  const oldTo = wire.to;
  const before = poly.slice(1, hit.index + 1);
  const after = poly.slice(hit.index + 1, -1);
  wire.to = [jid, 'j'];
  wire.points = before;
  project.connections.push({
    id: newId(project, 'w'),
    kind: wire.kind,
    from: [jid, 'j'],
    to: oldTo,
    points: after,
  });
  return jid;
}

export function deleteItems(project: Project, compIds: string[], wireIds: string[]): void {
  const comps = new Set(compIds);
  const wires = new Set(wireIds);
  project.components = project.components.filter((c) => !comps.has(c.id));
  project.connections = project.connections.filter(
    (w) => !wires.has(w.id) && !comps.has(w.from[0]) && !comps.has(w.to[0]),
  );
  // Junctions left with nothing attached are removed too.
  const used = new Set(project.connections.flatMap((w) => [w.from[0], w.to[0]]));
  project.components = project.components.filter((c) => !isJunction(c.type) || used.has(c.id));
}

/** Moves components; bend points of wires with both ends inside the set move along. */
export function moveComponents(project: Project, ids: string[], dx: number, dy: number): void {
  if (dx === 0 && dy === 0) return;
  const set = new Set(ids);
  for (const c of project.components) {
    if (!set.has(c.id)) continue;
    c.x += dx;
    c.y += dy;
  }
  for (const w of project.connections) {
    if (set.has(w.from[0]) && set.has(w.to[0])) {
      w.points = w.points.map(([x, y]) => [x + dx, y + dy]);
    }
  }
}

export function rotateComponents(project: Project, ids: string[]): void {
  const set = new Set(ids);
  for (const c of project.components) {
    if (set.has(c.id)) c.rot = ((c.rot + 90) % 360) as ComponentInstance['rot'];
  }
}

export function mirrorComponents(project: Project, ids: string[]): void {
  const set = new Set(ids);
  for (const c of project.components) if (set.has(c.id)) c.mirror = !c.mirror;
}

/** Replaces the stored bend points with the corners of the current route, so they can be edited. */
export function materializeWire(project: Project, wireId: string): void {
  const wire = project.connections.find((w) => w.id === wireId);
  const poly = wire && wirePolyline(project, wire);
  if (wire && poly) wire.points = poly.slice(1, -1);
}

export function insertBendPoint(project: Project, wireId: string, at: Point): void {
  const wire = project.connections.find((w) => w.id === wireId);
  const poly = wire && wirePolyline(project, wire);
  if (!wire || !poly) return;
  const hit = nearestOnPolyline(poly, at);
  if (!hit) return;
  const interior = poly.slice(1, -1);
  interior.splice(hit.index, 0, hit.point);
  wire.points = interior;
}

export function moveBendPoint(project: Project, wireId: string, index: number, to: Point): void {
  const wire = project.connections.find((w) => w.id === wireId);
  if (wire && index >= 0 && index < wire.points.length) wire.points[index] = snapPoint(to);
}

export function removeBendPoint(project: Project, wireId: string, index: number): void {
  const wire = project.connections.find((w) => w.id === wireId);
  if (wire) wire.points.splice(index, 1);
}

export interface Clipboard {
  components: ComponentInstance[];
  connections: Connection[];
}

export function copyItems(project: Project, compIds: string[]): Clipboard {
  const set = new Set(compIds);
  return structuredClone({
    components: project.components.filter((c) => set.has(c.id)),
    connections: project.connections.filter((w) => set.has(w.from[0]) && set.has(w.to[0])),
  });
}

/** Pastes with new ids and fresh labels, shifted by (dx, dy). Returns the new component ids. */
export function pasteItems(project: Project, clip: Clipboard, dx: number, dy: number): string[] {
  const idMap = new Map<string, string>();
  const created: string[] = [];
  for (const src of clip.components) {
    const def = getComponentDef(src.type);
    const id = newId(project, isJunction(src.type) ? 'j' : 'c');
    idMap.set(src.id, id);
    const params = structuredClone(src.params);
    if (def && typeof params.label === 'string' && params.label !== '') {
      params.label = suggestLabel(def.labelPrefix, labels(project));
    }
    project.components.push({ ...src, id, x: src.x + dx, y: src.y + dy, params });
    created.push(id);
  }
  for (const w of clip.connections) {
    project.connections.push({
      id: newId(project, 'w'),
      kind: w.kind,
      from: [idMap.get(w.from[0])!, w.from[1]],
      to: [idMap.get(w.to[0])!, w.to[1]],
      points: w.points.map(([x, y]) => [x + dx, y + dy]),
    });
  }
  return created;
}

/**
 * Sets a parameter. Binding a roller valve to a cylinder (or changing its end
 * position) renames it a0/a1, b0/b1… unless the user typed a custom label.
 */
export function setParam(project: Project, compId: string, key: string, value: ParamValue): void {
  const comp = project.components.find((c) => c.id === compId);
  if (!comp) return;
  comp.params[key] = value;
  const def = getComponentDef(comp.type);
  const isLimit = def?.params.some((p) => p.type === 'cylinderRef');
  if (!isLimit || (key !== 'cylinder' && key !== 'at')) return;
  const current = typeof comp.params.label === 'string' ? comp.params.label : '';
  if (def?.domain === 'electric') {
    // Electric sensors: 1B1 (retracted) / 1B2 (extended) after the cylinder number (ISO 1219-2).
    const n = /^(\d+)A$/.exec(String(comp.params.cylinder ?? ''));
    if (n && (current === '' || /^\d+B\d+$/.test(current))) {
      comp.params.label = n[1] + 'B' + (comp.params.at === '-' ? 1 : 2);
    }
    return;
  }
  const auto = limitLabel(String(comp.params.cylinder ?? ''), String(comp.params.at ?? '+'));
  if (auto && isAutoLimitLabel(current)) comp.params.label = auto;
}
