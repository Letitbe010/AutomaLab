/** Quiz format (SPEC §8.6.2). Phase 3 types: single, truefalse, numeric, predict. */

export type QuestionType = 'single' | 'truefalse' | 'numeric' | 'predict';

/** Simulation stimulus, by component label: press/release/pulse a manual operator, or wait. */
export type Stimulus =
  ['press' | 'release', string] | ['pulse', string] | ['pulse', string, number] | ['wait', number];

interface Base {
  id: string;
  prompt_md: string;
  explanation_md: string;
  theoryRef?: string;
}

export interface SingleQuestion extends Base {
  type: 'single';
  options: string[];
  answer: { index: number };
}

export interface TrueFalseQuestion extends Base {
  type: 'truefalse';
  answer: { value: boolean };
}

export interface NumericQuestion extends Base {
  type: 'numeric';
  answer: { value: number; unit: string; tolerancePct: number };
}

export interface PredictQuestion extends Base {
  type: 'predict';
  setup: { state: 'initial' };
  stimuli: Stimulus[];
  options: string[];
  answer: { index: number };
  /**
   * Cylinder events (e.g. ["1A+", "2A+"]) that each option stands for, in the
   * order the engine reports them after the stimuli. Used to check the answer
   * with the engine and to show what the simulation does.
   */
  optionEvents: string[][];
  verifyBySimulation: boolean;
}

export type Question = SingleQuestion | TrueFalseQuestion | NumericQuestion | PredictQuestion;

export interface Quiz {
  templateId: string;
  questions: Question[];
}

/** What the user answered: option index, boolean or number. */
export type Response = number | boolean;
