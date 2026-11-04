import { GRID, portPosition, transformLocal } from '../../src/core/geometry';

describe('geometry', () => {
  it('rotates clockwise in screen coordinates (y down)', () => {
    expect(transformLocal([10, 0], 90, false)).toEqual([-0, 10]);
    expect(transformLocal([10, 0], 180, false)).toEqual([-10, -0]);
    expect(transformLocal([10, 0], 270, false)).toEqual([0, -10]);
  });

  it('mirrors about the local Y axis before rotating', () => {
    expect(transformLocal([10, 5], 0, true)).toEqual([-10, 5]);
    expect(transformLocal([10, 5], 90, true)).toEqual([-5, -10]);
  });

  it('places ports in canvas pixels on the grid', () => {
    const inst = { x: 200, y: 100, rot: 0 as const, mirror: false };
    expect(portPosition(inst, { x: 1, y: 5 })).toEqual([200 + GRID, 100 + 5 * GRID]);
    expect(portPosition({ ...inst, rot: 90 }, { x: 1, y: 5 })).toEqual([200 - 50, 100 + 10]);
  });
});
