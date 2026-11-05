/** I/O table helpers (pure): symbols and the devices wired to each PLC terminal. */
import { getComponentDef } from '../../components/registry';
import { componentName } from '../../components/text';
import { parseOperand, walkElements, type IoEntry, type Rung } from '../../core/plc';
import type { Project } from '../../core/types';

export function ioEntry(io: IoEntry[], address: string): IoEntry | undefined {
  return io.find((e) => e.address === address);
}

/** Sets symbol/comment of an address; rows left empty are removed. */
export function setIo(io: IoEntry[], address: string, patch: Partial<IoEntry>): IoEntry[] {
  const current = ioEntry(io, address) ?? { address, symbol: '', comment: '' };
  const next = { ...current, ...patch, address };
  const rest = io.filter((e) => e.address !== address);
  return next.symbol === '' && next.comment === '' ? rest : [...rest, next];
}

/** Label (or name) of the component wired directly to each PLC terminal. */
export function wiredDevices(project: Project): Map<string, string> {
  const out = new Map<string, string>();
  const plc = project.components.find((c) => getComponentDef(c.type)?.domain === 'plc');
  if (!plc) return out;
  for (const w of project.connections) {
    for (const [a, b] of [
      [w.from, w.to],
      [w.to, w.from],
    ] as const) {
      if (a[0] !== plc.id) continue;
      const other = project.components.find((c) => c.id === b[0]);
      if (!other || other.type.endsWith('.junction')) continue;
      const def = getComponentDef(other.type);
      const label = typeof other.params.label === 'string' ? other.params.label : '';
      out.set(a[1], label || (def ? componentName(def) : other.type));
    }
  }
  return out;
}

/** Markers (M) and instances used in the program, in order of appearance. */
export function usedMarkers(rungs: Rung[]): string[] {
  const seen = new Set<string>();
  for (const r of rungs) {
    for (const e of walkElements(r.elements)) {
      const texts =
        e.kind === 'contact' || e.kind === 'coil'
          ? [e.operand]
          : e.kind === 'counter'
            ? [e.resetOperand]
            : [];
      for (const t of texts) {
        const op = parseOperand(t);
        if (op?.area === 'M') seen.add(op.key);
      }
    }
  }
  return [...seen].sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
}

/** "Symbol" text for an operand, from the I/O table. */
export function symbolOf(io: IoEntry[], operand: string): string {
  const op = parseOperand(operand);
  return op ? (ioEntry(io, op.key)?.symbol ?? '') : '';
}
