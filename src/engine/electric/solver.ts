/**
 * Electric control solver, 24 V DC (SPEC §6.4). Pure functions over nets
 * (union-find roots of connected electric ports):
 *   - closed contacts conduct between their two nets;
 *   - a load (coil, lamp) is energised when one terminal reaches +24 V and
 *     the other reaches 0 V through conductors only;
 *   - a net reached from both +24 V and 0 V is a short circuit.
 */

export interface ElectricLoad {
  id: string;
  a: string;
  b: string;
}

export interface CircuitResult {
  /** Nets connected to +24 V / 0 V through conductors. */
  plus: Set<string>;
  minus: Set<string>;
  /** Ids of energised loads. */
  energized: Set<string>;
  /** Nets connected to both poles (short circuit). */
  short: string[];
}

function reach(start: string[], conductors: [string, string][]): Set<string> {
  const adj = new Map<string, string[]>();
  for (const [a, b] of conductors) {
    if (a === b) continue;
    adj.set(a, [...(adj.get(a) ?? []), b]);
    adj.set(b, [...(adj.get(b) ?? []), a]);
  }
  const seen = new Set(start);
  const queue = [...start];
  while (queue.length) {
    for (const n of adj.get(queue.pop()!) ?? []) {
      if (!seen.has(n)) {
        seen.add(n);
        queue.push(n);
      }
    }
  }
  return seen;
}

export function solveCircuit(
  plusNets: string[],
  minusNets: string[],
  conductors: [string, string][],
  loads: ElectricLoad[],
): CircuitResult {
  const plus = reach(plusNets, conductors);
  const minus = reach(minusNets, conductors);
  const energized = new Set(
    loads
      .filter((l) => (plus.has(l.a) && minus.has(l.b)) || (plus.has(l.b) && minus.has(l.a)))
      .map((l) => l.id),
  );
  const short = [...plus].filter((n) => minus.has(n)).sort();
  return { plus, minus, energized, short };
}

/** Whether a contact conducts: normally-open contacts close when actuated, NC ones open. */
export const contactClosed = (normally: 'open' | 'closed', actuated: boolean) =>
  normally === 'open' ? actuated : !actuated;
