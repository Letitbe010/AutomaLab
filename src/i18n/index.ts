import eu from './eu.json';
import es from './es.json';

export type Locale = 'eu' | 'es';

type Messages = { [key: string]: string | Messages };

const catalogs: Record<Locale, Messages> = { eu, es };

const DEFAULT_LOCALE: Locale = 'eu';

let currentLocale: Locale = DEFAULT_LOCALE;

export function setLocale(locale: Locale): void {
  currentLocale = locale;
}

export function getLocale(): Locale {
  return currentLocale;
}

function lookup(messages: Messages, key: string): string | undefined {
  let node: string | Messages | undefined = messages;
  for (const part of key.split('.')) {
    if (typeof node !== 'object' || node === null) return undefined;
    node = node[part];
  }
  return typeof node === 'string' ? node : undefined;
}

/**
 * Translates a dotted key (e.g. "menu.editor").
 * Falls back to Basque, then to the key itself so missing strings are visible.
 */
export function t(key: string, locale: Locale = currentLocale): string {
  return lookup(catalogs[locale], key) ?? lookup(catalogs[DEFAULT_LOCALE], key) ?? key;
}
