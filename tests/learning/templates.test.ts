/** Content tests for the circuit templates (SPEC §8.5, §11). */
import { validateProject } from '../../src/core/validation';
import { parseProject, serializeProject } from '../../src/core/serialization';
import { getComponentDef } from '../../src/components/registry';
import { embeddedSymbols, renderMarkdown, theoryLinks } from '../../src/learning/markdown';
import {
  allTags,
  componentLinks,
  filterTemplates,
  getTemplate,
  templateCopy,
  TEMPLATES,
  templatesForTheory,
} from '../../src/learning/templates';
import { getSheet, THEORY_SHEETS } from '../../src/learning/theory/sheets';
import { position, pulse, simulate } from '../engine/helpers';

const tpl = (id: string) => {
  const t = getTemplate(id);
  if (!t) throw new Error(`missing template ${id}`);
  return t;
};
const sim = (id: string) => simulate(tpl(id).circuit);
const idOf = (id: string, label: string) =>
  tpl(id).circuit.components.find((c) => c.params.label === label)!.id;

describe('template catalog', () => {
  it('has the pneumatic and electropneumatic templates with unique ids', () => {
    const ids = TEMPLATES.map((t) => t.id);
    expect(ids).toEqual([
      'tpl-ep-01',
      'tpl-ep-02',
      'tpl-ep-03',
      'tpl-ep-04',
      'tpl-ep-05',
      'tpl-gr-01',
      'tpl-gr-02',
      'tpl-gr-03',
      'tpl-gr-04',
      'tpl-gr-05',
      'tpl-plc-01',
      'tpl-plc-02',
      'tpl-plc-03',
      'tpl-plc-04',
      'tpl-pn-01',
      'tpl-pn-02',
      'tpl-pn-03',
      'tpl-pn-04',
      'tpl-pn-05',
    ]);
    expect(new Set(TEMPLATES.map((t) => t.folder)).size).toBe(TEMPLATES.length);
  });

  describe.each(TEMPLATES.map((t) => [t.id, t] as const))('%s', (_id, t) => {
    it('folder name starts with the template id', () => {
      expect(t.folder.startsWith(`${t.id}-`)).toBe(true);
    });

    it('validates with no errors and no warnings', () => {
      expect(validateProject(t.circuit, getComponentDef)).toEqual([]);
    });

    it('starts simulating and runs 3 s without warnings', () => {
      const s = simulate(t.circuit);
      s.run(3000);
      expect(s.warnings).toEqual([]);
    });

    it('has metadata, a description and theory links that exist', () => {
      expect(t.title.length).toBeGreaterThan(5);
      expect(t.summary.length).toBeGreaterThan(10);
      expect(t.tags.length).toBeGreaterThan(0);
      expect(t.theoryRefs.length).toBeGreaterThan(0);
      for (const id of [...t.theoryRefs, ...theoryLinks(t.description)]) {
        expect(getSheet(id), id).toBeDefined();
      }
      for (const type of embeddedSymbols(t.description)) {
        expect(getComponentDef(type), type).toBeDefined();
      }
      expect(() => renderMarkdown(t.description, { strict: true })).not.toThrow();
      for (const h of ['## Funtzionamendua', '## Osagaiak', '## Proba ezazu']) {
        expect(t.description).toContain(h);
      }
    });

    it('description links point to component labels of the circuit, and all are described', () => {
      const labels = t.circuit.components.map((c) => c.params.label).filter(Boolean);
      const links = componentLinks(t.description);
      for (const l of links) expect(labels, l).toContain(l);
      for (const l of labels) expect(links, String(l)).toContain(l);
    });

    it('is linked back from its theory sheets', () => {
      for (const id of t.theoryRefs) expect(getSheet(id)!.related.templates, id).toContain(t.id);
    });
  });

  it('every template listed by a theory sheet exists', () => {
    for (const sheet of THEORY_SHEETS) {
      for (const id of sheet.related.templates) expect(getTemplate(id), id).toBeDefined();
      for (const id of sheet.related.templates) {
        expect(templatesForTheory(sheet.id).map((t) => t.id)).toContain(id);
      }
    }
  });

  it('a copy is independent from the original and keeps the link', () => {
    const t = tpl('tpl-pn-02');
    const copy = templateCopy(t);
    copy.components[0]!.x += 100;
    expect(t.circuit.components[0]!.x).not.toBe(copy.components[0]!.x);
    expect(copy.templateId).toBe('tpl-pn-02');
    const back = parseProject(serializeProject(copy));
    expect(back.ok && back.project.templateId).toBe('tpl-pn-02');
  });

  it('filters by domain, level and tag', () => {
    expect(filterTemplates(TEMPLATES, {}).length).toBe(19);
    expect(filterTemplates(TEMPLATES, { domain: 'electric' }).length).toBe(5);
    expect(filterTemplates(TEMPLATES, { domain: 'hydraulic' })).toEqual([]);
    expect(filterTemplates(TEMPLATES, { level: 1 }).every((t) => t.level === 1)).toBe(true);
    const tag = allTags(TEMPLATES)[0]!;
    expect(filterTemplates(TEMPLATES, { tag }).every((t) => t.tags.includes(tag))).toBe(true);
  });
});

describe('template behaviour', () => {
  it('tpl-pn-01: the cylinder extends only while 1S1 is pressed', () => {
    const s = sim('tpl-pn-01');
    const b = idOf('tpl-pn-01', '1S1');
    s.press(b);
    expect(s.runUntil(() => s.eventNames().includes('1A+'), 2000)).toBe(true);
    s.release(b);
    expect(s.runUntil(() => s.eventNames().includes('1A-'), 2000)).toBe(true);
  });

  it('tpl-pn-02: 1S1 extends, 1S2 retracts, and the valve remembers', () => {
    const s = sim('tpl-pn-02');
    pulse(s, idOf('tpl-pn-02', '1S1'));
    s.run(1500);
    expect(position(s, 'c1')).toBe(1);
    pulse(s, idOf('tpl-pn-02', '1S2'));
    s.run(1500);
    expect(position(s, 'c1')).toBe(0);
  });

  it('tpl-pn-03: the cylinder extends only with both buttons pressed', () => {
    const s = sim('tpl-pn-03');
    const [b1, b2] = [idOf('tpl-pn-03', '1S1'), idOf('tpl-pn-03', '1S2')];
    s.press(b1);
    s.run(1500);
    expect(position(s, 'c1')).toBe(0);
    s.press(b2);
    s.run(1500);
    expect(position(s, 'c1')).toBe(1);
    s.release(b1);
    s.run(1500);
    expect(position(s, 'c1')).toBe(0);
  });

  it('tpl-pn-04: each stroke is slowed by the throttle on its exhaust side', () => {
    const s = sim('tpl-pn-04');
    const v = idOf('tpl-pn-04', '1V1');
    const t0 = s.timeMs;
    s.press(v);
    expect(s.runUntil(() => s.eventNames().includes('1A+'), 5000)).toBe(true);
    const extend = s.timeMs - t0;
    s.release(v);
    const t1 = s.timeMs;
    expect(s.runUntil(() => s.eventNames().includes('1A-'), 5000)).toBe(true);
    const retract = s.timeMs - t1;
    // Extending exhausts through 1V3 (factor 0.4), retracting through 1V2 (0.7).
    expect(extend).toBeGreaterThan(retract);
    expect(retract).toBeGreaterThan(1100);
  });

  it('tpl-pn-05: one start pulse runs A+ B+ B- A- once', () => {
    const s = sim('tpl-pn-05');
    pulse(s, idOf('tpl-pn-05', '0S1'), 100);
    s.run(8000);
    expect(s.eventNames()).toEqual(['1A+', '2A+', '2A-', '1A-']);
  });
});
