/**
 * Mechanical coupling (SPEC §6.1 step 6): roller valves actuated by a
 * cylinder's position. Pure functions; the scheduler applies them.
 */
import { ELECTRIC_SENSOR_TYPES } from '../../components/electric/roles';
import { isMechanical, VALVE_SPECS } from '../../components/pneumatic/valveSpecs';
import type { ComponentInstance } from '../../core/types';

/** Tolerance (fraction of stroke) for "at the end position". */
export const END_EPS = 1e-6;

/** Idle-return rollers are tripped in the last part of the stroke while moving towards the end. */
// TODO(galdetu): length of the idle-roller zone (fraction of the stroke).
export const IDLE_ZONE = 0.05;

export interface LimitBinding {
  valveId: string;
  cylinderId: string;
  at: '+' | '-';
  /** Idle-return roller: one-way, only while the rod moves towards `at`. */
  idle: boolean;
}

/** Position-bound types: roller valves and electric sensors (limit switches, reed). */
const MECH = new Map<string, boolean>([
  ...VALVE_SPECS.filter((s) => isMechanical(s.left[0])).map(
    (s) => [s.type, s.left[0] === 'idleRoller'] as [string, boolean],
  ),
  ...[...ELECTRIC_SENSOR_TYPES].map((t) => [t, false] as [string, boolean]),
]);

const isCylinder = (c: ComponentInstance) => c.type.startsWith('pn.cyl.');

/** Finds roller valves bound to a cylinder by its label. Unbound or unknown ones are skipped. */
export function findLimitBindings(components: ComponentInstance[]): LimitBinding[] {
  const byLabel = new Map<string, string>();
  for (const c of components) {
    if (isCylinder(c) && typeof c.params.label === 'string' && c.params.label !== '') {
      byLabel.set(c.params.label, c.id);
    }
  }
  const out: LimitBinding[] = [];
  for (const c of components) {
    const idle = MECH.get(c.type);
    if (idle === undefined) continue;
    const cylinderId = byLabel.get(String(c.params.cylinder ?? ''));
    if (!cylinderId) continue;
    out.push({ valveId: c.id, cylinderId, at: c.params.at === '-' ? '-' : '+', idle });
  }
  return out;
}

/**
 * Whether the roller is actuated. `previous` is the rod position one step
 * earlier (to know the direction of motion for idle-return rollers).
 */
export function limitActuated(binding: LimitBinding, position: number, previous: number): boolean {
  const target = binding.at === '+' ? 1 : 0;
  if (!binding.idle) return Math.abs(position - target) <= END_EPS;
  const towards = binding.at === '+' ? position > previous : position < previous;
  const distance = Math.abs(position - target);
  return towards && distance <= IDLE_ZONE;
}
