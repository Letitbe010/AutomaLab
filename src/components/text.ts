import type { ComponentDef } from '../core/componentDef';
import { t } from '../i18n';

function vars(def: Pick<ComponentDef, 'textVars'>): Record<string, string> {
  return Object.fromEntries(Object.entries(def.textVars ?? {}).map(([k, key]) => [k, t(key)]));
}

/** Display name of a component, with its placeholders resolved. */
export function componentName(def: Pick<ComponentDef, 'nameKey' | 'textVars'>): string {
  return t(def.nameKey, vars(def));
}

/** Short contextual help (SPEC §7.4), or undefined. */
export function componentHelp(def: Pick<ComponentDef, 'helpKey' | 'textVars'>): string | undefined {
  return def.helpKey ? t(def.helpKey, vars(def)) : undefined;
}

/** Library sub-groups in display order. */
export const GROUP_ORDER = [
  'supply',
  'actuators',
  'vacuum',
  'valves32',
  'valves52',
  'valves53',
  'logic',
  'measure',
  'elSupply',
  'elInputs',
  'elSensors',
  'elRelays',
  'elOutputs',
] as const;
