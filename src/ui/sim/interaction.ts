/** Pure helpers for interacting with a running simulation (SPEC §7.3). */
import { BOX, VALVE_SPECS, type Operator } from '../../components/pneumatic/valveSpecs';
import { ELECTRIC_ROLES } from '../../components/electric/roles';
import { inverseTransformLocal } from '../../core/geometry';
import type { ComponentInstance, Point } from '../../core/types';
import type { SimEvent } from '../../engine/types';

/** Operators the user can actuate by clicking (manual override for solenoids and rollers). */
const CLICKABLE: Operator[] = ['button', 'pedal', 'lever', 'roller', 'idleRoller', 'solenoid'];

export interface ClickTarget {
  left: boolean;
  right: boolean;
  /** Toggle on click instead of "pressed while held" (shut-off valve). */
  toggle?: boolean;
}

const VALVE_TARGETS = new Map(
  VALVE_SPECS.map((s) => [
    s.type,
    {
      left: CLICKABLE.includes(s.left[0]!),
      right: CLICKABLE.includes(s.right[0]!),
    } satisfies ClickTarget,
  ]),
);

export function clickTarget(type: string): ClickTarget | undefined {
  if (type === 'pn.valve.shutoff') return { left: true, right: false, toggle: true };
  const role = ELECTRIC_ROLES[type];
  if (role?.kind === 'contact') {
    // Buttons are held, switches keep their state; sensors can be forced by hand (manual override).
    if (role.actuator === 'toggle') return { left: true, right: false, toggle: true };
    if (role.actuator === 'manual' || role.actuator === 'sensor')
      return { left: true, right: false };
  }
  const t = VALVE_TARGETS.get(type);
  return t && (t.left || t.right) ? t : undefined;
}

/**
 * Which operator a click actuates: the side of the box sitting on the ports
 * the pointer is on, when both sides are clickable.
 */
export function clickSide(
  instance: Pick<ComponentInstance, 'x' | 'y' | 'rot' | 'mirror'>,
  target: ClickTarget,
  world: Point,
): 'left' | 'right' {
  if (!target.right) return 'left';
  if (!target.left) return 'right';
  const [lx] = inverseTransformLocal(
    [world[0] - instance.x, world[1] - instance.y],
    instance.rot,
    instance.mirror,
  );
  return lx < BOX / 2 ? 'left' : 'right';
}

export interface SpacePhaseRow {
  componentId: string;
  label: string;
  /** Position (0 or 1) at each step boundary: values[0] is the start. */
  values: number[];
}

export interface SpacePhase {
  /** Event names, one per step (e.g. "1A+"). */
  steps: string[];
  rows: SpacePhaseRow[];
}

/**
 * Displacement–step diagram built from end-of-stroke events: each event ends
 * a step; the cylinder of that event changes to 1 (+) or 0 (−), the others
 * keep their value.
 */
export function spacePhase(
  events: SimEvent[],
  cylinders: { id: string; label: string; start: number }[],
  maxSteps = 16,
): SpacePhase {
  const recent = events.slice(-maxSteps);
  const current = new Map(cylinders.map((c) => [c.id, c.start]));
  // When events were dropped, rebuild the starting values from the earlier ones.
  for (const e of events.slice(0, events.length - recent.length)) {
    current.set(e.componentId, e.name.endsWith('+') ? 1 : 0);
  }
  const rows = cylinders.map((c) => ({
    componentId: c.id,
    label: c.label,
    values: [current.get(c.id)!],
  }));
  for (const e of recent) {
    current.set(e.componentId, e.name.endsWith('+') ? 1 : 0);
    for (const r of rows) r.values.push(current.get(r.componentId)!);
  }
  return { steps: recent.map((e) => e.name), rows };
}
