import { getComponentDef } from '../../components/registry';
import { componentName } from '../../components/text';
import type { Reason } from '../../learning/exercises/check';
import { t } from '../../i18n';

const ev = (e: string[]) =>
  e.length ? e.map((x) => x.replace(/-$/, '−')).join(' → ') : t('exercises.none');
const typeName = (type: string) => {
  const def = getComponentDef(type);
  return def ? componentName(def) : type;
};
const sec = (ms: number) => (ms / 1000).toFixed(1).replace('.', ',');

/** Basque sentence for a failed check (SPEC §8.1: "why it failed"). */
export function reasonText(r: Reason): string {
  switch (r.code) {
    case 'invalid':
      return t('exercises.reason.invalid', { count: r.count });
    case 'missingLabel':
      return t('exercises.reason.missingLabel', { label: r.label });
    case 'notAllowed':
      return t('exercises.reason.notAllowed', { types: r.types.map(typeName).join(', ') });
    case 'events':
      return t('exercises.reason.events', { expected: ev(r.expected), got: ev(r.got) });
    case 'forbidden':
      return t('exercises.reason.forbidden', { event: ev([r.event]), t: sec(r.atMs) });
    case 'missingEvent':
      return t('exercises.reason.missingEvent', { event: ev([r.event]) });
    case 'tooFast':
      return t('exercises.reason.tooFast', { s: sec(r.ms), min: sec(r.minMs) });
    case 'tooSlow':
      return t('exercises.reason.tooSlow', { s: sec(r.ms), max: sec(r.maxMs) });
    case 'missingType':
      return t('exercises.reason.missingType', { types: r.types.map(typeName).join(' / ') });
    case 'wrongLanguage':
      return t('exercises.reason.wrongLanguage', { language: t(`grafcet.lang.${r.language}`) });
    case 'unstable':
      return t('exercises.reason.unstable');
  }
}

export { typeName };
