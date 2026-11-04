/**
 * Circuit templates (SPEC §8.5): one folder per template with template.json,
 * circuit.automalab.json and description.md, bundled at build time.
 */
import { parseProject } from '../../core/serialization';
import type { Domain, Project, SimulationLevel } from '../../core/types';

export interface TemplateMeta {
  id: string;
  title: string;
  domain: Domain;
  /** 1 = basic, 2 = intermediate, 3 = advanced. */
  level: 1 | 2 | 3;
  tags: string[];
  simulationLevel: SimulationLevel;
  theoryRefs: string[];
  status: 'draft' | 'reviewed';
  /** One-line summary for the catalog card. */
  summary: string;
}

export interface Template extends TemplateMeta {
  folder: string;
  circuit: Project;
  description: string;
}

const metas = import.meta.glob<unknown>('./*/template.json', { import: 'default', eager: true });
const circuits = import.meta.glob<string>('./*/circuit.automalab.json', {
  query: '?raw',
  import: 'default',
  eager: true,
});
const descriptions = import.meta.glob<string>('./*/description.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

function isMeta(v: unknown): v is TemplateMeta {
  const m = v as Partial<TemplateMeta> | null;
  return (
    typeof m === 'object' &&
    m !== null &&
    typeof m.id === 'string' &&
    typeof m.title === 'string' &&
    typeof m.summary === 'string' &&
    typeof m.domain === 'string' &&
    (m.level === 1 || m.level === 2 || m.level === 3) &&
    Array.isArray(m.tags) &&
    Array.isArray(m.theoryRefs) &&
    (m.status === 'draft' || m.status === 'reviewed')
  );
}

function load(): Template[] {
  const list: Template[] = [];
  for (const [file, meta] of Object.entries(metas)) {
    const dir = file.slice(0, file.lastIndexOf('/'));
    const folder = dir.slice(2);
    if (!isMeta(meta)) throw new Error(`${folder}/template.json: invalid metadata`);
    const text = circuits[`${dir}/circuit.automalab.json`];
    if (text === undefined) throw new Error(`${folder}: circuit.automalab.json missing`);
    const parsed = parseProject(text);
    if (!parsed.ok) throw new Error(`${folder}: ${JSON.stringify(parsed.error)}`);
    list.push({
      ...meta,
      folder,
      circuit: parsed.project,
      description: descriptions[`${dir}/description.md`] ?? '',
    });
  }
  return list.sort((a, b) => a.id.localeCompare(b.id));
}

export const TEMPLATES: readonly Template[] = load();

export const getTemplate = (id: string) => TEMPLATES.find((tpl) => tpl.id === id);

/** Templates that reference a theory sheet. */
export const templatesForTheory = (sheetId: string) =>
  TEMPLATES.filter((tpl) => tpl.theoryRefs.includes(sheetId));

/** A fresh copy of the template circuit, linked back to the template. */
export function templateCopy(tpl: Template): Project {
  return { ...structuredClone(tpl.circuit), name: tpl.title, templateId: tpl.id };
}

/** Component labels referenced from a description: [1V1](comp:1V1). */
export function componentLinks(text: string): string[] {
  return [...text.matchAll(/\]\(comp:([^)\s]+)\)/g)].map((m) => decodeURIComponent(m[1]!));
}

export interface TemplateFilter {
  domain?: Domain | '';
  level?: number | 0;
  tag?: string;
}

export function filterTemplates(list: readonly Template[], f: TemplateFilter): Template[] {
  return list.filter(
    (tpl) =>
      (!f.domain || tpl.domain === f.domain) &&
      (!f.level || tpl.level === f.level) &&
      (!f.tag || tpl.tags.includes(f.tag)),
  );
}

export const allTags = (list: readonly Template[]) =>
  [...new Set(list.flatMap((tpl) => tpl.tags))].sort((a, b) => a.localeCompare(b, 'eu'));
