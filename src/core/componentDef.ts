import type { ReactNode } from 'react';
import type { Domain, ParamValue, Params, PortKind } from './types';

/** Port definition. Position is relative to the component origin, in grid units. */
export interface PortDef {
  id: string;
  kind: PortKind;
  x: number;
  y: number;
  /** Exhaust port that vents to atmosphere when left unconnected (no "free port" warning). */
  vent?: boolean;
  /** Pilot (control) port: lines attached to it are drawn dashed (ISO 1219, Creus app. 8.2). */
  pilot?: boolean;
  /** May stay unconnected without a "free port" warning (PLC terminals). */
  optional?: boolean;
}

interface ParamDefBase {
  key: string;
  /** i18n key for the property label. */
  labelKey: string;
}

export type ParamDef =
  | (ParamDefBase & {
      type: 'number';
      default: number;
      unit?: string;
      min?: number;
      max?: number;
    })
  | (ParamDefBase & { type: 'boolean'; default: boolean })
  | (ParamDefBase & { type: 'string'; default: string })
  | (ParamDefBase & { type: 'string[]'; default: string[] })
  | (ParamDefBase & {
      type: 'enum';
      default: string;
      options: { value: string; labelKey: string }[];
    })
  /** Label of a cylinder in the same project (mechanical coupling, SPEC §6.1 step 6). */
  | (ParamDefBase & { type: 'cylinderRef'; default: string });

export interface SymbolProps<S> {
  state: S;
  params: Params;
}

/** Renders the component symbol in local coordinates (pixels, origin at 0,0). */
export type SymbolRenderer<S> = (props: SymbolProps<S>) => ReactNode;

/**
 * Component plugin contract (SPEC §3.2). Behaviour hooks (logic, physics,
 * electric, interactive) are added in later phases.
 */
export interface ComponentDef<S = unknown> {
  type: string;
  domain: Domain;
  /** Library sub-group within the domain (i18n key `group.<id>`). */
  group: string;
  /** i18n key of the display name. */
  nameKey: string;
  /** i18n key of the short contextual help text (SPEC §7.4). */
  helpKey?: string;
  /** Placeholders for nameKey/helpKey; each value is itself an i18n key (e.g. an operator name). */
  textVars?: Record<string, string>;
  theoryRef?: string;
  /** Suggested label prefix (e.g. "1A", "1V", "0Z"); numbering is added by the editor. Empty = no label. */
  labelPrefix: string;
  /** Hit/selection box in grid units: [x, y, width, height], local coordinates. */
  bounds: [number, number, number, number];
  /** Where the label text is anchored, in grid units (local). Defaults to the bounds' top-left. */
  labelAt?: [number, number];
  /** Not shown in the library (e.g. wire junctions, created by the editor). */
  libraryHidden?: boolean;
  /**
   * Cylinders: where limit-valve marks are drawn (local pixels) for the
   * retracted (−) and extended (+) end positions.
   */
  limitMarks?: { '-': [number, number]; '+': [number, number] };
  ports: PortDef[];
  params: ParamDef[];
  symbol: SymbolRenderer<S>;
  initState(params: Params): S;
  /** Named example states for the symbol gallery (SPEC §9). */
  previewStates?: { nameKey: string; vars?: Record<string, string>; state: S }[];
}

export type DefLookup = (type: string) => ComponentDef<unknown> | undefined;

export function defaultParams(def: Pick<ComponentDef, 'params'>): Params {
  const out: Params = {};
  for (const p of def.params) {
    out[p.key] = (Array.isArray(p.default) ? [...p.default] : p.default) as ParamValue;
  }
  return out;
}
