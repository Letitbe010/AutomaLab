/**
 * GRAFCET → Ladder conversion, Set/Reset method (SPEC §6.6): one marker per
 * step and per transition. Transitions are evaluated first and steps changed
 * afterwards (all resets, then all sets), so simultaneous firing (rule 4) and
 * "activated and deactivated stays active" (rule 5) are respected.
 * Differences with the interpreter: one evolution per scan (no stable search),
 * so a transient step lasts one scan and its continuous actions are visible.
 */
import {
  parseExpression,
  resolveName,
  type Expr,
  type Grafcet,
  type GrafcetStep,
} from '../../../core/grafcet';
import { parseOperand, type IoEntry, type LadderElement, type Rung } from '../../../core/plc';

export type ConvertProblem =
  | { code: 'expression'; text: string }
  | { code: 'name'; name: string }
  | { code: 'negatedEdge'; text: string };

export type ConvertResult =
  { ok: true; ladder: Rung[]; io: IoEntry[] } | { ok: false; problems: ConvertProblem[] };

/** First marker byte free of the markers the GRAFCET and the I/O table already use. */
function firstFreeByte(grafcet: Grafcet, io: IoEntry[]): number {
  let max = 9;
  const look = (text: string) => {
    const m = /^M(\d+)\./i.exec(text.trim());
    if (m) max = Math.max(max, Number(m[1]));
  };
  for (const e of io) look(e.address);
  const scan = (text: string) => {
    for (const m of text.matchAll(/M(\d+)\.[0-7]/gi)) max = Math.max(max, Number(m[1]));
  };
  for (const s of grafcet.steps) {
    for (const a of s.actions) {
      look(a.operand);
      scan(a.condition);
    }
  }
  for (const t of grafcet.transitions) scan(t.receptivity);
  return max + 1;
}

export function grafcetToLadder(grafcet: Grafcet, io: IoEntry[]): ConvertResult {
  const problems: ConvertProblem[] = [];
  const base = firstFreeByte(grafcet, io);
  const marker = (i: number) => `M${base + Math.floor(i / 8)}.${i % 8}`;
  const stepMarker = new Map(grafcet.steps.map((s, i) => [s.id, marker(i)]));
  const byNumber = new Map(grafcet.steps.map((s) => [s.number, s]));
  const nSteps = grafcet.steps.length;
  const nTrans = grafcet.transitions.length;
  const transMarker = (k: number) => marker(nSteps + k);
  const initMarker = marker(nSteps + nTrans);
  const falseMarker = marker(nSteps + nTrans + 1);

  let e = 0;
  let r = 0;
  const id = () => `e${++e}`;
  const contact = (type: 'no' | 'nc' | 'p' | 'n', operand: string): LadderElement => ({
    id: id(),
    kind: 'contact',
    type,
    operand,
  });
  const coil = (type: 'out' | 'set' | 'reset', operand: string): LadderElement => ({
    id: id(),
    kind: 'coil',
    type,
    operand,
  });
  const rung = (comment: string, elements: LadderElement[]): Rung => ({
    id: `r${++r}`,
    comment,
    elements,
  });

  const timerRungs: Rung[] = [];
  const timers = new Map<string, string>();
  const timerFor = (step: GrafcetStep, ms: number) => {
    const key = `${step.id}/${ms}`;
    let name = timers.get(key);
    if (!name) {
      name = `T${timers.size + 1}`;
      timers.set(key, name);
      timerRungs.push(
        rung(`X${step.number}: t = ${ms / 1000} s`, [
          contact('no', stepMarker.get(step.id)!),
          { id: id(), kind: 'timer', type: 'TON', name, ptMs: ms },
        ]),
      );
    }
    return name;
  };

  const nameOperand = (name: string): string | null => {
    const res = resolveName(name, io);
    if (!res) {
      problems.push({ code: 'name', name });
      return null;
    }
    if (res.kind === 'bit') return res.key;
    const step = byNumber.get(res.number);
    if (!step) {
      problems.push({ code: 'name', name });
      return null;
    }
    return stepMarker.get(step.id)!;
  };

  /** Expression → series list, with NOT pushed down to the contacts (De Morgan). */
  const toSeries = (x: Expr, neg: boolean, text: string): LadderElement[] => {
    switch (x.k) {
      case 'not':
        return toSeries(x.e, !neg, text);
      case 'and':
      case 'or': {
        const series = (x.k === 'and') !== neg;
        const parts = x.items.map((i) => toSeries(i, neg, text));
        return series ? parts.flat() : [{ id: id(), kind: 'parallel', branches: parts }];
      }
      case 'var': {
        const op = nameOperand(x.name);
        return op ? [contact(neg ? 'nc' : 'no', op)] : [];
      }
      case 'rise':
      case 'fall': {
        if (neg) {
          problems.push({ code: 'negatedEdge', text });
          return [];
        }
        const op = nameOperand(x.name);
        return op ? [contact(x.k === 'rise' ? 'p' : 'n', op)] : [];
      }
      case 'time': {
        const step = byNumber.get(x.step);
        if (!step) {
          problems.push({ code: 'name', name: `X${x.step}` });
          return [];
        }
        return [contact(neg ? 'nc' : 'no', `${timerFor(step, x.ms)}.Q`)];
      }
      case 'const':
        return x.v !== neg ? [] : [contact('no', falseMarker)];
    }
  };

  const parse = (text: string): Expr | null => {
    const res = parseExpression(text);
    if (res.ok) return res.expr;
    problems.push({ code: 'expression', text });
    return null;
  };

  const bitOperand = (operand: string): string | null => {
    const res = resolveName(operand, io);
    if (res?.kind === 'bit' && !res.key.startsWith('I')) return res.key;
    problems.push({ code: 'name', name: operand });
    return null;
  };

  // Stored actions come first: on the first scan an edge contact only learns its
  // previous value, so the initial steps' rising edge is seen on the next scan.
  const storedRungs: Rung[] = [];
  const continuous = new Map<string, LadderElement[][]>();
  for (const s of grafcet.steps) {
    const x = stepMarker.get(s.id)!;
    for (const a of s.actions) {
      const op = bitOperand(a.operand);
      if (!op) continue;
      if (a.kind === 'S' || a.kind === 'R') {
        storedRungs.push(
          rung(`X${s.number}: ${a.kind} ${a.operand}`, [
            contact('p', x),
            coil(a.kind === 'S' ? 'set' : 'reset', op),
          ]),
        );
      } else {
        const branch = [contact('no', x)];
        if (a.kind === 'C') {
          const cond = parse(a.condition);
          if (cond) branch.push(...toSeries(cond, false, a.condition));
        }
        continuous.set(op, [...(continuous.get(op) ?? []), branch]);
      }
    }
  }

  const initial = grafcet.steps.filter((s) => s.initial);
  const initRung = rung('Hasierako egoera: lehen scan-ean hasierako urratsak aktibatu', [
    contact('nc', initMarker),
    ...initial.map((s) => coil('set', stepMarker.get(s.id)!)),
    coil('set', initMarker),
  ]);

  const transitionRungs = grafcet.transitions.map((t, k) => {
    const expr = parse(t.receptivity);
    return rung(`T${k + 1}: ${t.receptivity}`, [
      ...t.from.map((sid) => contact('no', stepMarker.get(sid) ?? falseMarker)),
      ...(expr ? toSeries(expr, false, t.receptivity) : []),
      coil('out', transMarker(k)),
    ]);
  });

  const resetRungs = grafcet.transitions.map((t, k) =>
    rung(`T${k + 1}: aurreko urratsak desaktibatu`, [
      contact('no', transMarker(k)),
      ...t.from.flatMap((sid) => {
        const m = stepMarker.get(sid);
        return m ? [coil('reset', m)] : [];
      }),
    ]),
  );
  const setRungs = grafcet.transitions.map((t, k) =>
    rung(`T${k + 1}: hurrengo urratsak aktibatu`, [
      contact('no', transMarker(k)),
      ...t.to.flatMap((sid) => {
        const m = stepMarker.get(sid);
        return m ? [coil('set', m)] : [];
      }),
    ]),
  );

  const actionRungs = [...continuous].map(([op, branches]) =>
    rung(
      `Ekintza: ${op}`,
      branches.length === 1
        ? [...branches[0]!, coil('out', op)]
        : [{ id: id(), kind: 'parallel', branches }, coil('out', op)],
    ),
  );

  if (problems.length) return { ok: false, problems };

  const known = new Set(io.map((x) => parseOperand(x.address)?.key));
  const added: IoEntry[] = [
    ...grafcet.steps.map((s) => ({
      address: stepMarker.get(s.id)!,
      symbol: `X${s.number}`,
      comment: s.comment,
    })),
    ...grafcet.transitions.map((t, k) => ({
      address: transMarker(k),
      symbol: `Tr${k + 1}`,
      comment: t.receptivity,
    })),
    { address: initMarker, symbol: 'Hasieratuta', comment: '' },
  ].filter((x) => !known.has(x.address));

  return {
    ok: true,
    ladder: [
      ...storedRungs,
      initRung,
      ...timerRungs,
      ...transitionRungs,
      ...resetRungs,
      ...setRungs,
      ...actionRungs,
    ],
    io: [...io, ...added],
  };
}
