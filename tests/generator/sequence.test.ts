/** Sequence parser and theoretical analysis (SPEC §8.8). */
import {
  cascadeGroups,
  findOverlaps,
  moveName,
  parseSequence,
  spacePhase,
  type Move,
} from '../../src/generator/sequence';

function moves(text: string): Move[] {
  const r = parseSequence(text);
  if (!r.ok) throw new Error(JSON.stringify(r.error));
  return r.moves;
}

describe('parseSequence', () => {
  it('reads spaces, commas, lower case, true minus signs and no spaces', () => {
    const want = ['A+', 'B+', 'B-', 'A-'];
    for (const text of ['A+ B+ B- A-', 'a+,b+,b-,a-', 'A+ B+ B− A−', 'A+B+B-A-']) {
      expect(moves(text).map(moveName)).toEqual(want);
    }
  });

  it.each([
    ['', 'empty'],
    ['   ', 'empty'],
    ['A+ (B+ C+) A-', 'unsupported'],
    ['A+ T2s A-', 'unsupported'],
    ['A* A-', 'badToken'],
    ['G+ G-', 'badToken'],
    ['A- A+', 'startsRetracting'],
    ['A+ B+ B+ A-', 'repeated'],
    ['A+ A+', 'repeated'],
    ['A+ B+ B-', 'notReturned'],
  ])('rejects %j with %s', (text, code) => {
    const r = parseSequence(text);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe(code);
  });

  it('says which step is wrong', () => {
    const r = parseSequence('A+ B+ B+ A-');
    expect(r).toEqual({
      ok: false,
      error: { code: 'repeated', step: 3, move: 'B+', opposite: 'B−' },
    });
  });

  it('limits the length', () => {
    const r = parseSequence('A+ A- '.repeat(13));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe('tooLong');
  });
});

describe('spacePhase', () => {
  it('has one line per cylinder with n + 1 levels', () => {
    expect(spacePhase(moves('A+ B+ B- A-'))).toEqual([
      { letter: 'A', levels: [0, 1, 1, 1, 0] },
      { letter: 'B', levels: [0, 0, 1, 0, 0] },
    ]);
  });
});

describe('findOverlaps', () => {
  const summary = (text: string) =>
    findOverlaps(moves(text)).map((o) => `${o.step}:${moveName(o.move)}/${o.limit}`);

  it('finds the two classic overlaps of A+ B+ B- A-', () => {
    expect(summary('A+ B+ B- A-')).toEqual(['0:A+/b0', '2:B-/a1']);
  });

  it('finds none in A+ B+ A- B- (the square sequence)', () => {
    expect(summary('A+ B+ A- B-')).toEqual([]);
  });

  it('finds none in a single reciprocating cylinder', () => {
    expect(summary('A+ A-')).toEqual([]);
  });
});

describe('cascadeGroups', () => {
  const summary = (text: string) => {
    const m = moves(text);
    return cascadeGroups(m).groups.map((g) => g.map((s) => moveName(m[s]!)).join(' '));
  };

  it('cuts where a letter would repeat', () => {
    expect(summary('A+ B+ B- A-')).toEqual(['A+ B+', 'B- A-']);
    expect(summary('A+ B+ C+ C- B- A-')).toEqual(['A+ B+ C+', 'C- B- A-']);
  });

  it('keeps the groups that begin at the first move on a tie', () => {
    expect(summary('A+ B+ A- B-')).toEqual(['A+ B+', 'A- B-']);
  });

  it('joins the last and first groups when that saves a memory', () => {
    const m = moves('A+ A- B+ B-');
    expect(summary('A+ A- B+ B-')).toEqual(['A- B+', 'B- A+']);
    expect(cascadeGroups(m).memories).toBe(1);
    expect(cascadeGroups(m).wraps).toBe(true);
  });

  it('has one memory fewer than groups, and the last group holds the last step', () => {
    for (const text of ['A+ B+ B- A- C+ C-', 'A+ B+ C+ A- B- C-', 'A+ A- A+ A-']) {
      const m = moves(text);
      const g = cascadeGroups(m);
      expect(g.memories).toBe(g.groups.length - 1);
      expect(g.groups.at(-1)).toContain(m.length - 1);
      expect(g.groups.flat().sort((a, b) => a - b)).toEqual(m.map((_, i) => i));
      for (const group of g.groups) {
        const letters = group.map((s) => m[s]!.letter);
        expect(new Set(letters).size).toBe(letters.length);
      }
    }
  });
});
