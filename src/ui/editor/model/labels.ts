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

/**
 * Limit-valve label from the cylinder it detects and the end position
 * (Creus, 2.3 and 7.2): 1A at − → a0, 1A at + → a1, 2A → b0/b1; a plain "B" → b0/b1.
 */
export function limitLabel(cylinderLabel: string, at: string): string | null {
  const n = /^(\d+)A$/.exec(cylinderLabel);
  const letter = n
    ? String.fromCharCode(96 + Number(n[1]))
    : /^[A-Z]$/.test(cylinderLabel)
      ? cylinderLabel.toLowerCase()
      : null;
  if (!letter || letter < 'a' || letter > 'z') return null;
  return `${letter}${at === '-' ? 0 : 1}`;
}

/** Labels the editor may overwrite: empty, suggested ones (1S1) or previous a0-style ones. */
export function isAutoLimitLabel(label: string): boolean {
  return label === '' || /^\d+S\d+$/.test(label) || /^[a-z][01]$/.test(label);
}
