/** GRAFCET (SPEC §6.6, IEC 60848): expressions, evolution rules, R9 and Ladder conversion. */
import {
  parseExpression,
  readGrafcet,
  resolveName,
  type Grafcet,
  type GrafcetAction,
  type GrafcetStep,
  type GrafcetTransition,
} from '../../src/core/grafcet';
import { validateProject } from '../../src/core/validation';
import { getComponentDef } from '../../src/components/registry';
import { GrafcetRuntime, MAX_EVOLUTIONS } from '../../src/engine/plc/grafcet/runtime';
import { grafcetToLadder } from '../../src/engine/plc/grafcet/toLadder';
import { LadderRuntime } from '../../src/engine/plc/ladder/runtime';
import { loadFixture, position, pulse, simulate } from './helpers';

let a = 0;
const act = (kind: GrafcetAction['kind'], operand: string, condition = ''): GrafcetAction => ({
  id: `a${++a}`,
  kind,
  operand,
  condition,
});
const step = (number: number, initial = false, actions: GrafcetAction[] = []): GrafcetStep => ({
  id: `x${number}`,
  number,
  initial,
  x: 0,
  y: 0,
  comment: '',
  actions,
});
let t = 0;
const tr = (receptivity: string, from: number[], to: number[]): GrafcetTransition => ({
  id: `t${++t}`,
  receptivity,
  x: 0,
  y: 0,
  comment: '',
  from: from.map((n) => `x${n}`),
  to: to.map((n) => `x${n}`),
});
const rt = (steps: GrafcetStep[], transitions: GrafcetTransition[]) =>
  new GrafcetRuntime({ steps, transitions } satisfies Grafcet, [
    { address: 'I0.0', symbol: 'Martxa', comment: '' },
  ]);
const active = (r: GrafcetRuntime) => [...r.active].sort();
const scan = (r: GrafcetRuntime, inputs: string[] = [], n = 1, dt = 10) => {
  for (let i = 0; i < n; i++) r.scan(new Set(inputs), dt);
};

describe('receptivity expressions', () => {
  it('parses precedence, NOT, edges, time and constants', () => {
    expect(parseExpression('a * /b + c')).toEqual({
      ok: true,
      expr: {
        k: 'or',
        items: [
          {
            k: 'and',
            items: [
              { k: 'var', name: 'a' },
              { k: 'not', e: { k: 'var', name: 'b' } },
            ],
          },
          { k: 'var', name: 'c' },
        ],
      },
    });
    expect(parseExpression('^I0.0')).toEqual({ ok: true, expr: { k: 'rise', name: 'I0.0' } });
    expect(parseExpression('↓A_atzean')).toEqual({
      ok: true,
      expr: { k: 'fall', name: 'A_atzean' },
    });
    expect(parseExpression('t/X3/1,5s')).toEqual({
      ok: true,
      expr: { k: 'time', step: 3, ms: 1500 },
    });
    expect(parseExpression('t/X3/500ms')).toEqual({
      ok: true,
      expr: { k: 'time', step: 3, ms: 500 },
    });
    expect(parseExpression('1')).toEqual({ ok: true, expr: { k: 'const', v: true } });
  });

  it('reports empty text and syntax errors', () => {
    expect(parseExpression('  ')).toMatchObject({ ok: false, code: 'empty' });
    expect(parseExpression('a *')).toMatchObject({ ok: false, code: 'end' });
    expect(parseExpression('a b')).toMatchObject({ ok: false, code: 'unexpected', pos: 2 });
    expect(parseExpression('(a')).toMatchObject({ ok: false, code: 'end' });
    expect(parseExpression('a # b')).toMatchObject({ ok: false, code: 'unexpected', pos: 2 });
  });

  it('resolves addresses, symbols and steps', () => {
    const io = [{ address: 'I0.1', symbol: 'Martxa', comment: '' }];
    expect(resolveName('Martxa', io)).toEqual({ kind: 'bit', key: 'I0.1' });
    expect(resolveName('q0.1', io)).toEqual({ kind: 'bit', key: 'Q0.1' });
    expect(resolveName('X3', io)).toEqual({ kind: 'step', number: 3 });
    expect(resolveName('Ezezaguna', io)).toBeNull();
    expect(resolveName('T1.Q', io)).toBeNull();
  });

  it('reads GRAFCET JSON and rejects malformed data', () => {
    expect(readGrafcet(null)).toBeNull();
    expect(
      readGrafcet({ steps: [step(1, true)], transitions: [tr('1', [1], [1])] }),
    ).not.toBeUndefined();
    expect(readGrafcet({ steps: [{ id: 'x' }], transitions: [] })).toBeUndefined();
  });
});

describe('evolution rules', () => {
  it('rule 1: only the initial steps are active at the start', () => {
    const r = rt([step(1, true), step(2), step(3, true)], []);
    scan(r);
    expect(active(r)).toEqual(['x1', 'x3']);
  });

  it('rule 2: a transition fires only if enabled and its receptivity is true', () => {
    const r = rt([step(1, true), step(2), step(3)], [tr('I0.0', [1], [2]), tr('I0.1', [2], [3])]);
    scan(r, ['I0.1']); // t2 receptive but not enabled
    expect(active(r)).toEqual(['x1']);
    scan(r, ['I0.0']);
    expect(active(r)).toEqual(['x2']);
  });

  it('rule 3: firing activates the next steps and deactivates the previous ones', () => {
    const r = rt([step(1, true), step(2), step(3)], [tr('1', [1], [2, 3])]);
    scan(r);
    expect(active(r)).toEqual(['x2', 'x3']);
  });

  it('AND convergence waits for all previous steps', () => {
    const r = rt(
      [step(1, true), step(2, true), step(3), step(4)],
      [tr('I0.0', [1], [3]), tr('I0.1', [2, 3], [4])],
    );
    scan(r, ['I0.1']);
    expect(active(r)).toEqual(['x1', 'x2']);
    scan(r, ['I0.0']);
    expect(active(r)).toEqual(['x2', 'x3']);
    scan(r, ['I0.1']);
    expect(active(r)).toEqual(['x4']);
  });

  it('rule 4: all fireable transitions fire at the same time (OR with both true)', () => {
    const r = rt([step(1, true), step(2), step(3)], [tr('I0.0', [1], [2]), tr('I0.0', [1], [3])]);
    scan(r, ['I0.0']);
    expect(active(r)).toEqual(['x2', 'x3']);
  });

  it('rule 5: a step activated and deactivated at once stays active', () => {
    // X2 and X3 active. t1: X2 -> X3 and t2: X3 -> X4 fire together: X3 stays active.
    const r = rt(
      [step(2, true), step(3, true), step(4)],
      [tr('^I0.0', [2], [3]), tr('^I0.0', [3], [4])],
    );
    scan(r);
    scan(r, ['I0.0']);
    expect(active(r)).toEqual(['x3', 'x4']);
  });

  it('stable search: continuous actions of transient steps are not executed', () => {
    const r = rt(
      [step(1, true), step(2, false, [act('N', 'Q0.0')]), step(3, false, [act('N', 'Q0.1')])],
      [tr('I0.0', [1], [2]), tr('1', [2], [3])],
    );
    scan(r, ['I0.0']);
    expect(active(r)).toEqual(['x3']);
    expect(r.read('Q0.0')).toBe(false);
    expect(r.read('Q0.1')).toBe(true);
  });

  it('stored actions run even in transient steps and persist', () => {
    const r = rt(
      [
        step(1, true),
        step(2, false, [act('S', 'Q0.0')]),
        step(3),
        step(4, false, [act('R', 'Q0.0')]),
      ],
      [tr('I0.0', [1], [2]), tr('1', [2], [3]), tr('I0.1', [3], [4])],
    );
    scan(r, ['I0.0']);
    expect(active(r)).toEqual(['x3']);
    expect(r.read('Q0.0')).toBe(true);
    scan(r, ['I0.1']);
    expect(r.read('Q0.0')).toBe(false);
  });

  it('conditional actions depend on their condition while the step is active', () => {
    const r = rt([step(1, true, [act('C', 'Q0.0', 'I0.0')])], []);
    scan(r);
    expect(r.read('Q0.0')).toBe(false);
    scan(r, ['I0.0']);
    expect(r.read('Q0.0')).toBe(true);
  });

  it('an edge is one event: it fires only the first evolution of the scan', () => {
    const r = rt([step(1, true), step(2), step(3)], [tr('^I0.0', [1], [2]), tr('^I0.0', [2], [3])]);
    scan(r);
    scan(r, ['I0.0']);
    expect(active(r)).toEqual(['x2']);
    scan(r, ['I0.0']);
    expect(active(r)).toEqual(['x2']);
    scan(r, []);
    scan(r, ['I0.0']);
    expect(active(r)).toEqual(['x3']);
  });

  it('time receptivity counts from the activation of the step', () => {
    const r = rt([step(1, true), step(2)], [tr('t/X1/100ms', [1], [2])]);
    scan(r, [], 10);
    expect(active(r)).toEqual(['x1']);
    scan(r, [], 1);
    expect(active(r)).toEqual(['x2']);
  });

  it('symbols resolve through the I/O table', () => {
    const r = rt([step(1, true), step(2)], [tr('Martxa', [1], [2])]);
    scan(r, ['I0.0']);
    expect(active(r)).toEqual(['x2']);
  });

  it('reports a transition cycle that never settles', () => {
    const r = rt([step(1, true), step(2)], [tr('1', [1], [2]), tr('1', [2], [1])]);
    scan(r);
    expect(r.unstable).toBe(true);
    expect(MAX_EVOLUTIONS).toBeGreaterThan(1);
  });
});

describe('fixtures', () => {
  it.each(['r9-grafcet-and.automalab.json', 'r7-grafcet.automalab.json'])(
    '%s validates without errors or warnings',
    (name) => {
      expect(validateProject(loadFixture(name), getComponentDef)).toEqual([]);
    },
  );

  it('R9: AND divergence activates both branches; convergence waits for both', () => {
    const sim = simulate(loadFixture('r9-grafcet-and.automalab.json'));
    expect(sim.grafcet).not.toBeNull();
    expect(sim.plcState()!.outputs).toEqual([]);
    pulse(sim, 's1', 30);
    expect(sim.plcState()!.outputs).toEqual(['Q0.0', 'Q0.1']);
    pulse(sim, 's2', 30);
    sim.run(30);
    expect(sim.plcState()!.outputs).toEqual(['Q0.1']);
    pulse(sim, 's3', 30);
    sim.run(30);
    expect(sim.plcState()!.outputs).toEqual(['Q0.2']);
    pulse(sim, 's4', 30);
    sim.run(30);
    expect(sim.plcState()!.outputs).toEqual([]);
    expect(sim.warnings).toEqual([]);
  });
});

describe('A+ B+ A- B-: relays, GRAFCET and converted Ladder give the same result', () => {
  const run = (p: ReturnType<typeof loadFixture>) => {
    const sim = simulate(p);
    pulse(sim, 's1');
    sim.run(5500);
    pulse(sim, 's0');
    sim.run(10000);
    return sim;
  };
  const relays = () => run(loadFixture('r7-abab-relays-reed.automalab.json'));

  it('GRAFCET interpreter', () => {
    const sim = run(loadFixture('r7-grafcet.automalab.json'));
    expect(sim.eventNames()).toEqual(relays().eventNames());
    expect(sim.eventNames().slice(0, 5)).toEqual(['1A+', '2A+', '1A-', '2A-', '1A+']);
    expect(position(sim, 'cA')).toBe(0);
    expect(sim.warnings).toEqual([]);
  });

  it('Ladder generated from the GRAFCET', () => {
    const p = loadFixture('r7-grafcet.automalab.json');
    const res = grafcetToLadder(p.plc.grafcet!, p.plc.io);
    if (!res.ok) throw new Error(JSON.stringify(res.problems));
    const sim = run({
      ...p,
      plc: { ...p.plc, ladder: res.ladder, io: res.io, language: 'ladder' },
    });
    expect(sim.ladder).not.toBeNull();
    expect(sim.eventNames()).toEqual(relays().eventNames());
  });
});

describe('GRAFCET to Ladder', () => {
  it('keeps rule 5 (resets before sets) and generates valid operands', () => {
    const g = {
      steps: [step(2, true), step(3, true), step(4)],
      transitions: [tr('I0.0', [2], [3]), tr('I0.0', [3], [4])],
    };
    const res = grafcetToLadder(g, []);
    if (!res.ok) throw new Error(JSON.stringify(res.problems));
    const marker = (name: string) => res.io.find((e) => e.symbol === name)!.address;
    const ladder = new LadderRuntime(res.ladder);
    ladder.scan(new Set(), 10);
    expect(ladder.read(marker('X2'))).toBe(true);
    expect(ladder.read(marker('X3'))).toBe(true);
    ladder.scan(new Set(['I0.0']), 10);
    expect(ladder.read(marker('X2'))).toBe(false);
    expect(ladder.read(marker('X3'))).toBe(true); // activated and deactivated: stays active
    expect(ladder.read(marker('X4'))).toBe(true);
    const p = loadFixture('r8-ladder-ton.automalab.json');
    const issues = validateProject(
      { ...p, plc: { ...p.plc, ladder: res.ladder } },
      getComponentDef,
    );
    expect(issues.filter((i) => i.code.startsWith('ladder'))).toEqual([]);
  });

  it('turns time receptivities into TON timers', () => {
    const g = { steps: [step(1, true), step(2)], transitions: [tr('t/X1/2s', [1], [2])] };
    const res = grafcetToLadder(g, []);
    expect(res.ok && JSON.stringify(res.ladder)).toContain('"ptMs":2000');
  });

  it('reports unknown names, bad expressions and negated edges', () => {
    const g = {
      steps: [step(1, true)],
      transitions: [tr('Ezezaguna', [1], [1]), tr('a *', [1], [1]), tr('/^I0.0', [1], [1])],
    };
    const res = grafcetToLadder(g, []);
    expect(res.ok).toBe(false);
    if (!res.ok)
      expect(res.problems.map((p) => p.code).sort()).toEqual(['expression', 'name', 'negatedEdge']);
  });
});
