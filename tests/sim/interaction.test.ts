import { inverseTransformLocal, transformLocal } from '../../src/core/geometry';
import type { Point, Rotation } from '../../src/core/types';
import { clickSide, clickTarget, spacePhase } from '../../src/ui/sim/interaction';
import { formatSimTime } from '../../src/ui/sim/format';

describe('inverseTransformLocal', () => {
  it.each([0, 90, 180, 270] as Rotation[])(
    'undoes transformLocal at %i° (with and without mirror)',
    (rot) => {
      for (const mirror of [false, true]) {
        const p: Point = [30, -10];
        expect(inverseTransformLocal(transformLocal(p, rot, mirror), rot, mirror)).toEqual(p);
      }
    },
  );
});

describe('clickTarget', () => {
  it('push-button valves are clicked on the left operator', () => {
    expect(clickTarget('pn.valve.3-2.button-spring')).toEqual({ left: true, right: false });
  });

  it('pilot-only valves and cylinders are not clickable', () => {
    expect(clickTarget('pn.valve.5-2.pilot')).toBeUndefined();
    expect(clickTarget('pn.cyl.double')).toBeUndefined();
  });

  it('double solenoid valves can be overridden on both sides', () => {
    expect(clickTarget('pn.valve.5-2.sol')).toEqual({ left: true, right: true });
  });

  it('the shut-off valve toggles', () => {
    expect(clickTarget('pn.valve.shutoff')).toMatchObject({ toggle: true });
  });
});

describe('clickSide', () => {
  const both = { left: true, right: true };
  const at = { x: 100, y: 100, rot: 0 as Rotation, mirror: false };

  it('uses the half of the rest box under the pointer', () => {
    expect(clickSide(at, both, [105, 120])).toBe('left');
    expect(clickSide(at, both, [135, 120])).toBe('right');
  });

  it('accounts for mirroring', () => {
    expect(clickSide({ ...at, mirror: true }, both, [95, 120])).toBe('left');
  });

  it('single-sided targets always give that side', () => {
    expect(clickSide(at, { left: true, right: false }, [190, 120])).toBe('left');
  });
});

describe('spacePhase', () => {
  const cyl = [
    { id: 'a', label: '1A', start: 0 },
    { id: 'b', label: '2A', start: 0 },
  ];
  const ev = (name: string, componentId: string, timeMs: number) => ({ name, componentId, timeMs });

  it('builds the displacement–step diagram of A+ B+ B- A-', () => {
    const d = spacePhase(
      [ev('1A+', 'a', 1), ev('2A+', 'b', 2), ev('2A-', 'b', 3), ev('1A-', 'a', 4)],
      cyl,
    );
    expect(d.steps).toEqual(['1A+', '2A+', '2A-', '1A-']);
    expect(d.rows.map((r) => r.values)).toEqual([
      [0, 1, 1, 1, 0],
      [0, 0, 1, 0, 0],
    ]);
  });

  it('keeps only the last steps but starts them from the right values', () => {
    const events = [ev('1A+', 'a', 1), ev('2A+', 'b', 2), ev('2A-', 'b', 3)];
    const d = spacePhase(events, cyl, 2);
    expect(d.steps).toEqual(['2A+', '2A-']);
    expect(d.rows.map((r) => r.values)).toEqual([
      [1, 1, 1],
      [0, 1, 0],
    ]);
  });
});

describe('formatSimTime', () => {
  it('uses a decimal comma', () => {
    expect(formatSimTime(3420)).toBe('3,42 s');
  });
});
