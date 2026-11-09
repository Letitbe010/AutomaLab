/**
 * Electropneumatic project from a sequence (SPEC §8.8.7, decided 2026-11-09):
 * bistable solenoid valves, two reed sensors per cylinder, a wired PLC and the
 * GRAFCET it runs. One press of S1 runs one cycle.
 */
import { PLC_INPUTS, PLC_OUTPUTS, type IoEntry } from '../core/plc';
import type { Grafcet, GrafcetStep, GrafcetTransition } from '../core/grafcet';
import { createEmptyProject } from '../core/project';
import type { ComponentInstance, Connection, Point, Project } from '../core/types';
import {
  cylinderLabel,
  cylinderNumber,
  lettersOf,
  moveText,
  sequenceText,
  type Move,
} from './sequence';

/** The CPU has 10 outputs, and each cylinder uses 2. */
export const MAX_PLC_CYLINDERS = Math.floor(PLC_OUTPUTS.length / 2);

const CYL_PITCH = 240;
const STEP_PITCH = 160;
const COLUMN = 60;

const sensorSymbol = (m: Move) => `${m.letter}_${m.sign === '+' ? 'aurrean' : 'atzean'}`;
const outputSymbol = (m: Move) => `${m.letter}_${m.sign === '+' ? 'atera' : 'itzuli'}`;

export function generateGrafcet(moves: Move[]): Grafcet {
  const letters = lettersOf(moves);
  const atRest = letters.map((l) => `${l}_atzean`).join(' * ');
  const y = (i: number) => 40 + i * STEP_PITCH;
  const steps: GrafcetStep[] = [
    { id: 'x1', number: 1, initial: true, x: 120, y: y(0), comment: '', actions: [] },
    ...moves.map((m, i) => ({
      id: `x${i + 2}`,
      number: i + 2,
      initial: false,
      x: 120,
      y: y(i + 1),
      comment: moveText(m),
      actions: [{ id: `a${i + 1}`, kind: 'N' as const, operand: outputSymbol(m), condition: '' }],
    })),
  ];
  const transitions: GrafcetTransition[] = [
    {
      id: 't1',
      receptivity: `Martxa * ${atRest}`,
      x: 120,
      y: y(0) + STEP_PITCH / 2,
      comment: '',
      from: ['x1'],
      to: ['x2'],
    },
    ...moves.map((m, i) => ({
      id: `t${i + 2}`,
      receptivity: sensorSymbol(m),
      x: 120,
      y: y(i + 1) + STEP_PITCH / 2,
      comment: '',
      from: [`x${i + 2}`],
      to: [i === moves.length - 1 ? 'x1' : `x${i + 3}`],
    })),
  ];
  return { steps, transitions };
}

export function generatePlcProject(moves: Move[]): Project {
  const letters = lettersOf(moves);
  const components: ComponentInstance[] = [];
  const connections: Connection[] = [];
  const add = (
    id: string,
    type: string,
    x: number,
    y: number,
    params: Record<string, string | number | boolean> = {},
  ) => components.push({ id, type, x, y, rot: 0, mirror: false, params });
  const wire = (
    kind: 'fluid' | 'electric',
    from: [string, string],
    to: [string, string],
    points: Point[] = [],
  ) => connections.push({ id: `w${connections.length + 1}`, kind, from, to, points });

  // --- Pneumatic part (left) ---
  const X0 = 60;
  const ySupply = 260;
  add('z1', 'pn.source', 20, ySupply + 60, { label: '0Z1' });
  add('jz', 'fluid.junction', 20, ySupply);
  wire('fluid', ['z1', '1'], ['jz', 'j']);
  let previous = 'jz';
  letters.forEach((letter, i) => {
    const x = X0 + i * CYL_PITCH;
    const num = cylinderNumber(letter);
    add(`c${letter}`, 'pn.cyl.double', x, 40, { label: cylinderLabel(letter) });
    add(`v${letter}`, 'pn.valve.5-2.sol', x, 170, {
      label: `${num}V1`,
      coilLeft: `Y${2 * i + 1}`,
      coilRight: `Y${2 * i + 2}`,
    });
    wire('fluid', [`v${letter}`, '4'], [`c${letter}`, 'A']);
    wire('fluid', [`v${letter}`, '2'], [`c${letter}`, 'B'], [[x + 30, 80]]);
    const j = `jv${letter}`;
    add(j, 'fluid.junction', x + 20, ySupply);
    wire('fluid', [previous, 'j'], [j, 'j']);
    wire('fluid', [j, 'j'], [`v${letter}`, '1']);
    previous = j;
  });

  // --- Electric part (right): input column per device, PLC, one coil per output ---
  const ex = X0 + letters.length * CYL_PITCH + 60;
  const io: IoEntry[] = [];
  const inputs: { id: string; type: string; label: string; symbol: string; extra?: object }[] = [
    { id: 's1', type: 'el.button.no', label: 'S1', symbol: 'Martxa' },
  ];
  letters.forEach((letter) => {
    const num = cylinderNumber(letter);
    const cylinder = cylinderLabel(letter);
    inputs.push(
      {
        id: `b${num}1`,
        type: 'el.reed',
        label: `${num}B1`,
        symbol: `${letter}_atzean`,
        extra: { cylinder, at: '-' },
      },
      {
        id: `b${num}2`,
        type: 'el.reed',
        label: `${num}B2`,
        symbol: `${letter}_aurrean`,
        extra: { cylinder, at: '+' },
      },
    );
  });

  const yPlc = 90 + inputs.length * 10;
  add('plc', 'plc.cpu1214c', ex, yPlc, { label: 'PLC1', scanMs: 10 });

  inputs.forEach((d, i) => {
    const address = PLC_INPUTS[i]!;
    const x = ex + i * COLUMN;
    add(`p${i}`, 'el.plus', x, 0);
    add(d.id, d.type, x, 30, {
      label: d.label,
      ...((d.extra ?? {}) as Record<string, string>),
    });
    wire('electric', [`p${i}`, 'p'], [d.id, '13']);
    const port = ex + 20 + i * 20;
    const y = 80 + i * 10;
    wire(
      'electric',
      [d.id, '14'],
      ['plc', address],
      [
        [x, y],
        [port, y],
      ],
    );
    io.push({ address, symbol: d.symbol, comment: d.label });
  });

  const outputs = letters.flatMap((letter) => [
    { letter, sign: '+' as const },
    { letter, sign: '-' as const },
  ]);
  const yCoil = yPlc + 90 + outputs.length * 10;
  outputs.forEach((m, i) => {
    const address = PLC_OUTPUTS[i]!;
    const label = `Y${i + 1}`;
    const x = ex + i * COLUMN;
    add(`y${i + 1}`, 'el.solenoid', x, yCoil, { label });
    add(`m${i}`, 'el.minus', x, yCoil + 70);
    const port = ex + 20 + i * 20;
    const y = yPlc + 70 + (outputs.length - i) * 10;
    wire(
      'electric',
      ['plc', address],
      [`y${i + 1}`, 'A1'],
      [
        [port, y],
        [x, y],
      ],
    );
    wire('electric', [`y${i + 1}`, 'A2'], [`m${i}`, 'p']);
    io.push({ address, symbol: outputSymbol(m), comment: label });
  });

  const project = createEmptyProject(`GRAFCET: ${sequenceText(moves)}`);
  project.components = components;
  project.connections = connections;
  project.plc = { io, ladder: [], grafcet: generateGrafcet(moves), language: 'grafcet' };
  return project;
}
