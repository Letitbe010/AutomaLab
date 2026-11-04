/**
 * Exercise format (SPEC §8.1, extended). One folder per exercise:
 * exercise.json + statement.md (+ solution.automalab.json for design exercises).
 */
import type { Domain, Project } from '../../core/types';
import type { Stimulus } from '../quiz/types';

interface CheckBase {
  /** Short description shown before and after checking (Basque). */
  title: string;
}

/** After the stimuli, the cylinder events must be exactly these (or start with them). */
export interface SequenceCheck extends CheckBase {
  type: 'sequence';
  stimuli: Stimulus[];
  expect: string[];
  match?: 'exact' | 'prefix';
  /** Observation time after the last stimulus (default SETTLE_MS). */
  withinMs?: number;
}

/** After the stimuli, none of these events may happen. */
export interface NeverCheck extends CheckBase {
  type: 'never';
  stimuli: Stimulus[];
  events: string[];
  withinMs?: number;
}

/**
 * Time between two moments: "start" (t = 0), "end" (when the last stimulus was
 * applied) or the first occurrence of an event (for `to`: the first one after `from`).
 */
export interface DurationCheck extends CheckBase {
  type: 'duration';
  stimuli: Stimulus[];
  from: string;
  to: string;
  minMs?: number;
  maxMs?: number;
  withinMs?: number;
}

/** The circuit must contain at least one component of one of these types. */
export interface UsesCheck extends CheckBase {
  type: 'uses';
  componentTypes: string[];
}

export type Check = SequenceCheck | NeverCheck | DurationCheck | UsesCheck;

interface ExerciseBase {
  id: string;
  title: string;
  domain: Domain;
  level: 1 | 2 | 3;
  tags: string[];
  theoryRefs: string[];
  status: 'draft' | 'reviewed';
  /** Where the idea comes from (book section, class...), when not original. */
  source?: string;
  hints_md: string[];
}

export interface DesignExercise extends ExerciseBase {
  kind: 'design';
  /** Component types the solution may use (junctions are always allowed). Empty = any. */
  allowedComponents: string[];
  checks: Check[];
}

export interface CalcPart {
  id: string;
  prompt_md: string;
  answer: { value: number; unit: string; tolerancePct: number };
}

export interface CalcExercise extends ExerciseBase {
  kind: 'calc';
  parts: CalcPart[];
  solution_md: string;
}

export type ExerciseMeta = DesignExercise | CalcExercise;

export type Exercise = ExerciseMeta & {
  folder: string;
  statement: string;
  /** Reference solution (design exercises). */
  solution?: Project;
};
