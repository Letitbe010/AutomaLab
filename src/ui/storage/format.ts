import { t } from '../../i18n';

const pad = (n: number) => String(n).padStart(2, '0');

/** AAAA-HH-EE hh:mm in local time (browsers lack reliable Basque locale data). */
export function formatDate(iso?: string): string {
  if (!iso) return t('storage.never');
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
