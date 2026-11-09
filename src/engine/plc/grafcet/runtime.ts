/**
 * GRAFCET interpreter (SPEC §6.6, IEC 60848), run once per PLC scan.
 * Evolution rules: (1) initial steps active; (2) a transition is enabled when
 * all previous steps are active and fires when its receptivity is true;
 * (3) firing activates the next steps and deactivates the previous ones;
 * (4) all fireable transitions fire together; (5) a step both activated and
 * deactivated stays active. Stable search: evolution repeats within the scan
 * until nothing can fire; continuous actions are only assigned once stable,
 * stored actions (S/R) run on every activation, also in transient steps.
 */
import {
  parseExpression,
  resolveName,
  type Expr,
  type Grafcet,
  type GrafcetAction,
  type GrafcetStep,
  type GrafcetTransition,
} from '../../../core/grafcet';
import type { IoEntry } from '../../../core/plc';

/** Evolutions allowed in one scan before reporting an unstable cycle. */
export const MAX_EVOLUTIONS = 100;

interface CompiledTransition {
  source: GrafcetTransition;
  expr: Expr | null;
}

export class GrafcetRuntime {
  /** Process image of I, Q and M bits. */
  readonly image = new Map<string, boolean>();
  /** Ids of the active steps. */
  active = new Set<string>();
  /** Time each active step has been active, ms. */
  readonly activeMs = new Map<string, number>();
  /** The last scan hit MAX_EVOLUTIONS: a cycle of transitions never settles. */
  unstable = false;
  scans = 0;

  private readonly transitions: CompiledTransition[];
  private readonly stepByNumber = new Map<number, GrafcetStep>();
  private readonly stepById = new Map<string, GrafcetStep>();
  private readonly compiledConditions = new Map<string, Expr | null>();
  /** Bit values at the end of the previous scan (edges). */
  private previous = new Map<string, boolean>();
  private edgesValid = false;

  constructor(
    private readonly grafcet: Grafcet,
    private readonly io: IoEntry[],
  ) {
    for (const s of grafcet.steps) {
      this.stepByNumber.set(s.number, s);
      this.stepById.set(s.id, s);
    }
    this.transitions = grafcet.transitions.map((source) => {
      const r = parseExpression(source.receptivity);
      return { source, expr: r.ok ? r.expr : null };
    });
    for (const s of grafcet.steps) {
      for (const a of s.actions) {
        if (a.kind !== 'C') continue;
        const r = parseExpression(a.condition);
        this.compiledConditions.set(a.id, r.ok ? r.expr : null);
      }
    }
  }

  /** Bit value of a name (address, symbol or X step); unknown names read false. */
  read(name: string): boolean {
    const r = resolveName(name, this.io);
    if (!r) return false;
    if (r.kind === 'bit') return this.image.get(r.key) === true;
    const step = this.stepByNumber.get(r.number);
    return step ? this.active.has(step.id) : false;
  }

  private previousOf(name: string): boolean {
    const r = resolveName(name, this.io);
    if (!r) return false;
    const key = r.kind === 'bit' ? r.key : `X${r.number}`;
    return this.previous.get(key) === true;
  }

  private evaluate(e: Expr): boolean {
    switch (e.k) {
      case 'or':
        return e.items.some((x) => this.evaluate(x));
      case 'and':
        return e.items.every((x) => this.evaluate(x));
      case 'not':
        return !this.evaluate(e.e);
      case 'var':
        return this.read(e.name);
      case 'rise':
        return this.edgesValid && this.read(e.name) && !this.previousOf(e.name);
      case 'fall':
        return this.edgesValid && !this.read(e.name) && this.previousOf(e.name);
      case 'time': {
        const step = this.stepByNumber.get(e.step);
        return (
          step !== undefined &&
          this.active.has(step.id) &&
          (this.activeMs.get(step.id) ?? 0) >= e.ms
        );
      }
      case 'const':
        return e.v;
    }
  }

  /** Whether all previous steps of a transition are active (for display). */
  isEnabled(t: GrafcetTransition): boolean {
    return t.from.length > 0 && t.from.every((id) => this.active.has(id));
  }

  /** Current value of a transition's receptivity (for display). */
  receptivity(transitionId: string): boolean {
    const t = this.transitions.find((x) => x.source.id === transitionId);
    return t?.expr ? this.evaluate(t.expr) : false;
  }

  private bitOf(action: GrafcetAction): string | null {
    const r = resolveName(action.operand, this.io);
    return r?.kind === 'bit' && !r.key.startsWith('I') ? r.key : null;
  }

  private runStored(step: GrafcetStep): void {
    for (const a of step.actions) {
      if (a.kind !== 'S' && a.kind !== 'R') continue;
      const key = this.bitOf(a);
      if (key) this.image.set(key, a.kind === 'S');
    }
  }

  private activate(step: GrafcetStep): void {
    this.active.add(step.id);
    this.activeMs.set(step.id, 0);
    this.runStored(step);
  }

  /** One evolution; returns whether the situation changed. */
  private evolve(): boolean {
    const fireable = this.transitions.filter(
      (t) => t.expr !== null && this.isEnabled(t.source) && this.evaluate(t.expr),
    );
    if (fireable.length === 0) return false;
    const off = new Set(fireable.flatMap((t) => t.source.from));
    const on = new Set(fireable.flatMap((t) => t.source.to));
    let changed = false;
    for (const id of off) {
      if (on.has(id)) continue; // Rule 5: activated and deactivated stays active.
      this.active.delete(id);
      this.activeMs.delete(id);
      changed = true;
    }
    for (const id of on) {
      if (this.active.has(id)) continue;
      const step = this.stepById.get(id);
      if (step) {
        this.activate(step);
        changed = true;
      }
    }
    return changed;
  }

  private assignContinuous(): void {
    const assigned = new Set<string>();
    const on = new Set<string>();
    for (const s of this.grafcet.steps) {
      for (const a of s.actions) {
        if (a.kind !== 'N' && a.kind !== 'C') continue;
        const key = this.bitOf(a);
        if (!key) continue;
        assigned.add(key);
        if (!this.active.has(s.id)) continue;
        const cond = a.kind === 'C' ? this.compiledConditions.get(a.id) : undefined;
        if (a.kind === 'N' || (cond && this.evaluate(cond))) on.add(key);
      }
    }
    for (const key of assigned) this.image.set(key, on.has(key));
  }

  private snapshot(): void {
    const prev = new Map(this.image);
    for (const s of this.grafcet.steps) prev.set(`X${s.number}`, this.active.has(s.id));
    this.previous = prev;
  }

  /** One PLC scan: `inputs` are the input addresses on; `dtMs` the time since the last scan. */
  scan(inputs: ReadonlySet<string>, dtMs: number): void {
    for (const key of [...this.image.keys()]) if (key.startsWith('I')) this.image.delete(key);
    for (const addr of inputs) this.image.set(addr, true);
    if (this.scans === 0) {
      // Rule 1. No edges on the first scan: nothing was known before it.
      for (const s of this.grafcet.steps) if (s.initial) this.activate(s);
    } else {
      this.edgesValid = true;
      for (const id of this.active) this.activeMs.set(id, (this.activeMs.get(id) ?? 0) + dtMs);
    }
    this.unstable = false;
    let n = 0;
    while (this.evolve()) {
      // An edge is one event: it can only fire transitions in the first evolution.
      this.edgesValid = false;
      if (++n >= MAX_EVOLUTIONS) {
        this.unstable = true;
        break;
      }
    }
    this.edgesValid = false;
    this.assignContinuous();
    this.snapshot();
    this.scans += 1;
  }

  outputs(): Set<string> {
    const out = new Set<string>();
    for (const [k, v] of this.image) if (v && k.startsWith('Q')) out.add(k);
    return out;
  }
}
