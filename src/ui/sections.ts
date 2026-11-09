export const SECTIONS = [
  'editor',
  'templates',
  'exercises',
  'generator',
  'theory',
  'progress',
] as const;

export type SectionId = (typeof SECTIONS)[number];
