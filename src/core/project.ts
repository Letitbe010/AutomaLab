import { CURRENT_SCHEMA_VERSION, type Project } from './types';

/**
 * Default simulation settings. dtMs = 1 comes from SPEC §6.1.
 * supplyPressureBar = 6 is the value used in the SPEC §4 example.
 */
// TODO(galdetu): confirm the default supply pressure used in class (SPEC §14 "Balio tipikoak").
export function createEmptyProject(name: string): Project {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    name,
    simulation: { level: 'logic', dtMs: 1, supplyPressureBar: 6 },
    components: [],
    connections: [],
    tags: {},
    plc: { io: [], ladder: [], grafcet: null },
  };
}
