/**
 * Label suggestion following the usual fluid-power numbering:
 * - actuators "nA": 1A, 2A, 3A... (the number is the group)
 * - other elements "<prefix><n>": 1V1, 1V2, 0Z1, 1S1...
 */
// TODO(galdetu): confirm this is the labelling convention used in class.
export function suggestLabel(prefix: string, existing: Iterable<string>): string {
  if (prefix === '') return '';
  const used = new Set(existing);
  const actuator = /^\d+A$/.exec(prefix);
  if (actuator) {
    for (let n = 1; ; n++) if (!used.has(`${n}A`)) return `${n}A`;
  }
  for (let n = 1; ; n++) if (!used.has(`${prefix}${n}`)) return `${prefix}${n}`;
}
