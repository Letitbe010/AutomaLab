/**
 * GRAFCET data and receptivity expressions (SPEC §6.6, IEC 60848).
 * A transition lists the steps before and after it, so step/transition
 * alternation holds by construction: several `from` = AND convergence,
 * several `to` = AND divergence, several transitions from one step = OR.
 *
 * Expressions (decided 2026-11-09): names are addresses or I/O table symbols;
 * `*` or `·` AND, `+` OR, `/` or `!` NOT, `^x` rising edge, `_x` falling edge
 * (↑ ↓ accepted too), `X3` step activity, `t/X3/2s` time, `1` / `0` constants.
 */
import { parseOperand, type IoEntry } from './plc';

export type ActionKind = 'N' | 'C' | 'S' | 'R';

export interface GrafcetAction {
  id: string;
  /** N continuous, C conditional (continuous while `condition`), S/R stored on activation. */
  kind: ActionKind;
  operand: string;
  condition: string;
}

export interface GrafcetStep {
  id: string;
  number: number;
  initial: boolean;
  x: number;
  y: number;
  comment: string;
  actions: GrafcetAction[];
}

export interface GrafcetTransition {
  id: string;
  receptivity: string;
  x: number;
  y: number;
  comment: string;
  /** Step ids before / after the transition. */
  from: string[];
  to: string[];
}

export interface Grafcet {
  steps: GrafcetStep[];
  transitions: GrafcetTransition[];
}

export type Expr =
  | { k: 'or' | 'and'; items: Expr[] }
  | { k: 'not'; e: Expr }
  | { k: 'var' | 'rise' | 'fall'; name: string }
  | { k: 'time'; step: number; ms: number }
  | { k: 'const'; v: boolean };

export type ParseExprResult =
  { ok: true; expr: Expr } | { ok: false; code: 'empty' | 'unexpected' | 'end'; pos: number };

type Tok =
  | { t: 'op'; v: '*' | '+' | '/' | '(' | ')' | '^' | '_'; pos: number }
  | { t: 'name'; v: string; pos: number }
  | { t: 'num'; v: boolean; pos: number }
  | { t: 'time'; step: number; ms: number; pos: number };

const TIME_RE = /^t\/X(\d+)\/(\d+(?:[.,]\d+)?)(ms|s)(?![\w.])/;
const NAME_RE = /^[A-Za-zÀ-ÿ][\wÀ-ÿ]*(?:\.[\wÀ-ÿ]+)*/;

function tokenize(text: string): Tok[] | { pos: number } {
  const out: Tok[] = [];
  let i = 0;
  while (i < text.length) {
    const c = text[i]!;
    if (/\s/.test(c)) {
      i++;
      continue;
    }
    const rest = text.slice(i);
    const time = TIME_RE.exec(rest);
    if (time) {
      const value = Number(time[2]!.replace(',', '.'));
      out.push({
        t: 'time',
        step: Number(time[1]),
        ms: time[3] === 's' ? Math.round(value * 1000) : Math.round(value),
        pos: i,
      });
      i += time[0].length;
      continue;
    }
    const single: Record<string, '*' | '+' | '/' | '(' | ')' | '^' | '_'> = {
      '*': '*',
      '·': '*',
      '+': '+',
      '/': '/',
      '!': '/',
      '(': '(',
      ')': ')',
      '^': '^',
      '↑': '^',
      _: '_',
      '↓': '_',
    };
    const op = single[c];
    if (op) {
      out.push({ t: 'op', v: op, pos: i });
      i++;
      continue;
    }
    if (c === '0' || c === '1') {
      out.push({ t: 'num', v: c === '1', pos: i });
      i++;
      continue;
    }
    const name = NAME_RE.exec(rest);
    if (!name) return { pos: i };
    out.push({ t: 'name', v: name[0], pos: i });
    i += name[0].length;
  }
  return out;
}

class ParseFail {
  constructor(
    readonly code: 'unexpected' | 'end',
    readonly pos: number,
  ) {}
}

/** Parses a receptivity or condition: OR of ANDs of (possibly negated) terms. */
export function parseExpression(text: string): ParseExprResult {
  const toks = tokenize(text);
  if (!Array.isArray(toks)) return { ok: false, code: 'unexpected', pos: toks.pos };
  if (toks.length === 0) return { ok: false, code: 'empty', pos: 0 };
  let p = 0;
  const end = text.length;
  const isOp = (v: string) => {
    const t = toks[p];
    return t?.t === 'op' && t.v === v;
  };
  const fail = (): never => {
    const t = toks[p];
    throw t ? new ParseFail('unexpected', t.pos) : new ParseFail('end', end);
  };
  const or = (): Expr => {
    const items = [and()];
    while (isOp('+')) {
      p++;
      items.push(and());
    }
    return items.length === 1 ? items[0]! : { k: 'or', items };
  };
  const and = (): Expr => {
    const items = [unary()];
    while (isOp('*')) {
      p++;
      items.push(unary());
    }
    return items.length === 1 ? items[0]! : { k: 'and', items };
  };
  const unary = (): Expr => {
    if (isOp('/')) {
      p++;
      return { k: 'not', e: unary() };
    }
    if (isOp('^') || isOp('_')) {
      const k = isOp('^') ? 'rise' : 'fall';
      p++;
      const t = toks[p];
      if (t?.t !== 'name') return fail();
      p++;
      return { k, name: t.v };
    }
    if (isOp('(')) {
      p++;
      const e = or();
      if (!isOp(')')) return fail();
      p++;
      return e;
    }
    const t = toks[p];
    if (t?.t === 'name') {
      p++;
      return { k: 'var', name: t.v };
    }
    if (t?.t === 'num') {
      p++;
      return { k: 'const', v: t.v };
    }
    if (t?.t === 'time') {
      p++;
      return { k: 'time', step: t.step, ms: t.ms };
    }
    return fail();
  };
  try {
    const expr = or();
    if (p < toks.length) fail();
    return { ok: true, expr };
  } catch (e) {
    if (e instanceof ParseFail) return { ok: false, code: e.code, pos: e.pos };
    throw e;
  }
}

export type ResolvedName = { kind: 'bit'; key: string } | { kind: 'step'; number: number };

/** A name is a step (X3), a bit address (I0.0, Q0.1, M0.0) or an I/O table symbol. */
export function resolveName(name: string, io: IoEntry[]): ResolvedName | null {
  const step = /^X(\d+)$/.exec(name);
  if (step) return { kind: 'step', number: Number(step[1]) };
  const op = parseOperand(name);
  if (op && (op.area === 'I' || op.area === 'Q' || op.area === 'M')) {
    return { kind: 'bit', key: op.key };
  }
  const entry = io.find((e) => e.symbol !== '' && e.symbol === name);
  if (entry) {
    const a = parseOperand(entry.address);
    if (a && (a.area === 'I' || a.area === 'Q' || a.area === 'M')) {
      return { kind: 'bit', key: a.key };
    }
  }
  return null;
}

/** Every variable name used in an expression. */
export function exprNames(e: Expr, out: string[] = []): string[] {
  switch (e.k) {
    case 'or':
    case 'and':
      e.items.forEach((x) => exprNames(x, out));
      break;
    case 'not':
      exprNames(e.e, out);
      break;
    case 'var':
    case 'rise':
    case 'fall':
      out.push(e.name);
      break;
    default:
      break;
  }
  return out;
}

/** Step numbers referenced by time terms (t/X3/2s). */
export function exprTimeSteps(e: Expr, out: number[] = []): number[] {
  if (e.k === 'or' || e.k === 'and') e.items.forEach((x) => exprTimeSteps(x, out));
  else if (e.k === 'not') exprTimeSteps(e.e, out);
  else if (e.k === 'time') out.push(e.step);
  return out;
}

// ---------- reading from JSON ----------

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);
const isStr = (v: unknown): v is string => typeof v === 'string';
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const isStrArr = (v: unknown): v is string[] => Array.isArray(v) && v.every(isStr);

function readAction(raw: unknown): GrafcetAction | null {
  if (!isObj(raw) || !isStr(raw.id) || !isStr(raw.operand)) return null;
  if (!['N', 'C', 'S', 'R'].includes(raw.kind as string)) return null;
  return {
    id: raw.id,
    kind: raw.kind as ActionKind,
    operand: raw.operand,
    condition: isStr(raw.condition) ? raw.condition : '',
  };
}

/** Reads a GRAFCET; `undefined` means malformed (null stays null: no GRAFCET yet). */
export function readGrafcet(raw: unknown): Grafcet | null | undefined {
  if (raw === null || raw === undefined) return null;
  if (!isObj(raw) || !Array.isArray(raw.steps) || !Array.isArray(raw.transitions)) return undefined;
  const steps: GrafcetStep[] = [];
  for (const s of raw.steps) {
    if (!isObj(s) || !isStr(s.id) || !isNum(s.number) || !isNum(s.x) || !isNum(s.y)) {
      return undefined;
    }
    if (!Array.isArray(s.actions)) return undefined;
    const actions = s.actions.map(readAction);
    if (actions.some((a) => a === null)) return undefined;
    steps.push({
      id: s.id,
      number: s.number,
      initial: s.initial === true,
      x: s.x,
      y: s.y,
      comment: isStr(s.comment) ? s.comment : '',
      actions: actions as GrafcetAction[],
    });
  }
  const transitions: GrafcetTransition[] = [];
  for (const t of raw.transitions) {
    if (!isObj(t) || !isStr(t.id) || !isStr(t.receptivity) || !isNum(t.x) || !isNum(t.y)) {
      return undefined;
    }
    if (!isStrArr(t.from) || !isStrArr(t.to)) return undefined;
    transitions.push({
      id: t.id,
      receptivity: t.receptivity,
      x: t.x,
      y: t.y,
      comment: isStr(t.comment) ? t.comment : '',
      from: t.from,
      to: t.to,
    });
  }
  return { steps, transitions };
}
