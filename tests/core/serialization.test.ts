import { createEmptyProject } from '../../src/core/project';
import { parseProject, serializeProject } from '../../src/core/serialization';
import { readFixture } from './fixtures';

const fixture = readFixture('simple-circuit.automalab.json');

describe('serialization', () => {
  it('round-trips an empty project unchanged', () => {
    const p = createEmptyProject('Proba');
    const r = parseProject(serializeProject(p));
    expect(r).toEqual({ ok: true, project: p });
  });

  it('loads the fixture and round-trips it (save -> load -> equal)', () => {
    const first = parseProject(fixture);
    if (!first.ok) throw new Error(JSON.stringify(first.error));
    expect(first.project.components).toHaveLength(3);
    const second = parseProject(serializeProject(first.project));
    expect(second).toEqual(first);
  });

  it('fills optional fields with defaults', () => {
    const raw = JSON.parse(fixture);
    delete raw.components[0].rot;
    delete raw.components[0].mirror;
    delete raw.tags;
    delete raw.plc;
    const r = parseProject(JSON.stringify(raw));
    if (!r.ok) throw new Error(JSON.stringify(r.error));
    expect(r.project.components[0]).toMatchObject({ rot: 0, mirror: false });
    expect(r.project.tags).toEqual({});
    expect(r.project.plc).toEqual({ io: [], ladder: [], grafcet: null });
  });

  it('rejects invalid JSON', () => {
    expect(parseProject('{nope')).toEqual({ ok: false, error: { code: 'invalidJson' } });
  });

  it('rejects objects without schemaVersion', () => {
    expect(parseProject('{"name":"x"}')).toEqual({ ok: false, error: { code: 'notAProject' } });
  });

  it('rejects files from a newer schema version', () => {
    const raw = { ...JSON.parse(fixture), schemaVersion: 99 };
    expect(parseProject(JSON.stringify(raw))).toEqual({
      ok: false,
      error: { code: 'newerVersion', version: 99 },
    });
  });

  it('reports the path of an invalid field', () => {
    const raw = JSON.parse(fixture);
    raw.components[1].rot = 45;
    expect(parseProject(JSON.stringify(raw))).toEqual({
      ok: false,
      error: { code: 'invalidField', path: 'components[1].rot' },
    });
  });
});
