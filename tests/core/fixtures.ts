import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/** Reads a fixture by file name (import.meta.url is not a file URL under jsdom). */
export function readFixture(name: string): string {
  return readFileSync(join(process.cwd(), 'tests', 'core', 'fixtures', name), 'utf8');
}
