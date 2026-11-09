/** R12 (SPEC §11): generated circuits and GRAFCETs run the requested sequence. */
import { getComponentDef } from '../../src/components/registry';
import { validateProject } from '../../src/core/validation';
import { grafcetToLadder } from '../../src/engine/plc/grafcet/toLadder';
import { Simulation } from '../../src/engine/scheduler';
import { generateCascade } from '../../src/generator/cascade';
import { compareWithSequence, startCandidates } from '../../src/generator/compare';
import { generatePlcProject } from '../../src/generator/grafcet';
import { eventName, parseSequence, type Move } from '../../src/generator/sequence';
import { loadFixture } from '../engine/helpers';

const SEQUENCES = [
  'A+ A-',
  'A+ B+ B- A-',
  'A+ B+ A- B-',
  'A+ A- B+ B-',
  'B+ A+ A- B-',
  'A+ B+ C+ C- B- A-',
  'A+ B+ C+ A- B- C-',
  'A+ B+ B- C+ C- A-',
  'A+ C+ B+ B- C- A-',
  'A+ B+ B- A- C+ C-',
  'A+ B+ C+ D+ D- C- B- A-',
  'A+ B+ C+ C- D+ D- B- A-',
  'A+ B+ B- B+ B- A-',
  'A+ A- B+ B- A+ A-',
];

function moves(text: string): Move[] {
  const r = parseSequence(text);
  if (!r.ok) throw new Error(JSON.stringify(r.error));
  return r.moves;
}

const cycleMs = (m: Move[]) => m.length * 1200 + 1500;

function runOnce(sim: Simulation, startId: string, ms: number) {
  sim.press(startId);
  sim.run(200);
  sim.release(startId);
  sim.run(ms);
}

describe.each(SEQUENCES)('R12 %s', (text) => {
  const m = moves(text);
  const expected = m.map(eventName);

  it('cascade circuit: valid, stays at rest, runs the sequence twice without blocking', () => {
    const project = generateCascade(m);
    expect(validateProject(project, getComponentDef)).toEqual([]);
    const sim = new Simulation(project, { getDef: getComponentDef });
    sim.run(2000);
    expect(sim.events).toEqual([]);
    runOnce(sim, 'st', cycleMs(m));
    expect(sim.eventNames()).toEqual(expected);
    runOnce(sim, 'st', cycleMs(m));
    expect(sim.eventNames()).toEqual([...expected, ...expected]);
    expect(sim.warnings).toEqual([]);
  });

  it('GRAFCET with PLC: valid, runs the sequence twice', () => {
    const project = generatePlcProject(m);
    expect(validateProject(project, getComponentDef)).toEqual([]);
    const sim = new Simulation(project, { getDef: getComponentDef });
    sim.run(500);
    expect(sim.events).toEqual([]);
    runOnce(sim, 's1', cycleMs(m));
    expect(sim.eventNames()).toEqual(expected);
    runOnce(sim, 's1', cycleMs(m));
    expect(sim.eventNames()).toEqual([...expected, ...expected]);
  });

  it('the GRAFCET converted to Ladder runs the same sequence', () => {
    const project = generatePlcProject(m);
    const converted = grafcetToLadder(project.plc.grafcet!, project.plc.io);
    if (!converted.ok) throw new Error(JSON.stringify(converted.problems));
    project.plc = { ...project.plc, ...converted, language: 'ladder' };
    const sim = new Simulation(project, { getDef: getComponentDef });
    sim.run(100);
    runOnce(sim, 's1', cycleMs(m));
    expect(sim.eventNames()).toEqual(expected);
  });
});

describe('compare mode', () => {
  const abba = moves('A+ B+ B- A-');

  it('accepts the generated circuit', () => {
    const project = generateCascade(abba);
    expect(startCandidates(project)[0]).toEqual({ id: 'st', label: '0S1' });
    expect(compareWithSequence(project, abba, 'st').status).toBe('same');
  });

  it('accepts a circuit drawn by hand (R5)', () => {
    const r5 = loadFixture('r5-cascade-abba.automalab.json');
    expect(compareWithSequence(r5, abba, 'st').status).toBe('same');
  });

  it('says where a different sequence diverges', () => {
    const r5 = loadFixture('r5-cascade-abba.automalab.json');
    expect(compareWithSequence(r5, moves('A+ B+ A- B-'), 'st')).toMatchObject({
      status: 'different',
      step: 3,
      expected: '1A-',
      got: '2A-',
    });
  });

  it('reports a missing cylinder and a missing start', () => {
    const r5 = loadFixture('r5-cascade-abba.automalab.json');
    expect(compareWithSequence(r5, moves('C+ C-'), 'st').status).toBe('missingCylinder');
    expect(compareWithSequence(r5, abba, null).status).toBe('noStart');
  });

  it('reports where a circuit stops', () => {
    const project = generateCascade(abba);
    project.connections = project.connections.filter(
      (c) => !(c.to[0] === 'vA' && c.to[1] === '12'),
    );
    expect(compareWithSequence(project, abba, 'st')).toMatchObject({
      status: 'stopped',
      step: 4,
      expected: 'A−',
    });
  });
});
