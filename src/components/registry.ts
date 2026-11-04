import type { ComponentDef, DefLookup } from '../core/componentDef';
import { cylinderSingle } from './pneumatic/cylinderSingle';
import { fluidJunction } from './pneumatic/junction';
import {
  andValve,
  checkValve,
  cylinderDouble,
  exhaust,
  flowControlOneWay,
  gauge,
  orValve,
} from './pneumatic/misc';
import { pneumaticSource } from './pneumatic/source';
import { VALVE_DEFS } from './pneumatic/valves';

/**
 * Erases the state type so definitions can share one list. Safe because each
 * definition only ever receives states produced by its own initState/previewStates.
 */
function erase<S>(def: ComponentDef<S>): ComponentDef<unknown> {
  return def as unknown as ComponentDef<unknown>;
}

/** All available component definitions. Adding a component = one file + one entry here. */
export const COMPONENT_DEFS: readonly ComponentDef<unknown>[] = [
  erase(pneumaticSource),
  erase(exhaust),
  erase(cylinderSingle),
  erase(cylinderDouble),
  ...VALVE_DEFS.map(erase),
  erase(checkValve),
  erase(flowControlOneWay),
  erase(orValve),
  erase(andValve),
  erase(gauge),
  erase(fluidJunction),
];

const byType = new Map(COMPONENT_DEFS.map((d) => [d.type, d]));

export const getComponentDef: DefLookup = (type) => byType.get(type);
