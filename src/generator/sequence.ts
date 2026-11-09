/**
 * Sequence notation and its theoretical analysis (SPEC §8.8): parser,
 * space-phase diagram, signal overlaps and cascade groups. Pure functions.
 *
 * Group rules: Creus, Neumática e Hidráulica, 7.2.6.2 (no letter repeated in a
 * group, as few groups as possible, one memory fewer than groups).
 */

export const LETTERS = 'ABCDEF';
export const MAX_STEPS = 24;

export type Sign = '+' | '-';

export interface Move {
  letter: string;
  sign: Sign;
}

export type SequenceError =
  | { code: 'empty' }
  | { code: 'unsupported'; token: string }
  | { code: 'badToken'; token: string; step: number }
  | { code: 'tooLong'; max: number }
  | { code: 'startsRetracting'; step: number; move: string }
  | { code: 'repeated'; step: number; move: string; opposite: string }
  | { code: 'notReturned'; letter: string; opposite: string };

export type ParseResult = { ok: true; moves: Move[] } | { ok: false; error: SequenceError };

export const moveName = (m: Move) => `${m.letter}${m.sign}`;
/** Text for the UI, with a true minus sign. */
export const moveText = (m: Move) => `${m.letter}${m.sign === '-' ? '−' : '+'}`;
export const sequenceText = (moves: Move[]) => moves.map(moveText).join(' ');

/** Cylinder number: A = 1, B = 2… */
export const cylinderNumber = (letter: string) => LETTERS.indexOf(letter) + 1;
export const cylinderLabel = (letter: string) => `${cylinderNumber(letter)}A`;
/** Event the simulation emits when the move ends. */
export const eventName = (m: Move) => `${cylinderLabel(m.letter)}${m.sign}`;
/** Limit valve at the end of a move: a1 for A+, a0 for A-. */
export const limitName = (m: Move) => `${m.letter.toLowerCase()}${m.sign === '+' ? 1 : 0}`;

export const lettersOf = (moves: Move[]) => [...new Set(moves.map((m) => m.letter))].sort();

const opposite = (m: Move): Move => ({ letter: m.letter, sign: m.sign === '+' ? '-' : '+' });

export function parseSequence(text: string): ParseResult {
  const clean = text.replace(/[−–—]/g, '-').toUpperCase().trim();
  if (clean === '') return { ok: false, error: { code: 'empty' } };
  const words = clean.split(/[\s,;]+/).filter(Boolean);
  const moves: Move[] = [];
  for (const word of words) {
    // P2 notation (SPEC §8.8): simultaneous moves and timers.
    if (/[()]/.test(word) || /^T\d/.test(word)) {
      return { ok: false, error: { code: 'unsupported', token: word } };
    }
    const parts = word.match(/[A-Z][+-]/g) ?? [];
    if (parts.join('') !== word) {
      return { ok: false, error: { code: 'badToken', token: word, step: moves.length + 1 } };
    }
    for (const part of parts) {
      const letter = part[0]!;
      if (!LETTERS.includes(letter)) {
        return { ok: false, error: { code: 'badToken', token: part, step: moves.length + 1 } };
      }
      moves.push({ letter, sign: part[1] as Sign });
    }
  }
  if (moves.length > MAX_STEPS) return { ok: false, error: { code: 'tooLong', max: MAX_STEPS } };

  const last = new Map<string, Sign>();
  for (const [i, m] of moves.entries()) {
    const before = last.get(m.letter);
    if (before === undefined && m.sign === '-') {
      return { ok: false, error: { code: 'startsRetracting', step: i + 1, move: moveText(m) } };
    }
    if (before === m.sign) {
      return {
        ok: false,
        error: {
          code: 'repeated',
          step: i + 1,
          move: moveText(m),
          opposite: moveText(opposite(m)),
        },
      };
    }
    last.set(m.letter, m.sign);
  }
  for (const [letter, sign] of last) {
    if (sign === '+') {
      return { ok: false, error: { code: 'notReturned', letter, opposite: `${letter}−` } };
    }
  }
  return { ok: true, moves };
}

export interface PhaseLine {
  letter: string;
  /** Position at each of the n + 1 phase lines: 0 retracted, 1 extended. */
  levels: number[];
}

/** Theoretical space-phase diagram: one line per cylinder. */
export function spacePhase(moves: Move[]): PhaseLine[] {
  return lettersOf(moves).map((letter) => {
    let level = 0;
    const levels = [0];
    for (const m of moves) {
      if (m.letter === letter) level = m.sign === '+' ? 1 : 0;
      levels.push(level);
    }
    return { letter, levels };
  });
}

export interface Overlap {
  /** Index of the step that cannot start. */
  step: number;
  move: Move;
  /** The opposite move whose signal is still present. */
  blockedBy: Move;
  /** Limit valve that keeps that signal present. */
  limit: string;
}

/**
 * Overlaps of the direct circuit, where each move is commanded by the limit
 * valve at the end of the previous one: a step is blocked when the signal that
 * commands the opposite move of the same valve is still active at that moment.
 */
export function findOverlaps(moves: Move[]): Overlap[] {
  const n = moves.length;
  const out: Overlap[] = [];
  const position = new Map<string, Sign>(lettersOf(moves).map((l) => [l, '-' as Sign]));
  for (const [j, move] of moves.entries()) {
    const seen = new Set<string>();
    for (const [k, other] of moves.entries()) {
      if (other.letter !== move.letter || other.sign === move.sign) continue;
      const trigger = moves[(k - 1 + n) % n]!;
      const key = limitName(trigger);
      if (position.get(trigger.letter) === trigger.sign && !seen.has(key)) {
        seen.add(key);
        out.push({ step: j, move, blockedBy: other, limit: key });
      }
    }
    position.set(move.letter, move.sign);
  }
  return out;
}

export interface CascadeGroups {
  /** Step indices of each group, in cycle order. The last group is active at rest. */
  groups: number[][];
  /** Memory valves: groups − 1. */
  memories: number;
  /** True when the first and last moves of the cycle share a group. */
  wraps: boolean;
}

function cutFrom(moves: Move[], offset: number): number[][] {
  const groups: number[][] = [];
  let current: number[] = [];
  let used = new Set<string>();
  for (let i = 0; i < moves.length; i++) {
    const step = (offset + i) % moves.length;
    const { letter } = moves[step]!;
    if (used.has(letter)) {
      groups.push(current);
      current = [];
      used = new Set();
    }
    current.push(step);
    used.add(letter);
  }
  groups.push(current);
  return groups;
}

/**
 * Fewest groups over every starting point of the cycle (a tie keeps the groups
 * that begin at the first move). A group may wrap over the end of the cycle.
 */
export function cascadeGroups(moves: Move[]): CascadeGroups {
  let best = cutFrom(moves, 0);
  for (let offset = 1; offset < moves.length; offset++) {
    const candidate = cutFrom(moves, offset);
    if (candidate.length < best.length) best = candidate;
  }
  const last = moves.length - 1;
  const restIndex = best.findIndex((g) => g.includes(last));
  const groups = [...best.slice(restIndex + 1), ...best.slice(0, restIndex + 1)];
  return {
    groups,
    memories: groups.length - 1,
    wraps: groups[groups.length - 1]!.includes(0),
  };
}

export const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
export const groupName = (index: number) => ROMAN[index] ?? String(index + 1);
