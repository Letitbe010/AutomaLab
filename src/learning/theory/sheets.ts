/** Theory sheets (SPEC §8.3): Markdown files with front matter, bundled at build time. */
import type { Domain } from '../../core/types';
import { parseFrontmatter, type FrontValue } from './frontmatter';

export type ContentStatus = 'draft' | 'reviewed';

export interface TheoryRelated {
  theory: string[];
  templates: string[];
  exercises: string[];
  calculators: string[];
}

export interface TheorySheet {
  id: string;
  title: string;
  domain: Domain;
  tags: string[];
  related: TheoryRelated;
  /** Bibliographic sources (book, section, pages). */
  sources: string[];
  status: ContentStatus;
  /** Markdown body, without front matter. */
  body: string;
  file: string;
}

const list = (v: FrontValue | undefined): string[] =>
  Array.isArray(v) ? v : typeof v === 'string' && v !== '' ? [v] : [];

export function sheetFromMarkdown(file: string, text: string): TheorySheet {
  const { data, body } = parseFrontmatter(text);
  const related = (
    typeof data.related === 'object' && !Array.isArray(data.related) ? data.related : {}
  ) as Record<string, string | string[]>;
  const id = typeof data.id === 'string' ? data.id : '';
  if (!id) throw new Error(`${file}: missing id`);
  return {
    id,
    title: typeof data.title === 'string' ? data.title : id,
    domain: (typeof data.domain === 'string' ? data.domain : 'pneumatic') as Domain,
    tags: list(data.tags),
    related: {
      theory: list(related.theory),
      templates: list(related.templates),
      exercises: list(related.exercises),
      calculators: list(related.calculators),
    },
    sources: list(data.sources),
    status: data.status === 'reviewed' ? 'reviewed' : 'draft',
    body,
    file,
  };
}

const files = import.meta.glob('./**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

export const THEORY_SHEETS: TheorySheet[] = Object.entries(files)
  .map(([file, text]) => sheetFromMarkdown(file, text))
  .sort((a, b) => a.file.localeCompare(b.file));

const byId = new Map(THEORY_SHEETS.map((s) => [s.id, s]));

export const getSheet = (id: string): TheorySheet | undefined => byId.get(id);

/** Full-text and tag search (SPEC §8.3.4). */
export function searchSheets(query: string, domain?: Domain): TheorySheet[] {
  const q = query.trim().toLowerCase();
  return THEORY_SHEETS.filter(
    (s) =>
      (!domain || s.domain === domain) &&
      (!q ||
        s.title.toLowerCase().includes(q) ||
        s.tags.some((t) => t.toLowerCase().includes(q)) ||
        s.body.toLowerCase().includes(q)),
  );
}
