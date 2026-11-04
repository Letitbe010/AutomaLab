/**
 * Reusable SVG pieces for fluid-power symbols, drawn from scratch following the
 * conventions of ISO 1219-1 (boxes per switching position, flow arrows, blocked
 * ports, springs). Coordinates are local pixels; GRID (10 px) is one unit.
 */
import type { ReactNode } from 'react';

export const STROKE = 'var(--sym-stroke)';
export const STROKE_W = 1.5;

export function SymbolGroup({ children }: { children: ReactNode }) {
  return (
    <g
      fill="none"
      stroke={STROKE}
      strokeWidth={STROKE_W}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </g>
  );
}

/** Straight line with a filled arrowhead at (x2, y2). */
export function FlowArrow({
  x1,
  y1,
  x2,
  y2,
  head = 6,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  head?: number;
}) {
  const len = Math.hypot(x2 - x1, y2 - y1);
  const ux = (x2 - x1) / len;
  const uy = (y2 - y1) / len;
  const bx = x2 - ux * head;
  const by = y2 - uy * head;
  const w = head * 0.45;
  const points = `${x2},${y2} ${bx - uy * w},${by + ux * w} ${bx + uy * w},${by - ux * w}`;
  return (
    <>
      <line x1={x1} y1={y1} x2={bx} y2={by} />
      <polygon points={points} fill={STROKE} />
    </>
  );
}

/** Blocked port: a stub entering the box from an edge, closed by a crossbar. */
export function Blocked({ x, y, dir }: { x: number; y: number; dir: 'up' | 'down' }) {
  const len = 7;
  const s = dir === 'up' ? -1 : 1;
  const ey = y + s * len;
  return (
    <>
      <line x1={x} y1={y} x2={x} y2={ey} />
      <line x1={x - 5} y1={ey} x2={x + 5} y2={ey} />
    </>
  );
}

/** Horizontal zig-zag spring from x1 to x2, centred on y. */
export function Spring({
  x1,
  x2,
  y,
  amplitude = 6,
  coils = 4,
}: {
  x1: number;
  x2: number;
  y: number;
  amplitude?: number;
  coils?: number;
}) {
  const steps = coils * 2;
  const dx = (x2 - x1) / steps;
  const pts: string[] = [`${x1},${y}`];
  for (let i = 1; i < steps; i++) {
    pts.push(`${x1 + i * dx},${y + (i % 2 === 1 ? -amplitude : amplitude)}`);
  }
  pts.push(`${x2},${y}`);
  return <polyline points={pts.join(' ')} />;
}

/** Valve switching-position box (square, side = size). */
export function ValveBox({ x, y, size = 40 }: { x: number; y: number; size?: number }) {
  return <rect x={x} y={y} width={size} height={size} />;
}

export type OperatorKind =
  | 'spring'
  | 'button'
  | 'pedal'
  | 'lever'
  | 'roller'
  | 'idleRoller'
  | 'pilot'
  | 'solenoid'
  | 'springAdj'
  | 'timedPilot';

/** Horizontal extent (px) of each operator symbol, measured outward from the box edge. */
export const OPERATOR_WIDTH: Record<OperatorKind, number> = {
  spring: 22,
  springAdj: 22,
  timedPilot: 10,
  button: 17,
  pedal: 17,
  lever: 16,
  roller: 18,
  idleRoller: 18,
  pilot: 10,
  solenoid: 14,
};

/**
 * Valve operator drawn at the origin (the box edge), extending towards negative x.
 * Right-hand operators are mirrored by the caller.
 */
// TODO(galdetu): review every operator shape against ISO 1219-1 (button, pedal, lever,
// roller, idle-return roller, pneumatic pilot, solenoid, spring).
export function OperatorSymbol({ kind }: { kind: OperatorKind }) {
  switch (kind) {
    case 'spring':
      return <Spring x1={0} x2={-22} y={0} amplitude={5} coils={3} />;
    case 'springAdj':
      return (
        <>
          <Spring x1={0} x2={-22} y={0} amplitude={5} coils={3} />
          <FlowArrow x1={-20} y1={8} x2={-3} y2={-9} head={4} />
        </>
      );
    case 'button':
      return (
        <>
          <line x1={0} y1={0} x2={-10} y2={0} />
          <path d="M -10 -7 A 7 7 0 0 0 -10 7" />
          <line x1={-10} y1={-7} x2={-10} y2={7} />
        </>
      );
    case 'pedal':
      return (
        <>
          <line x1={0} y1={0} x2={-8} y2={0} />
          <line x1={-8} y1={0} x2={-15} y2={7} />
          <line x1={-17} y1={4} x2={-12} y2={9} />
        </>
      );
    case 'lever':
      return (
        <>
          <line x1={0} y1={0} x2={-8} y2={0} />
          <line x1={-8} y1={0} x2={-14} y2={-8} />
          <circle cx={-15.2} cy={-9.6} r={2} />
        </>
      );
    case 'roller':
      return (
        <>
          <line x1={0} y1={0} x2={-10} y2={0} />
          <circle cx={-14} cy={0} r={4} />
          <circle cx={-14} cy={0} r={1} fill={STROKE} />
        </>
      );
    case 'idleRoller':
      // One-way roller: articulated arm with a hinge (Creus, app. 8.2).
      return (
        <>
          <line x1={0} y1={0} x2={-6} y2={0} />
          <circle cx={-6} cy={0} r={1.5} />
          <line x1={-7} y1={1} x2={-12} y2={6} />
          <circle cx={-15} cy={9} r={4} />
          <circle cx={-15} cy={9} r={1} fill={STROKE} />
        </>
      );
    case 'pilot':
    case 'timedPilot':
      // Pneumatic pilot: small box with a hollow triangle pointing at the valve.
      return (
        <>
          <rect x={-10} y={-5} width={10} height={10} fill="var(--panel)" />
          <polygon points="-2,0 -8,-3.5 -8,3.5" fill="var(--panel)" />
        </>
      );
    case 'solenoid':
      return (
        <>
          <line x1={0} y1={0} x2={-4} y2={0} />
          <rect x={-14} y={-6} width={10} height={12} />
          <line x1={-14} y1={6} x2={-4} y2={-6} />
        </>
      );
  }
}

/** Adjustable throttle (two arcs and an arrow), centred at (x, y), horizontal flow. */
export function Throttle({ x, y, w = 14 }: { x: number; y: number; w?: number }) {
  const h = w / 2;
  return (
    <>
      <path d={`M ${x - h} ${y - 4} Q ${x} ${y + 1} ${x + h} ${y - 4}`} />
      <path d={`M ${x - h} ${y + 4} Q ${x} ${y - 1} ${x + h} ${y + 4}`} />
    </>
  );
}

/**
 * Fixed part of a pneumatic time-delay pilot, between the pilot port (x0) and
 * the box strip: a one-way throttle and an air reservoir.
 */
export function TimerPilotLine({ x0, x1, y }: { x0: number; x1: number; y: number }) {
  const tx = x0 + 14;
  const rx = x0 + 32;
  return (
    <>
      <line x1={x0} y1={y} x2={tx - 7} y2={y} />
      <Throttle x={tx} y={y} />
      <FlowArrow x1={tx - 6} y1={y + 7} x2={tx + 6} y2={y - 8} head={3.5} />
      <line x1={tx + 7} y1={y} x2={x1} y2={y} strokeDasharray="4 3" />
      <line x1={rx} y1={y} x2={rx} y2={y + 6} />
      <rect x={rx - 6} y={y + 6} width={12} height={8} rx={3} />
    </>
  );
}

/** Push-button operator attached to the left edge at (x, y). */
export function PushButtonOperator({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <OperatorSymbol kind="button" />
    </g>
  );
}

/** Exhaust to atmosphere: hollow triangle pointing away from the port (pneumatic). */
export function ExhaustTriangle({ x, y }: { x: number; y: number }) {
  return <polygon points={`${x},${y} ${x - 6},${y + 8} ${x + 6},${y + 8}`} fill="var(--panel)" />;
}

/** Valve seat (V) with its vertex at (x, y), opening towards +x (dir = 1) or -x (dir = -1). */
export function Seat({ x, y, dir }: { x: number; y: number; dir: 1 | -1 }) {
  return <polyline points={`${x + dir * 6},${y - 6} ${x},${y} ${x + dir * 6},${y + 6}`} />;
}
