/**
 * Project data model (SPEC §4). Pure TypeScript: no UI, no browser APIs.
 * Coordinates are in canvas pixels; component-local port positions are in grid units.
 */

export const CURRENT_SCHEMA_VERSION = 1;

export type Domain = 'pneumatic' | 'hydraulic' | 'electric' | 'plc';

export type PortKind = 'fluid' | 'electric' | 'signal';

export type Point = [x: number, y: number];

export type Rotation = 0 | 90 | 180 | 270;

export type ParamValue = number | boolean | string | string[];

export type Params = Record<string, ParamValue>;

export interface ComponentInstance {
  id: string;
  type: string;
  x: number;
  y: number;
  rot: Rotation;
  mirror: boolean;
  params: Params;
}

/** [componentId, portId] */
export type PortRef = [componentId: string, portId: string];

export interface Connection {
  id: string;
  kind: PortKind;
  from: PortRef;
  to: PortRef;
  /** Intermediate bend points (canvas pixels), excluding the two port ends. */
  points: Point[];
}

export type SimulationLevel = 'logic' | 'physics';

export interface SimulationSettings {
  level: SimulationLevel;
  dtMs: number;
  supplyPressureBar: number;
}

export type TagKind = 'solenoid' | 'sensor' | 'input' | 'output' | 'marker';

export interface TagDef {
  kind: TagKind;
}

/** PLC content is filled in phases 5–6; kept opaque until then. */
export interface PlcData {
  io: unknown[];
  ladder: unknown[];
  grafcet: unknown;
}

export interface Project {
  schemaVersion: typeof CURRENT_SCHEMA_VERSION;
  name: string;
  simulation: SimulationSettings;
  components: ComponentInstance[];
  connections: Connection[];
  tags: Record<string, TagDef>;
  plc: PlcData;
  /** Set when the project was opened from a circuit template (SPEC §8.5). */
  templateId?: string;
  /** Set when the project is being checked against a design exercise (SPEC §8.1). */
  exerciseId?: string;
}
