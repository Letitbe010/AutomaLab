import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { produce } from 'immer';
import { createEmptyProject } from '../../src/core/project';
import { parseProject } from '../../src/core/serialization';
import type { Project } from '../../src/core/types';
import { getComponentDef } from '../../src/components/registry';
import { Simulation } from '../../src/engine/scheduler';
import { addComponent, connect } from '../../src/ui/editor/model/ops';

export function loadFixture(name: string): Project {
  const text = readFileSync(join(process.cwd(), 'tests', 'engine', 'fixtures', name), 'utf8');
  const r = parseProject(text);
  if (!r.ok) throw new Error(`${name}: ${JSON.stringify(r.error)}`);
  return r.project;
}

export const simulate = (project: Project) => new Simulation(project, { getDef: getComponentDef });

type Builder = {
  add(type: string, label?: string, params?: Record<string, number | string | boolean>): string;
  wire(a: [string, string], b: [string, string]): void;
};

/** Builds a project in code: positions do not matter to the engine. */
export function build(fn: (b: Builder) => void): Project {
  return produce(createEmptyProject('test'), (d) => {
    let x = 0;
    fn({
      add(type, label, params) {
        const id = addComponent(d, type, (x += 200), 0);
        const c = d.components.find((k) => k.id === id)!;
        if (label !== undefined) c.params.label = label;
        Object.assign(c.params, params ?? {});
        return id;
      },
      wire(a, b) {
        const r = connect(d, a, b);
        if (!r.ok) throw new Error(`connect ${a.join(':')} -> ${b.join(':')}: ${r.reason}`);
      },
    });
  });
}

/** Presses a manual operator for `ms`, then releases it. */
export function pulse(sim: Simulation, id: string, ms = 50, side: 'left' | 'right' = 'left') {
  sim.press(id, side);
  sim.run(ms);
  sim.release(id, side);
}

export const position = (sim: Simulation, id: string) =>
  sim.componentState<{ position: number }>(id).position;
