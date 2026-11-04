import { parseFrontmatter } from '../../src/learning/theory/frontmatter';

describe('parseFrontmatter', () => {
  it('reads scalars, lists and one nested level', () => {
    const { data, body } = parseFrontmatter(
      '---\nid: a\ntags: [x, y]\nrelated:\n  theory: [b]\n  templates: []\nstatus: draft\n---\n\n## Body',
    );
    expect(data).toEqual({
      id: 'a',
      tags: ['x', 'y'],
      related: { theory: ['b'], templates: [] },
      status: 'draft',
    });
    expect(body.trim()).toBe('## Body');
  });

  it('accepts quoted items with commas, single quotes and lists spread over lines', () => {
    const { data } = parseFrontmatter(
      '---\nsources:\n  [\n    \'Creus, Neumática, 2007\',\n    "ISO 1219-1",\n  ]\nid: z\n---\n',
    );
    expect(data.sources).toEqual(['Creus, Neumática, 2007', 'ISO 1219-1']);
    expect(data.id).toBe('z');
  });

  it('returns the whole text as body without front matter', () => {
    expect(parseFrontmatter('hola').body).toBe('hola');
  });
});
