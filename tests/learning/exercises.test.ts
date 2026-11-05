/** Exercises: checker, content and reference solutions (SPEC §8.1, phase 11 acceptance). */
import { createEmptyProject } from '../../src/core/project';
import type { Project } from '../../src/core/types';
import { getComponentDef } from '../../src/components/registry';
import {
  airConsumptionNlMin,
  airPerCycleNl,
  compressionRatio,
  cylinderForceN,
} from '../../src/learning/calculators/pneumatic';
import { EXERCISES, exerciseProblem, getExercise } from '../../src/learning/exercises';
import { checkExercise, runCheck } from '../../src/learning/exercises/check';
import type { CalcExercise, DesignExercise } from '../../src/learning/exercises/types';
import { renderMarkdown, theoryLinks } from '../../src/learning/markdown';
import { isCorrect } from '../../src/learning/quiz/grade';
import { getTemplate } from '../../src/learning/templates';
import { getSheet } from '../../src/learning/theory/sheets';

const design = (id: string) => getExercise(id) as DesignExercise & { solution: Project };
const calc = (id: string) => getExercise(id) as CalcExercise;
const clone = (p: Project) => structuredClone(p);
const byLabel = (p: Project, label: string) => p.components.find((c) => c.params.label === label)!;

/** A circuit that must fail each design exercise, and why it is wrong. */
const WRONG: Record<string, () => Project> = {
  // Normally open button: the cylinder extends without pressing.
  'ex-pn-01': () => {
    const p = clone(design('ex-pn-01').solution);
    byLabel(p, '1S1').type = 'pn.valve.3-2no.button-spring';
    return p;
  },
  // AND instead of memory: a short pulse on 1S1 does nothing.
  'ex-pn-02': () => clone(design('ex-pn-04').solution),
  // AND instead of OR.
  'ex-pn-03': () => clone(design('ex-pn-04').solution),
  // OR instead of AND.
  'ex-pn-04': () => clone(design('ex-pn-03').solution),
  // Both strokes throttled: the return is too slow.
  'ex-pn-05': () => clone(getTemplate('tpl-pn-04')!.circuit),
  // No return signal.
  'ex-pn-06': () => {
    const p = clone(design('ex-pn-06').solution);
    p.connections = p.connections.filter((w) => w.to[1] !== '12');
    return p;
  },
  // Timer set far too short.
  'ex-pn-07': () => {
    const p = clone(design('ex-pn-07').solution);
    p.components.find((c) => c.type === 'pn.timer.nc')!.params.delayS = 0.2;
    return p;
  },
  // A+ B+ B- A- cascade instead of A+ B+ A- B-.
  'ex-pn-08': () => clone(getTemplate('tpl-pn-05')!.circuit),
  // Normally closed button: Y1 is energised without pressing.
  'ex-ep-01': () => {
    const p = clone(design('ex-ep-01').solution);
    byLabel(p, 'S1').type = 'el.button.nc';
    return p;
  },
  // Relay without self-holding and without stop button.
  'ex-ep-02': () => clone(getTemplate('tpl-ep-02')!.circuit),
  // No return: the 1B2 sensor does not reach Y2.
  'ex-ep-03': () => {
    const p = clone(design('ex-ep-03').solution);
    p.connections = p.connections.filter((w) => !(w.to[0] === 'y2' && w.to[1] === 'A1'));
    return p;
  },
  // Single cylinder circuit.
  'ex-ep-04': () => clone(getTemplate('tpl-ep-04')!.circuit),
  // Ladder without self-holding: the cylinder returns when S1 is released.
  'ex-plc-01': () => {
    const p = clone(design('ex-plc-01').solution);
    p.plc.ladder = p.plc.ladder.slice(1);
    p.plc.ladder.unshift({
      id: 'rx',
      comment: '',
      elements: [
        { id: 'x1', kind: 'contact', type: 'no', operand: 'I0.1' },
        { id: 'x2', kind: 'coil', type: 'out', operand: 'M0.0' },
      ],
    });
    return p;
  },
  // Timer set to 0.2 s.
  'ex-plc-02': () => {
    const p = clone(design('ex-plc-02').solution);
    const t = p.plc.ladder[1]!.elements[1]!;
    if (t.kind === 'timer') t.ptMs = 200;
    return p;
  },
  // Same sequence with relays: correct behaviour but no PLC.
  'ex-plc-03': () => clone(getTemplate('tpl-ep-05')!.circuit),
};

const designs = EXERCISES.filter(
  (e): e is DesignExercise & { solution: Project } & typeof e => e.kind === 'design',
);
const calcs = EXERCISES.filter((e): e is CalcExercise & typeof e => e.kind === 'calc');

describe('exercise catalog', () => {
  it('has the design and calculation exercises with unique ids', () => {
    expect(designs.length).toBeGreaterThanOrEqual(8);
    expect(calcs.length).toBeGreaterThanOrEqual(6);
    const ids = EXERCISES.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const e of EXERCISES) expect(e.folder.startsWith(`${e.id}-`)).toBe(true);
  });

  describe.each(EXERCISES.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    it('has a statement, hints and theory links that render and exist', () => {
      expect(exerciseProblem(e)).toBeNull();
      for (const text of [e.statement, ...e.hints_md]) {
        expect(() => renderMarkdown(text, { strict: true })).not.toThrow();
      }
      expect(e.statement).toContain(e.kind === 'design' ? '## Eskakizunak' : '## Enuntziatua');
      for (const id of [...e.theoryRefs, ...theoryLinks(e.statement)]) {
        expect(getSheet(id), id).toBeDefined();
      }
      expect(e.hints_md.length).toBeGreaterThan(0);
    });
  });
});

describe.each(designs.map((e) => [e.id, e] as const))('design exercise %s', (id, e) => {
  it('the reference solution passes every check', () => {
    const report = checkExercise(e.solution, e);
    expect(report.results.filter((r) => !r.ok)).toEqual([]);
    expect(report.passed).toBe(true);
  });

  it('a wrong circuit fails at least one behaviour check', () => {
    const report = checkExercise(WRONG[id]!(), e);
    expect(report.passed).toBe(false);
    expect(report.results.some((r) => !r.ok && r.reason?.code !== 'notAllowed')).toBe(true);
  });

  it('an empty circuit fails', () => {
    expect(checkExercise(createEmptyProject('x'), e).passed).toBe(false);
  });

  it('the statement names every required label and uses only known components', () => {
    for (const c of e.checks) {
      if (c.type === 'uses') continue;
      for (const s of c.stimuli) if (s[0] !== 'wait') expect(e.statement).toContain(`**${s[1]}**`);
    }
    for (const t of e.allowedComponents) expect(getComponentDef(t), t).toBeDefined();
    for (const c of e.solution.components) {
      if (e.allowedComponents.length && !c.type.endsWith('.junction')) {
        expect(e.allowedComponents).toContain(c.type);
      }
    }
  });
});

describe('checker reasons', () => {
  const e = design('ex-pn-04');

  it('reports a missing label', () => {
    const p = clone(e.solution);
    byLabel(p, '1S2').params.label = 'X';
    const r = checkExercise(p, e);
    expect(r.results.find((x) => x.reason?.code === 'missingLabel')?.reason).toEqual({
      code: 'missingLabel',
      label: '1S2',
    });
  });

  it('reports schematic errors instead of simulating', () => {
    const p = clone(e.solution);
    p.connections.push({
      id: 'bad',
      kind: 'fluid',
      from: ['nope', '1'],
      to: ['c1', 'A'],
      points: [],
    });
    const r = checkExercise(p, e);
    expect(r.passed).toBe(false);
    expect(r.results.every((x) => x.reason?.code === 'invalid')).toBe(true);
  });

  it('reports components outside the allowed list', () => {
    const p = clone(e.solution);
    p.components.push({ id: 'g', type: 'pn.gauge', x: 0, y: 0, rot: 0, mirror: false, params: {} });
    p.connections.push({ id: 'wg', kind: 'fluid', from: ['g', '1'], to: ['c1', 'A'], points: [] });
    const r = checkExercise(p, e);
    expect(r.results[0]).toEqual({
      title: '',
      ok: false,
      reason: { code: 'notAllowed', types: ['pn.gauge'] },
    });
  });

  it('reports forbidden events and wrong sequences', () => {
    const or = design('ex-pn-03').solution;
    const never = runCheck(or, e.checks[0]!);
    expect(never.reason?.code).toBe('forbidden');
    const seq = runCheck(createEmptyProject('x'), {
      title: 't',
      type: 'sequence',
      stimuli: [],
      expect: ['1A+'],
    });
    expect(seq.reason).toEqual({ code: 'missingLabel', label: '1A' });
  });

  it('measures durations from the end of the stimuli', () => {
    const slow = clone(getTemplate('tpl-pn-04')!.circuit);
    const ex5 = design('ex-pn-05');
    const r = runCheck(slow, ex5.checks[2]!);
    expect(r.reason?.code).toBe('tooSlow');
  });
});

describe('calculation exercises', () => {
  const part = (id: string, p: string) => calc(id).parts.find((x) => x.id === p)!;
  const ok = (id: string, p: string, v: number) =>
    expect(
      isCorrect(
        { id: p, type: 'numeric', prompt_md: '', explanation_md: '', answer: part(id, p).answer },
        v,
      ),
    ).toBe(true);

  it('answers match the calculator functions', () => {
    ok(
      'ex-pn-c01',
      'a',
      cylinderForceN({ pressureBar: 6, boreMm: 50, efficiency: 0.9, direction: 'extend' }),
    );
    ok(
      'ex-pn-c01',
      'b',
      cylinderForceN({
        pressureBar: 6,
        boreMm: 50,
        rodMm: 20,
        efficiency: 0.9,
        direction: 'retract',
      }),
    );
    const dmin = part('ex-pn-c02', 'a').answer.value;
    expect(
      cylinderForceN({ pressureBar: 6, boreMm: dmin, efficiency: 0.9, direction: 'extend' }),
    ).toBeCloseTo(800, -1);
    expect(
      cylinderForceN({ pressureBar: 6, boreMm: 40, efficiency: 0.9, direction: 'extend' }),
    ).toBeLessThan(800);
    expect(
      cylinderForceN({ pressureBar: 6, boreMm: 50, efficiency: 0.9, direction: 'extend' }),
    ).toBeGreaterThan(800);
    ok('ex-pn-c04', 'a', compressionRatio(6));
    const c = { pressureBar: 6, boreMm: 40, rodMm: 16, strokeMm: 200, doubleActing: true };
    ok('ex-pn-c04', 'b', airPerCycleNl(c));
    ok('ex-pn-c04', 'c', airConsumptionNlMin({ ...c, cyclesPerMin: 12 }));
    ok('ex-pn-c05', 'a', cylinderForceN({ pressureBar: 6, boreMm: 25, direction: 'extend' }));
    ok(
      'ex-pn-c05',
      'b',
      cylinderForceN({
        pressureBar: 6,
        boreMm: 25,
        efficiency: 0.9,
        springN: 25,
        direction: 'extend',
      }),
    );
    const p = part('ex-pn-c06', 'a').answer.value;
    expect(
      cylinderForceN({ pressureBar: p, boreMm: 32, efficiency: 0.9, direction: 'extend' }),
    ).toBeCloseTo(300, 0);
  });

  it.each(calcs.map((e) => [e.id, e] as const))('%s: solution renders', (_id, e) => {
    expect(() => renderMarkdown(e.solution_md, { strict: true })).not.toThrow();
    for (const p of e.parts)
      expect(() => renderMarkdown(p.prompt_md, { strict: true })).not.toThrow();
  });
});
