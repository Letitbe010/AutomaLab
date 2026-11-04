export const SECTIONS = ['editor', 'templates', 'exercises', 'theory', 'progress'] as const;

export type SectionId = (typeof SECTIONS)[number];
