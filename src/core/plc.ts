/**
 * PLC program data (SPEC §5.4, §6.5), S7-1200 style (decided 2026-11-05):
 * addresses I0.0…I1.5, Q0.0…Q1.1 (CPU 1214C: 14 DI / 10 DQ), markers M,
 * IEC timers/counters as named instances (T1, C1) instead of instance DBs.
 * Rungs ("segmentuak") are series/parallel trees, not free networks.
 */

export type ContactType = 'no' | 'nc' | 'p' | 'n';
export type CoilType = 'out' | 'set' | 'reset';
export type TimerType = 'TON' | 'TOF' | 'TP';
export type CounterType = 'CTU' | 'CTD';

export type LadderElement =
  /** Operand: I0.0, Q0.0, M0.0, or T1.Q / C1.Q. */
  | { id: string; kind: 'contact'; type: ContactType; operand: string }
  /** Operand: Q0.0 or M0.0. Coils pass the power through. */
  | { id: string; kind: 'coil'; type: CoilType; operand: string }
  /** IN = power in; power out = Q. */
  | { id: string; kind: 'timer'; type: TimerType; name: string; ptMs: number }
  /** CU/CD = power in (rising edge); R (CTU) or LD (CTD) from an operand; power out = Q. */
  | {
      id: string;
      kind: 'counter';
      type: CounterType;
      name: string;
      pv: number;
      /** Reset (CTU) or load (CTD) operand; empty = none. */
      resetOperand: string;
    }
  | { id: string; kind: 'parallel'; branches: LadderElement[][] };

export interface Rung {
  id: string;
  comment: string;
  elements: LadderElement[];
}

/** I/O table row: address, symbolic name and comment (TIA "PLC tags"). */
export interface IoEntry {
  address: string;
  symbol: string;
  comment: string;
}

/** CPU 1214C DC/DC/DC digital I/O. */
export const PLC_INPUTS = [
  ...[0, 1, 2, 3, 4, 5, 6, 7].map((b) => `I0.${b}`),
  ...[0, 1, 2, 3, 4, 5].map((b) => `I1.${b}`),
];
export const PLC_OUTPUTS = [
  ...[0, 1, 2, 3, 4, 5, 6, 7].map((b) => `Q0.${b}`),
  ...[0, 1].map((b) => `Q1.${b}`),
];

export type Operand =
  { area: 'I' | 'Q' | 'M'; key: string } | { area: 'T' | 'C'; name: string; key: string };

/** Parses an operand: I0.0, Q1.1, M2.7, T1.Q, C3.Q (case-insensitive area letter). */
export function parseOperand(text: string): Operand | null {
  const s = text.trim().toUpperCase();
  const bit = /^([IQM])(\d{1,3})\.([0-7])$/.exec(s);
  if (bit) return { area: bit[1] as 'I' | 'Q' | 'M', key: `${bit[1]}${Number(bit[2])}.${bit[3]}` };
  const inst = /^([TC])(\d{1,3})\.Q$/.exec(s);
  if (inst) {
    const name = `${inst[1]}${Number(inst[2])}`;
    return { area: inst[1] as 'T' | 'C', name, key: `${name}.Q` };
  }
  return null;
}

/** Whether an address exists on the CPU (inputs/outputs) or is a valid marker. */
export function isValidAddress(op: Operand): boolean {
  if (op.area === 'I') return PLC_INPUTS.includes(op.key);
  if (op.area === 'Q') return PLC_OUTPUTS.includes(op.key);
  return true;
}

/** All elements of a series list, depth first (parallel branches included). */
export function walkElements(list: LadderElement[], out: LadderElement[] = []): LadderElement[] {
  for (const e of list) {
    out.push(e);
    if (e.kind === 'parallel') for (const b of e.branches) walkElements(b, out);
  }
  return out;
}

// ---------- reading from JSON (type guards, SPEC: no zod) ----------

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);
const str = (v: unknown) => (typeof v === 'string' ? v : null);

function readElement(raw: unknown): LadderElement | null {
  if (!isObj(raw)) return null;
  const id = str(raw.id);
  if (!id) return null;
  switch (raw.kind) {
    case 'contact': {
      const type = raw.type;
      const operand = str(raw.operand);
      if (!['no', 'nc', 'p', 'n'].includes(type as string) || operand === null) return null;
      return { id, kind: 'contact', type: type as ContactType, operand };
    }
    case 'coil': {
      const type = raw.type;
      const operand = str(raw.operand);
      if (!['out', 'set', 'reset'].includes(type as string) || operand === null) return null;
      return { id, kind: 'coil', type: type as CoilType, operand };
    }
    case 'timer': {
      const name = str(raw.name);
      if (!['TON', 'TOF', 'TP'].includes(raw.type as string) || !name) return null;
      if (typeof raw.ptMs !== 'number' || raw.ptMs < 0) return null;
      return { id, kind: 'timer', type: raw.type as TimerType, name, ptMs: raw.ptMs };
    }
    case 'counter': {
      const name = str(raw.name);
      if (!['CTU', 'CTD'].includes(raw.type as string) || !name) return null;
      if (typeof raw.pv !== 'number') return null;
      return {
        id,
        kind: 'counter',
        type: raw.type as CounterType,
        name,
        pv: raw.pv,
        resetOperand: str(raw.resetOperand) ?? '',
      };
    }
    case 'parallel': {
      if (!Array.isArray(raw.branches)) return null;
      const branches = raw.branches.map((b) => readSeries(b));
      if (branches.some((b) => b === null)) return null;
      return { id, kind: 'parallel', branches: branches as LadderElement[][] };
    }
    default:
      return null;
  }
}

function readSeries(raw: unknown): LadderElement[] | null {
  if (!Array.isArray(raw)) return null;
  const out = raw.map(readElement);
  return out.some((e) => e === null) ? null : (out as LadderElement[]);
}

/** Reads rungs; returns null if anything is malformed. */
export function readLadder(raw: unknown): Rung[] | null {
  if (!Array.isArray(raw)) return null;
  const rungs: Rung[] = [];
  for (const r of raw) {
    if (!isObj(r) || !str(r.id)) return null;
    const elements = readSeries(r.elements);
    if (!elements) return null;
    rungs.push({ id: r.id as string, comment: str(r.comment) ?? '', elements });
  }
  return rungs;
}

export function readIo(raw: unknown): IoEntry[] | null {
  if (!Array.isArray(raw)) return null;
  const out: IoEntry[] = [];
  for (const r of raw) {
    if (!isObj(r) || !str(r.address)) return null;
    out.push({
      address: r.address as string,
      symbol: str(r.symbol) ?? '',
      comment: str(r.comment) ?? '',
    });
  }
  return out;
}
