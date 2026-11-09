/**
 * Automatic checker for design exercises (SPEC §8.1): the user's circuit is
 * simulated headless, the stimuli are applied and the events compared.
 * Any circuit that behaves as required passes; there is no single solution.
 */
import { getComponentDef } from '../../components/registry';
import { validateProject } from '../../core/validation';
import type { Project } from '../../core/types';
import { Simulation } from '../../engine/scheduler';
import type { SimEvent } from '../../engine/types';
import { DEFAULT_PULSE_MS, SETTLE_MS } from '../quiz/simulate';
import type { Stimulus } from '../quiz/types';
import type { Check, DesignExercise } from './types';

/** Why a check failed; the UI turns it into a Basque sentence (exercises.reason.*). */
export type Reason =
  | { code: 'invalid'; count: number }
  | { code: 'missingLabel'; label: string }
  | { code: 'notAllowed'; types: string[] }
  | { code: 'events'; expected: string[]; got: string[] }
  | { code: 'forbidden'; event: string; atMs: number }
  | { code: 'missingEvent'; event: string }
  | { code: 'tooFast'; ms: number; minMs: number }
  | { code: 'tooSlow'; ms: number; maxMs: number }
  | { code: 'missingType'; types: string[] }
  | { code: 'unstable' }
  | { code: 'wrongLanguage'; language: 'ladder' | 'grafcet' };

export interface CheckResult {
  title: string;
  ok: boolean;
  reason?: Reason;
}

export interface ExerciseReport {
  passed: boolean;
  results: CheckResult[];
}

const JUNCTION = /\.junction$/;

function labelsOf(project: Project): Set<string> {
  return new Set(
    project.components.map((c) => c.params.label).filter((l): l is string => typeof l === 'string'),
  );
}

/** Labels a check needs: stimulus targets and the cylinders named in events. */
function neededLabels(check: Check): string[] {
  if (check.type === 'uses' || check.type === 'plcLanguage') return [];
  const out = check.stimuli.filter((s) => s[0] !== 'wait').map((s) => s[1] as string);
  const events =
    check.type === 'sequence'
      ? check.expect
      : check.type === 'never'
        ? check.events
        : [check.from, check.to].filter((e) => e !== 'start' && e !== 'end');
  for (const e of events) out.push(e.replace(/[+-]$/, ''));
  return out;
}

function run(project: Project, stimuli: Stimulus[], withinMs = SETTLE_MS) {
  const sim = new Simulation(project, { getDef: getComponentDef });
  const idOf = (label: string) => project.components.find((c) => c.params.label === label)!.id;
  for (const s of stimuli) {
    if (s[0] === 'wait') sim.run(s[1]);
    else if (s[0] === 'press') sim.press(idOf(s[1]));
    else if (s[0] === 'release') sim.release(idOf(s[1]));
    else {
      const id = idOf(s[1]);
      sim.press(id);
      sim.run(s[2] ?? DEFAULT_PULSE_MS);
      sim.release(id);
    }
  }
  const endMs = sim.timeMs;
  sim.run(withinMs);
  return { events: sim.events as readonly SimEvent[], warnings: sim.warnings, endMs };
}

const timeOf = (events: readonly SimEvent[], name: string, endMs: number) =>
  name === 'start' ? 0 : name === 'end' ? endMs : events.find((e) => e.name === name)?.timeMs;

export function runCheck(project: Project, check: Check): CheckResult {
  const base = { title: check.title };
  if (check.type === 'uses') {
    const ok = project.components.some((c) => check.componentTypes.includes(c.type));
    return ok
      ? { ...base, ok }
      : { ...base, ok, reason: { code: 'missingType', types: check.componentTypes } };
  }
  if (check.type === 'plcLanguage') {
    const ok = (project.plc.language ?? 'ladder') === check.language;
    return ok
      ? { ...base, ok }
      : { ...base, ok, reason: { code: 'wrongLanguage', language: check.language } };
  }
  const labels = labelsOf(project);
  const missing = neededLabels(check).find((l) => !labels.has(l));
  if (missing) return { ...base, ok: false, reason: { code: 'missingLabel', label: missing } };

  const { events, warnings, endMs } = run(project, check.stimuli, check.withinMs);
  if (warnings.some((w) => w.code === 'oscillation')) {
    return { ...base, ok: false, reason: { code: 'unstable' } };
  }
  const names = events.map((e) => e.name);

  switch (check.type) {
    case 'sequence': {
      const got = check.match === 'prefix' ? names.slice(0, check.expect.length) : names;
      const ok = got.length === check.expect.length && got.every((n, i) => n === check.expect[i]);
      return ok
        ? { ...base, ok }
        : { ...base, ok, reason: { code: 'events', expected: check.expect, got: names } };
    }
    case 'never': {
      const bad = events.find((e) => check.events.includes(e.name));
      return bad
        ? { ...base, ok: false, reason: { code: 'forbidden', event: bad.name, atMs: bad.timeMs } }
        : { ...base, ok: true };
    }
    case 'duration': {
      const from = timeOf(events, check.from, endMs);
      if (from === undefined) {
        return { ...base, ok: false, reason: { code: 'missingEvent', event: check.from } };
      }
      const to = events.find((e) => e.name === check.to && e.timeMs >= from)?.timeMs;
      if (to === undefined) {
        return { ...base, ok: false, reason: { code: 'missingEvent', event: check.to } };
      }
      const ms = Math.round(to - from);
      if (check.minMs !== undefined && ms < check.minMs) {
        return { ...base, ok: false, reason: { code: 'tooFast', ms, minMs: check.minMs } };
      }
      if (check.maxMs !== undefined && ms > check.maxMs) {
        return { ...base, ok: false, reason: { code: 'tooSlow', ms, maxMs: check.maxMs } };
      }
      return { ...base, ok: true };
    }
  }
}

/**
 * Checks a circuit against an exercise. Schematic errors stop everything;
 * components outside the allowed list fail their own check.
 */
export function checkExercise(project: Project, exercise: DesignExercise): ExerciseReport {
  const results: CheckResult[] = [];
  const errors = validateProject(project, getComponentDef).filter((i) => i.severity === 'error');
  if (errors.length) {
    const reason: Reason = { code: 'invalid', count: errors.length };
    return {
      passed: false,
      results: exercise.checks.map((c) => ({ title: c.title, ok: false, reason })),
    };
  }
  if (exercise.allowedComponents.length) {
    const extra = [
      ...new Set(
        project.components
          .map((c) => c.type)
          .filter((t) => !JUNCTION.test(t) && !exercise.allowedComponents.includes(t)),
      ),
    ];
    results.push(
      extra.length
        ? { title: '', ok: false, reason: { code: 'notAllowed', types: extra } }
        : { title: '', ok: true },
    );
  }
  for (const check of exercise.checks) results.push(runCheck(project, check));
  return { passed: results.every((r) => r.ok), results };
}
