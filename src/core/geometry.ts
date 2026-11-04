import type { PortDef } from './componentDef';
import type { ComponentInstance, Point, Rotation } from './types';

/** Grid module (SPEC §9): 10 px = 1 unit. Ports sit on grid points. */
export const GRID = 10;

/** Applies mirror (about the local Y axis) and then rotation (clockwise, screen coordinates). */
export function transformLocal([x, y]: Point, rot: Rotation, mirror: boolean): Point {
  const mx = mirror ? -x : x;
  switch (rot) {
    case 0:
      return [mx, y];
    case 90:
      return [-y, mx];
    case 180:
      return [-mx, -y];
    case 270:
      return [y, -mx];
  }
}

/** Canvas position (pixels) of a port of a placed component. */
export function portPosition(
  instance: Pick<ComponentInstance, 'x' | 'y' | 'rot' | 'mirror'>,
  port: Pick<PortDef, 'x' | 'y'>,
): Point {
  const [dx, dy] = transformLocal([port.x * GRID, port.y * GRID], instance.rot, instance.mirror);
  return [instance.x + dx, instance.y + dy];
}

/** SVG transform string matching transformLocal (mirror first, then rotate). */
export function svgTransform(instance: Pick<ComponentInstance, 'x' | 'y' | 'rot' | 'mirror'>) {
  const parts = [`translate(${instance.x} ${instance.y})`];
  if (instance.rot !== 0) parts.push(`rotate(${instance.rot})`);
  if (instance.mirror) parts.push('scale(-1 1)');
  return parts.join(' ');
}
