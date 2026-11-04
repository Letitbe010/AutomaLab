/**
 * Pneumatic calculations used by theory sheets, quizzes and (P2) calculators
 * (SPEC §8.3.3). Units: gauge pressure in bar, lengths in mm, force in N,
 * air volume in normal litres (Nl).
 *
 * Sources: A. Creus, Neumática e Hidráulica (2007), 2.3.2.1 force (pp. 28–29)
 * and 2.3.2.3 air consumption (pp. 36–37).
 */

/** Standard atmospheric pressure, bar (decided 2026-11-04; Creus writes 0.987). */
export const P_ATM_BAR = 1.013;

export function areaMm2(diameterMm: number): number {
  return (Math.PI * diameterMm * diameterMm) / 4;
}

/** Annular (rod-side) area. */
export function annulusMm2(boreMm: number, rodMm: number): number {
  return areaMm2(boreMm) - areaMm2(rodMm);
}

export interface ForceInput {
  pressureBar: number;
  boreMm: number;
  rodMm?: number;
  /** Efficiency (friction losses). Creus: friction is 3–10 % → η ≈ 0.90–0.97. */
  efficiency?: number;
  direction: 'extend' | 'retract';
  /** Spring force to subtract (single-acting cylinders), N. */
  springN?: number;
}

/** F = p · A · η − F_spring; with p in bar and A in mm², F (N) = p · A / 10. */
export function cylinderForceN(input: ForceInput): number {
  const area =
    input.direction === 'extend'
      ? areaMm2(input.boreMm)
      : annulusMm2(input.boreMm, input.rodMm ?? 0);
  return ((input.pressureBar * area) / 10) * (input.efficiency ?? 1) - (input.springN ?? 0);
}

/** Free air per volume of compressed air: (p + p_atm) / p_atm. */
export function compressionRatio(pressureBar: number, pAtmBar = P_ATM_BAR): number {
  return (pressureBar + pAtmBar) / pAtmBar;
}

export interface ConsumptionInput {
  pressureBar: number;
  boreMm: number;
  rodMm?: number;
  strokeMm: number;
  /** Double-acting: also fills the rod side on the return stroke. */
  doubleActing: boolean;
  pAtmBar?: number;
}

/** Normal litres of air per cycle (extend, plus retract for double-acting). */
export function airPerCycleNl(input: ConsumptionInput): number {
  const ratio = compressionRatio(input.pressureBar, input.pAtmBar);
  const extendL = (areaMm2(input.boreMm) * input.strokeMm) / 1e6;
  const retractL = input.doubleActing
    ? (annulusMm2(input.boreMm, input.rodMm ?? 0) * input.strokeMm) / 1e6
    : 0;
  return (extendL + retractL) * ratio;
}

export function airConsumptionNlMin(input: ConsumptionInput & { cyclesPerMin: number }): number {
  return airPerCycleNl(input) * input.cyclesPerMin;
}
