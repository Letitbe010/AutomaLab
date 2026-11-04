/** Calculator catalogue (SPEC §8.3.3). Interactive calculators are P2; ids are referenced by theory sheets. */
export const CALCULATORS = [
  { id: 'calc-cyl-force', nameKey: 'theory.calc.cylForce' },
  { id: 'calc-air-consumption', nameKey: 'theory.calc.airConsumption' },
] as const;

export const getCalculator = (id: string) => CALCULATORS.find((c) => c.id === id);
