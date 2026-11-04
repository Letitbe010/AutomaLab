import {
  CURRENT_SCHEMA_VERSION,
  type ComponentInstance,
  type Connection,
  type Project,
  type Rotation,
} from './types';

export const FILE_EXTENSION = '.automalab.json';

export type ParseError =
  | { code: 'invalidJson' }
  | { code: 'notAProject' }
  | { code: 'newerVersion'; version: number }
  | { code: 'invalidField'; path: string };

export type ParseResult = { ok: true; project: Project } | { ok: false; error: ParseError };

/**
 * Migrations: MIGRATIONS[n] upgrades a raw object from schema n to n + 1.
 * Add an entry here (and a test) every time CURRENT_SCHEMA_VERSION is bumped.
 */
const MIGRATIONS: Record<number, (raw: Record<string, unknown>) => Record<string, unknown>> = {};

export function serializeProject(project: Project): string {
  return JSON.stringify(project, null, 2);
}

export function parseProject(text: string): ParseResult {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: { code: 'invalidJson' } };
  }
  return projectFromObject(raw);
}

export function projectFromObject(raw: unknown): ParseResult {
  if (!isObject(raw) || typeof raw.schemaVersion !== 'number') {
    return { ok: false, error: { code: 'notAProject' } };
  }
  let obj = raw;
  let version = raw.schemaVersion;
  if (version > CURRENT_SCHEMA_VERSION) {
    return { ok: false, error: { code: 'newerVersion', version } };
  }
  while (version < CURRENT_SCHEMA_VERSION) {
    const migrate = MIGRATIONS[version];
    if (!migrate) return { ok: false, error: { code: 'notAProject' } };
    obj = migrate(obj);
    version += 1;
  }
  try {
    return { ok: true, project: readProject(obj) };
  } catch (e) {
    if (e instanceof FieldError)
      return { ok: false, error: { code: 'invalidField', path: e.path } };
    throw e;
  }
}

class FieldError extends Error {
  constructor(readonly path: string) {
    super(`Invalid field: ${path}`);
  }
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function str(v: unknown, path: string): string {
  if (typeof v !== 'string') throw new FieldError(path);
  return v;
}

function num(v: unknown, path: string): number {
  if (typeof v !== 'number' || !Number.isFinite(v)) throw new FieldError(path);
  return v;
}

function bool(v: unknown, path: string): boolean {
  if (typeof v !== 'boolean') throw new FieldError(path);
  return v;
}

function arr(v: unknown, path: string): unknown[] {
  if (!Array.isArray(v)) throw new FieldError(path);
  return v;
}

function obj(v: unknown, path: string): Record<string, unknown> {
  if (!isObject(v)) throw new FieldError(path);
  return v;
}

function oneOf<T extends string | number>(v: unknown, options: readonly T[], path: string): T {
  if (!options.includes(v as T)) throw new FieldError(path);
  return v as T;
}

const ROTATIONS: readonly Rotation[] = [0, 90, 180, 270];

function readComponent(v: unknown, path: string): ComponentInstance {
  const o = obj(v, path);
  const params = obj(o.params ?? {}, `${path}.params`);
  for (const [k, p] of Object.entries(params)) {
    const ok =
      typeof p === 'number' ||
      typeof p === 'boolean' ||
      typeof p === 'string' ||
      (Array.isArray(p) && p.every((x) => typeof x === 'string'));
    if (!ok) throw new FieldError(`${path}.params.${k}`);
  }
  return {
    id: str(o.id, `${path}.id`),
    type: str(o.type, `${path}.type`),
    x: num(o.x, `${path}.x`),
    y: num(o.y, `${path}.y`),
    rot: oneOf(o.rot ?? 0, ROTATIONS, `${path}.rot`),
    mirror: bool(o.mirror ?? false, `${path}.mirror`),
    params: params as ComponentInstance['params'],
  };
}

function readPortRef(v: unknown, path: string): [string, string] {
  const a = arr(v, path);
  if (a.length !== 2) throw new FieldError(path);
  return [str(a[0], `${path}[0]`), str(a[1], `${path}[1]`)];
}

function readConnection(v: unknown, path: string): Connection {
  const o = obj(v, path);
  return {
    id: str(o.id, `${path}.id`),
    kind: oneOf(o.kind, ['fluid', 'electric', 'signal'] as const, `${path}.kind`),
    from: readPortRef(o.from, `${path}.from`),
    to: readPortRef(o.to, `${path}.to`),
    points: arr(o.points ?? [], `${path}.points`).map((p, i) => {
      const pt = arr(p, `${path}.points[${i}]`);
      if (pt.length !== 2) throw new FieldError(`${path}.points[${i}]`);
      return [num(pt[0], `${path}.points[${i}][0]`), num(pt[1], `${path}.points[${i}][1]`)];
    }),
  };
}

function readProject(o: Record<string, unknown>): Project {
  const sim = obj(o.simulation, 'simulation');
  const tags = obj(o.tags ?? {}, 'tags');
  const plc = obj(o.plc ?? { io: [], ladder: [], grafcet: null }, 'plc');
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    name: str(o.name, 'name'),
    simulation: {
      level: oneOf(sim.level, ['logic', 'physics'] as const, 'simulation.level'),
      dtMs: num(sim.dtMs, 'simulation.dtMs'),
      supplyPressureBar: num(sim.supplyPressureBar, 'simulation.supplyPressureBar'),
    },
    components: arr(o.components, 'components').map((c, i) => readComponent(c, `components[${i}]`)),
    connections: arr(o.connections, 'connections').map((c, i) =>
      readConnection(c, `connections[${i}]`),
    ),
    tags: Object.fromEntries(
      Object.entries(tags).map(([k, v]) => {
        const tag = obj(v, `tags.${k}`);
        const kind = oneOf(
          tag.kind,
          ['solenoid', 'sensor', 'input', 'output', 'marker'] as const,
          `tags.${k}.kind`,
        );
        return [k, { kind }];
      }),
    ),
    plc: {
      io: arr(plc.io ?? [], 'plc.io'),
      ladder: arr(plc.ladder ?? [], 'plc.ladder'),
      grafcet: plc.grafcet ?? null,
    },
  };
}
