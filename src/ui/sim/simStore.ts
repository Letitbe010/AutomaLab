/** Simulation session for the editor (SPEC §6.1, §7.3): one Simulation per sim-mode run. */
import { create } from 'zustand';
import { getComponentDef } from '../../components/registry';
import type { Project } from '../../core/types';
import { Simulation } from '../../engine/scheduler';

export const SPEEDS = [0.1, 0.25, 0.5, 1, 2, 5, 10] as const;

/** "⏭" advances one PLC-scan-sized slice (SPEC §6.1 mentions 10 ms scans). */
export const STEP_MS = 10;

/** Longest simulated slice per animation frame, so a slow frame cannot freeze the page. */
const MAX_FRAME_SIM_MS = 250;

interface SimStore {
  sim: Simulation | null;
  project: Project | null;
  running: boolean;
  speed: number;
  /** Bumped after every change so React re-renders the snapshot. */
  version: number;
  start(project: Project): void;
  stop(): void;
  play(): void;
  pause(): void;
  stepOnce(): void;
  reset(): void;
  setSpeed(speed: number): void;
  advance(realMs: number): void;
  setInput(id: string, input: { left?: boolean; right?: boolean }): void;
}

const make = (project: Project) => new Simulation(project, { getDef: getComponentDef });

export const useSim = create<SimStore>()((set, get) => ({
  sim: null,
  project: null,
  running: false,
  speed: 1,
  version: 0,

  start(project) {
    set({ sim: make(project), project, running: true, version: get().version + 1 });
  },
  stop() {
    set({ sim: null, project: null, running: false });
  },
  play() {
    set({ running: true });
  },
  pause() {
    set({ running: false });
  },
  stepOnce() {
    const { sim, version } = get();
    if (!sim) return;
    sim.run(STEP_MS);
    set({ running: false, version: version + 1 });
  },
  reset() {
    const { project, version } = get();
    if (project) set({ sim: make(project), version: version + 1 });
  },
  setSpeed(speed) {
    set({ speed });
  },
  advance(realMs) {
    const { sim, running, speed, version } = get();
    if (!sim || !running) return;
    sim.run(Math.min(MAX_FRAME_SIM_MS, realMs * speed));
    set({ version: version + 1 });
  },
  setInput(id, input) {
    const { sim, version } = get();
    if (!sim) return;
    sim.setInput(id, input);
    set({ version: version + 1 });
  },
}));
