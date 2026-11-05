import type { ComponentDef, DefLookup } from '../core/componentDef';
import { ELECTRIC_DEFS } from './electric';
import { cylinderSingle } from './pneumatic/cylinderSingle';
import { EXTRA_DEFS } from './pneumatic/extra';
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
  ...EXTRA_DEFS.map((d) => d as unknown as ComponentDef<unknown>),
  erase(fluidJunction),
  ...ELECTRIC_DEFS,
];

/** Theory sheet for each component (SPEC §7.4 "Teoria gehiago"). */
function theoryFor(type: string): string | undefined {
  if (type.startsWith('pn.cyl.')) return 'pn-zilindro-indarra';
  if (type === 'pn.valve.and' || type === 'pn.valve.or') return 'pn-funtzio-logikoak';
  if (/^pn\.(valve\.(3-2|5-2|5-3)|timer\.|valve\.sequence)/.test(type)) return 'pn-balbulak';
  if (['pn.source', 'pn.gauge', 'pn.valve.pressure-reg', 'pn.service-unit'].includes(type)) {
    return 'pn-presioa';
  }
  return undefined;
}

for (const def of COMPONENT_DEFS) {
  const ref = def.theoryRef ?? theoryFor(def.type);
  if (ref) def.theoryRef = ref;
}

const byType = new Map(COMPONENT_DEFS.map((d) => [d.type, d]));

export const getComponentDef: DefLookup = (type) => byType.get(type);
