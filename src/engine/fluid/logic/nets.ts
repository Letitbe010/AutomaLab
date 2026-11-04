/**
 * Logic-level fluid graph (SPEC §6.2): connected ports form one node (net);
 * pressure and venting propagate through component edges until stable.
 */
import { ATM, SOURCE, type FluidEdge, type NodeState } from '../../types';

export const portKey = (componentId: string, portId: string) => `${componentId}|${portId}`;

/** Union-find over port keys. */
export class Nets {
  private parent = new Map<string, string>();

  add(key: string): void {
    if (!this.parent.has(key)) this.parent.set(key, key);
  }

  find(key: string): string {
    this.add(key);
    let root = key;
    while (this.parent.get(root) !== root) root = this.parent.get(root)!;
    // Path compression
    let k = key;
    while (this.parent.get(k) !== root) {
      const next = this.parent.get(k)!;
      this.parent.set(k, root);
      k = next;
    }
    return root;
  }

  union(a: string, b: string): void {
    const ra = this.find(a);
    const rb = this.find(b);
    if (ra !== rb) this.parent.set(rb, ra);
  }

  keys(): string[] {
    return [...this.parent.keys()];
  }
}

/** A directed edge between nets (or SOURCE / ATM). */
export interface NetEdge {
  from: string;
  to: string;
  factor: number;
}

export interface Propagation {
  /** Best feed factor per net (absent or 0 = not pressurized). */
  feed: Map<string, number>;
  /** Best vent factor per net. */
  vent: Map<string, number>;
}

/**
 * Widest-path propagation: feed[n] = max over paths from SOURCE of the minimum
 * edge factor; vent[n] = same towards ATM. Graphs are small, so simple
 * relaxation until nothing changes is enough.
 */
export function propagate(edges: NetEdge[]): Propagation {
  const feed = new Map<string, number>([[SOURCE, 1]]);
  const vent = new Map<string, number>([[ATM, 1]]);
  let changed = true;
  let guard = 0;
  while (changed && guard++ < 10_000) {
    changed = false;
    for (const e of edges) {
      const f = Math.min(feed.get(e.from) ?? 0, e.factor);
      if (f > (feed.get(e.to) ?? 0)) {
        feed.set(e.to, f);
        changed = true;
      }
      const v = Math.min(vent.get(e.to) ?? 0, e.factor);
      if (v > (vent.get(e.from) ?? 0)) {
        vent.set(e.from, v);
        changed = true;
      }
    }
  }
  return { feed, vent };
}

export function nodeState(net: string, p: Propagation): NodeState {
  if ((p.feed.get(net) ?? 0) > 0) return 'PRESSURE';
  if ((p.vent.get(net) ?? 0) > 0) return 'EXHAUST';
  return 'BLOCKED';
}

/** Maps a component edge (port ids or pseudo-ports) to net ids. */
export function toNetEdge(edge: FluidEdge, componentId: string, nets: Nets): NetEdge {
  const map = (p: string) => (p === SOURCE || p === ATM ? p : nets.find(portKey(componentId, p)));
  return { from: map(edge.from), to: map(edge.to), factor: edge.factor };
}
