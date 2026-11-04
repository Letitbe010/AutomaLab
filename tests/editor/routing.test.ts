import { nearestOnPolyline, routeWire, simplify } from '../../src/ui/editor/model/routing';
import { isAutoLimitLabel, limitLabel, suggestLabel } from '../../src/ui/editor/model/labels';

describe('routeWire', () => {
  it('keeps straight lines straight', () => {
    expect(routeWire([0, 0], [], [0, 50])).toEqual([
      [0, 0],
      [0, 50],
    ]);
  });

  it('inserts a corner, leaving the port vertically first', () => {
    expect(routeWire([0, 0], [], [40, 30])).toEqual([
      [0, 0],
      [0, 30],
      [40, 30],
    ]);
  });

  it('produces only horizontal and vertical segments through bend points', () => {
    const poly = routeWire(
      [0, 0],
      [
        [30, 20],
        [60, 50],
      ],
      [100, 10],
    );
    for (let i = 0; i < poly.length - 1; i++) {
      const [a, b] = [poly[i]!, poly[i + 1]!];
      expect(a[0] === b[0] || a[1] === b[1]).toBe(true);
    }
    expect(poly[0]).toEqual([0, 0]);
    expect(poly[poly.length - 1]).toEqual([100, 10]);
  });

  it('removes collinear and duplicate points', () => {
    expect(
      simplify([
        [0, 0],
        [0, 10],
        [0, 10],
        [0, 30],
        [20, 30],
      ]),
    ).toEqual([
      [0, 0],
      [0, 30],
      [20, 30],
    ]);
  });

  it('finds the nearest grid point on a polyline', () => {
    const hit = nearestOnPolyline(
      [
        [0, 0],
        [0, 50],
        [80, 50],
      ],
      [33, 47],
    );
    expect(hit).toEqual({ index: 1, point: [30, 50], distance: Math.hypot(3, 3) });
  });
});

describe('suggestLabel', () => {
  it('numbers actuators by group: 1A, 2A, 3A', () => {
    expect(suggestLabel('1A', [])).toBe('1A');
    expect(suggestLabel('1A', ['1A', '2A'])).toBe('3A');
  });

  it('numbers other elements with a suffix: 1V1, 1V2', () => {
    expect(suggestLabel('1V', ['1V1'])).toBe('1V2');
    expect(suggestLabel('0Z', [])).toBe('0Z1');
  });

  it('fills gaps', () => {
    expect(suggestLabel('1V', ['1V2'])).toBe('1V1');
  });
});

describe('limit-valve labels (a0/a1)', () => {
  it('derives a0/a1, b0/b1 from the cylinder label and end', () => {
    expect(limitLabel('1A', '-')).toBe('a0');
    expect(limitLabel('1A', '+')).toBe('a1');
    expect(limitLabel('2A', '+')).toBe('b1');
    expect(limitLabel('B', '-')).toBe('b0');
    expect(limitLabel('cyl', '-')).toBeNull();
  });

  it('only replaces suggested or empty labels', () => {
    expect(isAutoLimitLabel('1S3')).toBe(true);
    expect(isAutoLimitLabel('a1')).toBe(true);
    expect(isAutoLimitLabel('')).toBe(true);
    expect(isAutoLimitLabel('Ate-sentsorea')).toBe(false);
  });
});
