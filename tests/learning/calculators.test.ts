import {
  airConsumptionNlMin,
  airPerCycleNl,
  compressionRatio,
  cylinderForceN,
} from '../../src/learning/calculators/pneumatic';

describe('cylinder force (Creus 2.3.2.1)', () => {
  it('matches the SPEC example: 6 bar, D 32, η 0.9 → 434 N', () => {
    const f = cylinderForceN({ pressureBar: 6, boreMm: 32, efficiency: 0.9, direction: 'extend' });
    expect(f).toBeCloseTo(434.3, 1);
  });

  it('uses the annular area on the return stroke', () => {
    const f = cylinderForceN({
      pressureBar: 6,
      boreMm: 32,
      rodMm: 12,
      efficiency: 0.9,
      direction: 'retract',
    });
    expect(f).toBeCloseTo(373.2, 1);
  });

  it('subtracts the spring force on single-acting cylinders', () => {
    const f = cylinderForceN({ pressureBar: 6, boreMm: 32, direction: 'extend', springN: 30 });
    expect(f).toBeCloseTo(482.5 - 30, 1);
  });
});

describe('air consumption (Creus 2.3.2.3)', () => {
  it('compression ratio with p_atm = 1.013 bar', () => {
    expect(compressionRatio(6)).toBeCloseTo(6.923, 3);
  });

  it('reproduces the book example with its 0.987 constant (≈ 190.6 dm³/min)', () => {
    const q = airConsumptionNlMin({
      pressureBar: 7,
      boreMm: 50,
      strokeMm: 1200,
      doubleActing: false,
      cyclesPerMin: 10,
      pAtmBar: 0.987,
    });
    expect(q).toBeCloseTo(190.6, 0);
  });

  it('double-acting cycle of the theory sheet example ≈ 1.04 Nl', () => {
    expect(
      airPerCycleNl({ pressureBar: 6, boreMm: 32, rodMm: 12, strokeMm: 100, doubleActing: true }),
    ).toBeCloseTo(1.035, 3);
  });
});
