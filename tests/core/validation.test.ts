import { parseProject } from '../../src/core/serialization';
import type { Project } from '../../src/core/types';
import { validateProject, type Issue } from '../../src/core/validation';
import { getComponentDef } from '../../src/components/registry';
import { readFixture } from './fixtures';

function loadFixture(): Project {
  const r = parseProject(readFixture('simple-circuit.automalab.json'));
  if (!r.ok) throw new Error(JSON.stringify(r.error));
  return r.project;
}

const codes = (issues: Issue[]) => issues.map((i) => `${i.severity}:${i.code}`).sort();

describe('validateProject', () => {
  it('accepts the fixture: the free exhaust port 3 vents and is not a warning', () => {
    expect(validateProject(loadFixture(), getComponentDef)).toEqual([]);
  });

  it('reports free working ports', () => {
    const p = loadFixture();
    p.connections = p.connections.filter((w) => w.id !== 'w2');
    const issues = validateProject(p, getComponentDef);
    expect(codes(issues)).toEqual(['warning:freePort', 'warning:freePort']);
    expect(issues.map((i) => i.vars)).toEqual([
      { component: '1V1', port: '2' },
      { component: '1A', port: 'A' },
    ]);
  });

  it('flags unknown component types as errors', () => {
    const p = loadFixture();
    p.components.push({ id: 'x', type: 'pn.nope', x: 0, y: 0, rot: 0, mirror: false, params: {} });
    expect(codes(validateProject(p, getComponentDef))).toContain('error:unknownType');
  });

  it('flags connections to missing components and ports', () => {
    const p = loadFixture();
    p.connections.push({
      id: 'w3',
      kind: 'fluid',
      from: ['v1', '3'],
      to: ['ghost', '1'],
      points: [],
    });
    p.connections.push({ id: 'w4', kind: 'fluid', from: ['v1', '9'], to: ['c1', 'A'], points: [] });
    const c = codes(validateProject(p, getComponentDef));
    expect(c).toContain('error:missingComponent');
    expect(c).toContain('error:missingPort');
  });

  it('flags a fluid port wired with an electric connection (mixed domains)', () => {
    const p = loadFixture();
    p.connections[0]!.kind = 'electric';
    expect(codes(validateProject(p, getComponentDef))).toContain('error:kindMismatch');
  });

  it('flags duplicate connections in either direction', () => {
    const p = loadFixture();
    p.connections.push({ id: 'w9', kind: 'fluid', from: ['c1', 'A'], to: ['v1', '2'], points: [] });
    const issues = validateProject(p, getComponentDef);
    const dup = issues.find((i) => i.code === 'duplicateConnection');
    expect(dup?.severity).toBe('warning');
    expect(dup?.connectionIds).toEqual(['w2', 'w9']);
  });

  it('flags self connections', () => {
    const p = loadFixture();
    p.connections.push({ id: 'w5', kind: 'fluid', from: ['v1', '3'], to: ['v1', '3'], points: [] });
    expect(codes(validateProject(p, getComponentDef))).toContain('error:selfConnection');
  });

  it('flags repeated labels and duplicate ids', () => {
    const p = loadFixture();
    p.components[2]!.params.label = '1V1';
    p.components.push({ ...p.components[0]! });
    const c = codes(validateProject(p, getComponentDef));
    expect(c).toContain('warning:duplicateLabel');
    expect(c).toContain('error:duplicateId');
  });
});
