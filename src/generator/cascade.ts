/**
 * Pneumatic cascade circuit from a sequence (SPEC §8.8.4), with an automatic
 * layout: cylinders on top, power valves, limit valves, group lines and the
 * memories at the bottom (Creus 7.2.6.2).
 *
 * The memories form a chain. Memory k gives line k on port 4 and feeds the next
 * memory on port 2; the last one gives the last line. All of them rest on port 2,
 * so the last group is active at rest. Going from group k to k + 1 switches
 * memory k; going from the last group to the first switches memory 1; while
 * line k has pressure it pilots memory k + 1 back to port 4 (staggered).
 */
import { createEmptyProject } from '../core/project';
import type { ComponentInstance, Connection, Point, Project } from '../core/types';
import {
  cascadeGroups,
  cylinderLabel,
  cylinderNumber,
  groupName,
  lettersOf,
  limitName,
  moveName,
  sequenceText,
  type Move,
} from './sequence';

const COL = 300;
const X_CYL = 160;
const X_RISER = 20;
const X_LINE_TAIL = 50;
const Y_CYL = 40;
const Y_VALVE = 170;
const Y_SUPPLY = 250;
const Y_OR = 310;
const OR_ROW = 50;
const SLOT = 170;
const MEM_PITCH = 180;
const LINE_GAP = 20;

type End = [string, string];

class Builder {
  components: ComponentInstance[] = [];
  connections: Connection[] = [];

  add(
    id: string,
    type: string,
    x: number,
    y: number,
    params: Record<string, string | number | boolean> = {},
  ): string {
    this.components.push({ id, type, x, y, rot: 0, mirror: false, params });
    return id;
  }

  wire(from: End, to: End, points: Point[] = []): void {
    this.connections.push({
      id: `w${this.connections.length + 1}`,
      kind: 'fluid',
      from,
      to,
      points,
    });
  }
}

/** Target of a signal: a pilot on an upper row, reached by a vertical from below. */
interface Sink {
  end: End;
  x: number;
}

type Source = { kind: 'limit'; step: number } | { kind: 'line'; line: number; step: number };

export function generateCascade(moves: Move[]): Project {
  const n = moves.length;
  const letters = lettersOf(moves);
  const { groups } = cascadeGroups(moves);
  const G = groups.length;
  const last = n - 1;
  const groupOf = (step: number) => groups.findIndex((g) => g.includes(step));
  const b = new Builder();

  // --- Cylinders and power valves ---
  const colX = (letter: string) => X_CYL + letters.indexOf(letter) * COL;
  for (const letter of letters) {
    const x = colX(letter);
    const num = cylinderNumber(letter);
    b.add(`c${letter}`, 'pn.cyl.double', x, Y_CYL, { label: cylinderLabel(letter) });
    b.add(`v${letter}`, 'pn.valve.5-2.pilot', x, Y_VALVE, { label: `${num}V1` });
    b.wire([`v${letter}`, '4'], [`c${letter}`, 'A']);
    b.wire([`v${letter}`, '2'], [`c${letter}`, 'B'], [[x + 30, Y_CYL + 40]]);
  }

  // --- What commands each step ---
  const sourceOf = (step: number): Source => {
    const prev = (step - 1 + n) % n;
    if (groupOf(prev) === groupOf(step)) return { kind: 'limit', step: prev };
    return { kind: 'line', line: groupOf(step), step };
  };

  /** Commands of every pilot of the power valves ("A+" → list of steps). */
  const commands = new Map<string, number[]>();
  for (const [step, m] of moves.entries()) {
    const key = moveName(m);
    commands.set(key, [...(commands.get(key) ?? []), step]);
  }
  const depth = Math.max(0, ...[...commands.values()].map((s) => s.length - 1));
  const orCount = new Map<string, number>();

  // A pilot with several commands needs OR valves: inputs of a blind T would vent.
  const stepSink = new Map<number, Sink>();
  for (const [key, steps] of commands) {
    const letter = key[0]!;
    const plus = key[1] === '+';
    const pilotX = colX(letter) + (plus ? -60 : 60);
    const pilot: End = [`v${letter}`, plus ? '14' : '12'];
    if (steps.length === 1) {
      stepSink.set(steps[0]!, { end: pilot, x: pilotX });
      continue;
    }
    // Staircase of OR valves, each output aligned with the input above.
    let target = pilot;
    let targetX = pilotX;
    for (let i = 0; i < steps.length - 1; i++) {
      const count = (orCount.get(letter) ?? 0) + 1;
      orCount.set(letter, count);
      const id = `or${letter}${count}`;
      const orX = targetX - 20;
      b.add(id, 'pn.valve.or', orX, Y_OR + i * OR_ROW, {
        label: `${cylinderNumber(letter)}V${count + 1}`,
      });
      b.wire([id, '2'], target);
      stepSink.set(steps[i]!, { end: [id, 'Y'], x: orX + 40 });
      if (i === steps.length - 2) stepSink.set(steps[i + 1]!, { end: [id, 'X'], x: orX });
      target = [id, 'X'];
      targetX = orX;
    }
  }

  // --- Vertical sizes, once the number of tracks is known ---
  const memorySignals = G; // one per group change
  const trackTop = Y_OR + depth * OR_ROW + 10;
  const trackCount = n + memorySignals;
  const yRoller = trackTop + trackCount * 10 + 30;
  const yLine = (k: number) => yRoller + 90 + k * LINE_GAP;
  const yBand = yLine(G - 1) + 20;
  const yMem = yBand + memorySignals * 10 + 30;
  const yBottom = yMem + 90;

  let nextTrack = 0;
  const track = () => trackTop + nextTrack++ * 10;
  let nextBand = 0;
  const band = () => yBand + nextBand++ * 10;

  // --- Limit valves, in step order; the start button sits before the last one ---
  const slotX = (slot: number) => X_CYL + slot * SLOT;
  const limitX = (step: number) => slotX(step === last ? n : step);
  const startX = slotX(last);
  const used = new Map<string, number>();
  const limitId = (step: number) => `s${step + 1}`;
  for (const [step, m] of moves.entries()) {
    const base = limitName(m);
    const count = (used.get(base) ?? 0) + 1;
    used.set(base, count);
    b.add(limitId(step), 'pn.valve.3-2.roller-spring', limitX(step), yRoller, {
      label: count === 1 ? base : `${base}.${count}`,
      cylinder: cylinderLabel(m.letter),
      at: m.sign,
    });
  }
  b.add('st', 'pn.valve.3-2.button-spring', startX, yRoller, { label: '0S1' });

  // --- Group lines ---
  const lineNodes = groups.map(() => new Map<number, string>());
  const lineNode = (k: number, x: number): string => {
    const nodes = lineNodes[k]!;
    const found = nodes.get(x);
    if (found) return found;
    const id = `j${k + 1}_${x}`;
    b.add(id, 'fluid.junction', x, yLine(k));
    nodes.set(x, id);
    return id;
  };

  // Limit valves are fed by the line of their step's group.
  for (let step = 0; step < n; step++) {
    if (step === last) continue;
    const x = limitX(step) + 10;
    b.wire([lineNode(groupOf(step), x), 'j'], [limitId(step), '1']);
  }
  // Start button in series with the last limit valve.
  b.wire([lineNode(G - 1, startX + 10), 'j'], ['st', '1']);
  const lastX = limitX(last);
  b.wire(
    ['st', '2'],
    [limitId(last), '1'],
    [
      [startX + 10, yRoller - 20],
      [lastX - 80, yRoller - 20],
      [lastX - 80, yRoller + 70],
      [lastX + 10, yRoller + 70],
    ],
  );

  // --- Memories ---
  const memX = (k: number) => X_CYL + 100 + k * MEM_PITCH;
  const mem = (k: number) => `m${k + 1}`;
  for (let k = 0; k < G - 1; k++) {
    b.add(mem(k), 'pn.valve.5-2.pilot', memX(k), yMem, { label: `0V${k + 1}` });
    b.wire([lineNode(k, memX(k) + 10), 'j'], [mem(k), '4']);
    if (k < G - 2) {
      // Port 2 feeds the next memory.
      const gx = memX(k) + 90;
      b.wire(
        [mem(k), '2'],
        [mem(k + 1), '1'],
        [
          [memX(k) + 30, yMem - 20],
          [gx, yMem - 20],
          [gx, yMem + 60],
          [memX(k + 1) + 20, yMem + 60],
        ],
      );
      // While line k has pressure, the next memory is piloted back (staggered).
      const px = memX(k + 1) - 60;
      b.wire([lineNode(k, px), 'j'], [mem(k + 1), '14']);
    } else {
      b.wire([lineNode(G - 1, memX(k) + 30), 'j'], [mem(k), '2']);
    }
  }

  /** Routes the output of a limit valve (or start series) to a pilot above. */
  const toPilot = (step: number, sink: Sink) => {
    const x = limitX(step) + 10;
    const t = track();
    b.wire([limitId(step), '2'], sink.end, [
      [x, t],
      [sink.x, t],
    ]);
  };

  /** Routes a line to a pilot above, through the gutter left of a slot. */
  const lineToPilot = (line: number, step: number, sink: Sink) => {
    const gx = limitX(step) - 70;
    const t = track();
    b.wire([lineNode(line, gx), 'j'], sink.end, [
      [gx, t],
      [sink.x, t],
    ]);
  };

  /** Routes the output of a limit valve down to a memory pilot. */
  const toMemory = (step: number, end: End, pilotX: number) => {
    const x = limitX(step) + 10;
    const gx = limitX(step) - 90;
    const t = track();
    const y = band();
    b.wire([limitId(step), '2'], end, [
      [x, t],
      [gx, t],
      [gx, y],
      [pilotX, y],
    ]);
  };

  // --- Commands of the steps ---
  for (let step = 0; step < n; step++) {
    const sink = stepSink.get(step)!;
    const source = sourceOf(step);
    if (source.kind === 'limit') toPilot(source.step, sink);
    else if (source.kind === 'line') lineToPilot(source.line, step, sink);
  }

  // --- Group changes: the last limit valve of each group switches a memory ---
  for (let k = 0; k < G; k++) {
    const group = groups[k]!;
    const end = group[group.length - 1]!;
    // The last group closes the cycle: it switches the first memory.
    if (k < G - 1) toMemory(end, [mem(k), '12'], memX(k) + 60);
    else toMemory(end, [mem(0), '14'], memX(0) - 60);
  }

  // --- Line segments, drawn as chains of T-junctions ---
  lineNodes.forEach((nodes, k) => {
    // A tail on the left carries the name of the group, clear of the other wires.
    lineNode(k, X_LINE_TAIL);
    const xs = [...nodes.keys()].sort((a, c) => a - c);
    xs.slice(1).forEach((x, i) => {
      b.wire([nodes.get(xs[i]!)!, 'j'], [nodes.get(x)!, 'j']);
    });
    const first = b.components.find((c) => c.id === nodes.get(xs[0]!));
    if (first) first.params.label = groupName(k);
  });

  // --- Supply ---
  b.add('z1', 'pn.source', X_RISER, yBottom + 40, { label: '0Z1' });
  b.add('jb', 'fluid.junction', X_RISER, yBottom);
  b.add('jt', 'fluid.junction', X_RISER, Y_SUPPLY);
  b.wire(['z1', '1'], ['jb', 'j']);
  b.wire(['jb', 'j'], ['jt', 'j']);
  b.wire(['jb', 'j'], [mem(0), '1'], [[memX(0) + 20, yBottom]]);
  let previous = 'jt';
  for (const letter of letters) {
    const x = colX(letter) + 20;
    const id = `jv${letter}`;
    b.add(id, 'fluid.junction', x, Y_SUPPLY);
    b.wire([previous, 'j'], [id, 'j']);
    b.wire([id, 'j'], [`v${letter}`, '1']);
    previous = id;
  }

  const project = createEmptyProject(`Kaskada: ${sequenceText(moves)}`);
  project.components = b.components;
  project.connections = b.connections;
  return project;
}
