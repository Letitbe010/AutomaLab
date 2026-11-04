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

/** Push-button operator attached to the left edge at (x, y): stem plus rounded head. */
// TODO(galdetu): review the push-button operator shape against ISO 1219-1.
export function PushButtonOperator({ x, y }: { x: number; y: number }) {
  return (
    <>
      <line x1={x} y1={y} x2={x - 10} y2={y} />
      <path d={`M ${x - 10} ${y - 7} A 7 7 0 0 0 ${x - 10} ${y + 7}`} />
      <line x1={x - 10} y1={y - 7} x2={x - 10} y2={y + 7} />
    </>
  );
}
