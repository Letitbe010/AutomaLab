/** Content tests for all theory sheets (SPEC §11). */
import { COMPONENT_DEFS, getComponentDef } from '../../src/components/registry';
import { getCalculator } from '../../src/learning/calculators';
import {
  airPerCycleNl,
  compressionRatio,
  cylinderForceN,
} from '../../src/learning/calculators/pneumatic';
import { embeddedSymbols, renderMarkdown, theoryLinks } from '../../src/learning/markdown';
import { getSheet, searchSheets, THEORY_SHEETS } from '../../src/learning/theory/sheets';

/** Number as written in the sheets' KaTeX: decimal comma as {,}. */
const fmt = (n: number, digits: number) => n.toFixed(digits).replace('.', '{,}');

describe('theory sheets', () => {
  it('there are at least five pneumatic sheets with unique ids', () => {
    const pneumatic = THEORY_SHEETS.filter((s) => s.domain === 'pneumatic');
    expect(pneumatic.length).toBeGreaterThanOrEqual(5);
    const ids = THEORY_SHEETS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  describe.each(THEORY_SHEETS.map((s) => [s.id, s] as const))('%s', (_id, sheet) => {
    it('has a title, tags, sources and a status', () => {
      expect(sheet.title.length).toBeGreaterThan(3);
      expect(sheet.tags.length).toBeGreaterThan(0);
      expect(sheet.sources.length).toBeGreaterThan(0);
      expect(['draft', 'reviewed']).toContain(sheet.status);
    });

    it('renders every KaTeX formula without errors', () => {
      expect(() => renderMarkdown(sheet.body, { strict: true })).not.toThrow();
      if (sheet.body.includes('$')) expect(renderMarkdown(sheet.body)).toContain('class="katex');
    });

    it('links only to existing sheets, calculators and library symbols', () => {
      for (const id of [...sheet.related.theory, ...theoryLinks(sheet.body)]) {
        expect(getSheet(id), id).toBeDefined();
      }
      for (const id of sheet.related.calculators) expect(getCalculator(id), id).toBeDefined();
      for (const type of embeddedSymbols(sheet.body)) {
        expect(getComponentDef(type), type).toBeDefined();
      }
    });

    it('has the concept and common-mistakes sections (SPEC §8.3.1)', () => {
      for (const h of ['## Kontzeptua', '## Ohiko akatsak']) expect(sheet.body).toContain(h);
    });
  });

  it('every component theory reference points to an existing sheet', () => {
    for (const def of COMPONENT_DEFS) {
      if (def.theoryRef) expect(getSheet(def.theoryRef), def.type).toBeDefined();
    }
  });

  it('the cylinder sheet uses the same numbers as the calculator functions', () => {
    const body = getSheet('pn-zilindro-indarra')!.body;
    const ext = cylinderForceN({
      pressureBar: 6,
      boreMm: 32,
      efficiency: 0.9,
      direction: 'extend',
    });
    const ret = cylinderForceN({
      pressureBar: 6,
      boreMm: 32,
      rodMm: 12,
      efficiency: 0.9,
      direction: 'retract',
    });
    const cycle = airPerCycleNl({
      pressureBar: 6,
      boreMm: 32,
      rodMm: 12,
      strokeMm: 100,
      doubleActing: true,
    });
    expect(body).toContain(String.raw`\approx ${Math.round(ext)}\ \text{N}`);
    expect(body).toContain(String.raw`\approx ${Math.round(ret)}\ \text{N}`);
    expect(body).toContain(String.raw`\approx ${fmt(compressionRatio(6), 2)}`);
    expect(body).toContain(String.raw`\approx ${fmt(cycle, 2)}\ \text{Nl}`);
  });

  it('search finds sheets by title, tag and body text', () => {
    expect(searchSheets('indarra').map((s) => s.id)).toContain('pn-zilindro-indarra');
    expect(searchSheets('lanzadera').map((s) => s.id)).toContain('pn-funtzio-logikoak');
    expect(searchSheets('zzzz')).toEqual([]);
  });
});
