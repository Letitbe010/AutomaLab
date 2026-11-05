/**
 * Ladder runtime (SPEC §6.5). Scan cycle: copy the inputs to the input image,
 * evaluate the rungs top to bottom and left to right, then the outputs are
 * read from the output image. Pure TypeScript, deterministic.
 */
import { parseOperand, type LadderElement, type Rung } from '../../../core/plc';

export interface TimerState {
  q: boolean;
  /** Elapsed time, ms (IEC ET). */
  et: number;
  ptMs: number;
  prevIn: boolean;
  running: boolean;
}

export interface CounterState {
  cv: number;
  pv: number;
  q: boolean;
  prevIn: boolean;
}

export const MAX_COUNT = 32767;

export class LadderRuntime {
  /** Process image of I, Q and M bits (key "I0.0"). Missing = false. */
  readonly image = new Map<string, boolean>();
  readonly timers = new Map<string, TimerState>();
  readonly counters = new Map<string, CounterState>();
  /** Power flowing out of each element in the last scan (for display). */
  readonly power = new Map<string, boolean>();
  /** Previous operand value of edge contacts, by element id. */
  private readonly edges = new Map<string, boolean>();
  private dtMs = 0;
  scans = 0;

  constructor(private readonly rungs: Rung[]) {}

  /** Bit value of an operand (I/Q/M bits, T1.Q, C1.Q); invalid operands read false. */
  read(text: string): boolean {
    const op = parseOperand(text);
    if (!op) return false;
    if (op.area === 'T') return this.timers.get(op.name)?.q === true;
    if (op.area === 'C') return this.counters.get(op.name)?.q === true;
    return this.image.get(op.key) === true;
  }

  private write(text: string, value: boolean): void {
    const op = parseOperand(text);
    if (!op || op.area === 'I' || op.area === 'T' || op.area === 'C') return;
    this.image.set(op.key, value);
  }

  /**
   * One scan. `inputs` are the input addresses at +24 V; `dtMs` is the time
   * since the previous scan (timers advance by it).
   */
  scan(inputs: ReadonlySet<string>, dtMs: number): void {
    for (const key of [...this.image.keys()]) if (key.startsWith('I')) this.image.delete(key);
    for (const addr of inputs) this.image.set(addr, true);
    this.dtMs = dtMs;
    for (const rung of this.rungs) this.series(rung.elements, true);
    this.scans += 1;
  }

  /** Output addresses currently on (Q image). */
  outputs(): Set<string> {
    const out = new Set<string>();
    for (const [k, v] of this.image) if (v && k.startsWith('Q')) out.add(k);
    return out;
  }

  private series(list: LadderElement[], powerIn: boolean): boolean {
    let p = powerIn;
    for (const e of list) {
      p = this.element(e, p);
      this.power.set(e.id, p);
    }
    return p;
  }

  private element(e: LadderElement, p: boolean): boolean {
    switch (e.kind) {
      case 'contact': {
        const v = this.read(e.operand);
        if (e.type === 'no') return p && v;
        if (e.type === 'nc') return p && !v;
        const prev = this.edges.get(e.id) ?? v;
        this.edges.set(e.id, v);
        return p && (e.type === 'p' ? v && !prev : !v && prev);
      }
      case 'coil':
        if (e.type === 'out') this.write(e.operand, p);
        else if (p) this.write(e.operand, e.type === 'set');
        return p;
      case 'parallel': {
        let any = false;
        for (const b of e.branches) any = this.series(b, p) || any;
        return any;
      }
      case 'timer':
        return this.timer(e, p);
      case 'counter':
        return this.counter(e, p);
    }
  }

  private timer(e: Extract<LadderElement, { kind: 'timer' }>, input: boolean): boolean {
    const t =
      this.timers.get(e.name) ??
      ({ q: false, et: 0, ptMs: e.ptMs, prevIn: false, running: false } satisfies TimerState);
    t.ptMs = e.ptMs;
    const rising = input && !t.prevIn;
    const falling = !input && t.prevIn;
    switch (e.type) {
      case 'TON':
        t.et = !input ? 0 : rising ? 0 : Math.min(t.et + this.dtMs, e.ptMs);
        t.q = input && t.et >= e.ptMs;
        break;
      case 'TOF':
        if (input) {
          t.q = true;
          t.et = 0;
          t.running = false;
        } else if (falling) {
          t.running = true;
          t.et = 0;
          t.q = e.ptMs > 0;
        } else if (t.running) {
          t.et = Math.min(t.et + this.dtMs, e.ptMs);
          t.q = t.et < e.ptMs;
          if (!t.q) t.running = false;
        }
        break;
      case 'TP':
        if (rising && !t.running) {
          t.running = true;
          t.et = 0;
        } else if (t.running) {
          t.et = Math.min(t.et + this.dtMs, e.ptMs);
        } else if (!input) {
          t.et = 0;
        }
        if (t.running && t.et >= e.ptMs) t.running = false;
        t.q = t.running && e.ptMs > 0;
        break;
    }
    t.prevIn = input;
    this.timers.set(e.name, t);
    return t.q;
  }

  private counter(e: Extract<LadderElement, { kind: 'counter' }>, input: boolean): boolean {
    const c =
      this.counters.get(e.name) ??
      ({
        cv: e.type === 'CTD' ? e.pv : 0,
        pv: e.pv,
        q: false,
        prevIn: false,
      } satisfies CounterState);
    c.pv = e.pv;
    const rising = input && !c.prevIn;
    const resetOrLoad = e.resetOperand !== '' && this.read(e.resetOperand);
    if (e.type === 'CTU') {
      if (resetOrLoad) c.cv = 0;
      else if (rising && c.cv < MAX_COUNT) c.cv += 1;
      c.q = c.cv >= c.pv;
    } else {
      if (resetOrLoad) c.cv = c.pv;
      else if (rising && c.cv > -MAX_COUNT) c.cv -= 1;
      c.q = c.cv <= 0;
    }
    c.prevIn = input;
    this.counters.set(e.name, c);
    return c.q;
  }
}
