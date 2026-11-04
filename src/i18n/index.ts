import eu from './eu.json';
import es from './es.json';

export type Locale = 'eu' | 'es';

type Messages = { [key: string]: string | Messages };

export type Vars = Record<string, string | number>;

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

function interpolate(text: string, vars: Vars): string {
  return text.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  );
}

/**
 * Translates a dotted key (e.g. "menu.editor"), replacing {placeholders} from vars.
 * Falls back to Basque, then to the key itself so missing strings are visible.
 */
export function t(key: string, vars: Vars = {}, locale: Locale = currentLocale): string {
  const text = lookup(catalogs[locale], key) ?? lookup(catalogs[DEFAULT_LOCALE], key) ?? key;
  return interpolate(text, vars);
}

/** True when the key exists in the Basque catalogue (used by tests). */
export function hasKey(key: string): boolean {
  return lookup(catalogs[DEFAULT_LOCALE], key) !== undefined;
}
