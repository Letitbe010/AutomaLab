import { GRID } from '../../../core/geometry';
import type { Point } from '../../../core/types';

export function snap(v: number, step = GRID): number {
  return Math.round(v / step) * step;
}

export function snapPoint([x, y]: Point, step = GRID): Point {
  return [snap(x, step), snap(y, step)];
}

const same = (a: Point, b: Point) => a[0] === b[0] && a[1] === b[1];

/**
 * Builds an orthogonal polyline through start -> points -> end. Where two
 * consecutive points are not aligned, a corner is inserted. The first segment
 * leaves the port vertically (ports sit on top/bottom edges in most symbols);
 * after that the routing alternates direction. Collinear points are removed.
 */
export function routeWire(start: Point, points: Point[], end: Point): Point[] {
  const input = [start, ...points, end];
  const out: Point[] = [start];
  let lastHorizontal = true; // so the first corner goes vertical first
  for (let i = 1; i < input.length; i++) {
    const a = out[out.length - 1]!;
    const b = input[i]!;
    if (a[0] !== b[0] && a[1] !== b[1]) {
      const corner: Point = lastHorizontal ? [a[0], b[1]] : [b[0], a[1]];
      out.push(corner);
      lastHorizontal = !lastHorizontal;
    } else if (a[0] !== b[0]) {
      lastHorizontal = true;
    } else if (a[1] !== b[1]) {
      lastHorizontal = false;
    }
    out.push(b);
  }
  return simplify(out);
}

/** Removes duplicate and collinear intermediate points. */
export function simplify(poly: Point[]): Point[] {
  const dedup = poly.filter((p, i) => i === 0 || !same(p, poly[i - 1]!));
  if (dedup.length < 3) return dedup;
  const out: Point[] = [dedup[0]!];
  for (let i = 1; i < dedup.length - 1; i++) {
    const a = out[out.length - 1]!;
    const b = dedup[i]!;
    const c = dedup[i + 1]!;
    const collinear = (a[0] === b[0] && b[0] === c[0]) || (a[1] === b[1] && b[1] === c[1]);
    if (!collinear) out.push(b);
  }
  out.push(dedup[dedup.length - 1]!);
  return out;
}

export interface SegmentHit {
  /** Index i of the segment poly[i] -> poly[i + 1]. */
  index: number;
  /** Closest point on the segment, snapped to the grid along the segment. */
  point: Point;
  distance: number;
}

/** Closest point of an orthogonal polyline to p. */
export function nearestOnPolyline(poly: Point[], p: Point): SegmentHit | null {
  let best: SegmentHit | null = null;
  for (let i = 0; i < poly.length - 1; i++) {
    const [ax, ay] = poly[i]!;
    const [bx, by] = poly[i + 1]!;
    let q: Point;
    if (ay === by) {
      const x = Math.min(Math.max(snap(p[0]), Math.min(ax, bx)), Math.max(ax, bx));
      q = [x, ay];
    } else {
      const y = Math.min(Math.max(snap(p[1]), Math.min(ay, by)), Math.max(ay, by));
      q = [ax, y];
    }
    const d = Math.hypot(q[0] - p[0], q[1] - p[1]);
    if (!best || d < best.distance) best = { index: i, point: q, distance: d };
  }
  return best;
}
