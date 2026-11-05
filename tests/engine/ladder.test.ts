/** Ladder runtime (SPEC §6.5). */
import { parseOperand, readLadder, type LadderElement, type Rung } from '../../src/core/plc';
import { LadderRuntime } from '../../src/engine/plc/ladder/runtime';

let n = 0;
const id = () => `e${++n}`;
const no = (operand: string): LadderElement => ({ id: id(), kind: 'contact', type: 'no', operand });
const nc = (operand: string): LadderElement => ({ id: id(), kind: 'contact', type: 'nc', operand });
const edge = (type: 'p' | 'n', operand: string): LadderElement => ({
  id: id(),
  kind: 'contact',
  type,
  operand,
});
const coil = (operand: string, type: 'out' | 'set' | 'reset' = 'out'): LadderElement => ({
  id: id(),
  kind: 'coil',
  type,
  operand,
});
const par = (...branches: LadderElement[][]): LadderElement => ({
  id: id(),
  kind: 'parallel',
  branches,
});
const rung = (...elements: LadderElement[]): Rung => ({ id: id(), comment: '', elements });
const run = (rt: LadderRuntime, inputs: string[], scans = 1, dt = 10) => {
  for (let i = 0; i < scans; i++) rt.scan(new Set(inputs), dt);
};

describe('operands', () => {
  it('parses S7-style addresses and instance outputs', () => {
    expect(parseOperand('i0.3')).toEqual({ area: 'I', key: 'I0.3' });
    expect(parseOperand('M10.7')).toEqual({ area: 'M', key: 'M10.7' });
    expect(parseOperand('T1.Q')).toEqual({ area: 'T', name: 'T1', key: 'T1.Q' });
    expect(parseOperand('I0.8')).toBeNull();
    expect(parseOperand('X')).toBeNull();
  });

  it('reads ladder JSON and rejects malformed elements', () => {
    expect(readLadder([rung(no('I0.0'), coil('Q0.0'))])).not.toBeNull();
    expect(
      readLadder([{ id: 'r', elements: [{ id: 'x', kind: 'contact', type: 'zz' }] }]),
    ).toBeNull();
  });
});

describe('contacts and coils', () => {
  it('series is AND, parallel is OR, NC is NOT', () => {
    const rt = new LadderRuntime([
      rung(no('I0.0'), no('I0.1'), coil('Q0.0')),
      rung(par([no('I0.0')], [no('I0.1')]), coil('Q0.1')),
      rung(nc('I0.0'), coil('Q0.2')),
    ]);
    run(rt, ['I0.0']);
    expect([...rt.outputs()].sort()).toEqual(['Q0.1']);
    run(rt, ['I0.0', 'I0.1']);
    expect([...rt.outputs()].sort()).toEqual(['Q0.0', 'Q0.1']);
    run(rt, []);
    expect([...rt.outputs()]).toEqual(['Q0.2']);
  });

  it('self-holding with a marker; stop wired NC reads 1 at rest', () => {
    // I0.0 = stop (NC button wired: 1 when not pressed), I0.1 = start.
    const rt = new LadderRuntime([
      rung(par([no('I0.1')], [no('M0.0')]), no('I0.0'), coil('M0.0')),
      rung(no('M0.0'), coil('Q0.0')),
    ]);
    run(rt, ['I0.0', 'I0.1']);
    run(rt, ['I0.0']);
    expect(rt.outputs().has('Q0.0')).toBe(true);
    run(rt, []); // stop pressed
    run(rt, ['I0.0']);
    expect(rt.outputs().has('Q0.0')).toBe(false);
  });

  it('set and reset keep their state; rung order matters (last write wins)', () => {
    const rt = new LadderRuntime([
      rung(no('I0.0'), coil('Q0.0', 'set')),
      rung(no('I0.1'), coil('Q0.0', 'reset')),
    ]);
    run(rt, ['I0.0']);
    run(rt, []);
    expect(rt.read('Q0.0')).toBe(true);
    run(rt, ['I0.0', 'I0.1']);
    expect(rt.read('Q0.0')).toBe(false);
  });

  it('edge contacts give a one-scan pulse', () => {
    const rt = new LadderRuntime([
      rung(edge('p', 'I0.0'), coil('Q0.0')),
      rung(edge('n', 'I0.0'), coil('Q0.1')),
    ]);
    run(rt, []);
    run(rt, ['I0.0']);
    expect(rt.read('Q0.0')).toBe(true);
    run(rt, ['I0.0']);
    expect(rt.read('Q0.0')).toBe(false);
    run(rt, []);
    expect(rt.read('Q0.1')).toBe(true);
    run(rt, []);
    expect(rt.read('Q0.1')).toBe(false);
  });

  it('records the power after each element', () => {
    const a = no('I0.0');
    const b = no('I0.1');
    const rt = new LadderRuntime([rung(a, b, coil('Q0.0'))]);
    run(rt, ['I0.0']);
    expect(rt.power.get(a.id)).toBe(true);
    expect(rt.power.get(b.id)).toBe(false);
  });
});

describe('IEC timers', () => {
  const timer = (type: 'TON' | 'TOF' | 'TP', ptMs: number): LadderElement => ({
    id: id(),
    kind: 'timer',
    type,
    name: 'T1',
    ptMs,
  });

  it('TON: Q after PT while IN stays on; ET resets when IN goes off', () => {
    const rt = new LadderRuntime([rung(no('I0.0'), timer('TON', 100), coil('Q0.0'))]);
    run(rt, ['I0.0'], 10);
    expect(rt.read('Q0.0')).toBe(false);
    expect(rt.timers.get('T1')!.et).toBe(90);
    run(rt, ['I0.0'], 1);
    expect(rt.read('Q0.0')).toBe(true);
    run(rt, []);
    expect(rt.read('Q0.0')).toBe(false);
    expect(rt.timers.get('T1')!.et).toBe(0);
  });

  it('TOF: Q stays on for PT after IN goes off', () => {
    const rt = new LadderRuntime([rung(no('I0.0'), timer('TOF', 50), coil('Q0.0'))]);
    run(rt, ['I0.0']);
    expect(rt.read('Q0.0')).toBe(true);
    run(rt, [], 5);
    expect(rt.read('Q0.0')).toBe(true);
    run(rt, [], 1);
    expect(rt.read('Q0.0')).toBe(false);
  });

  it('TP: fixed pulse on the rising edge, independent of IN length', () => {
    const rt = new LadderRuntime([rung(no('I0.0'), timer('TP', 50), coil('Q0.0'))]);
    run(rt, ['I0.0']);
    expect(rt.read('Q0.0')).toBe(true);
    run(rt, [], 4);
    expect(rt.read('Q0.0')).toBe(true);
    run(rt, [], 1);
    expect(rt.read('Q0.0')).toBe(false);
  });

  it('a timer output can be used as a contact (T1.Q)', () => {
    const rt = new LadderRuntime([
      rung(no('I0.0'), timer('TON', 20)),
      rung(no('T1.Q'), coil('Q0.1')),
    ]);
    run(rt, ['I0.0'], 3);
    expect(rt.read('Q0.1')).toBe(true);
  });
});

describe('IEC counters', () => {
  it('CTU counts rising edges and resets; CTD counts down from PV', () => {
    const rt = new LadderRuntime([
      rung(
        no('I0.0'),
        { id: id(), kind: 'counter', type: 'CTU', name: 'C1', pv: 3, resetOperand: 'I0.1' },
        coil('Q0.0'),
      ),
      rung(
        no('I0.2'),
        { id: id(), kind: 'counter', type: 'CTD', name: 'C2', pv: 2, resetOperand: 'I0.3' },
        coil('Q0.1'),
      ),
    ]);
    for (let i = 0; i < 3; i++) {
      run(rt, ['I0.0', 'I0.2']);
      run(rt, []);
    }
    expect(rt.counters.get('C1')!.cv).toBe(3);
    expect(rt.read('C1.Q')).toBe(true);
    expect(rt.counters.get('C2')!.cv).toBe(-1);
    expect(rt.read('C2.Q')).toBe(true);
    run(rt, ['I0.1', 'I0.3']);
    expect(rt.counters.get('C1')!.cv).toBe(0);
    expect(rt.counters.get('C2')!.cv).toBe(2);
  });
});
