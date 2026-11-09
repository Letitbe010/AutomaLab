/** Quiz format (SPEC §8.6.2): every P1 question type. */

export type QuestionType = 'single' | 'multiple' | 'truefalse' | 'numeric' | 'identify' | 'predict';

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

export interface MultipleQuestion extends Base {
  type: 'multiple';
  options: string[];
  /** Every correct option; all of them, and no other, must be chosen. */
  answer: { indices: number[] };
}

/** "Click the component that…": the answer is any of these component ids. */
export interface IdentifyQuestion extends Base {
  type: 'identify';
  answer: { componentIds: string[] };
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

export type Question =
  | SingleQuestion
  | MultipleQuestion
  | TrueFalseQuestion
  | NumericQuestion
  | IdentifyQuestion
  | PredictQuestion;

export interface Quiz {
  templateId: string;
  questions: Question[];
}

/** What the user answered: option index or number, boolean, option indices, component id. */
export type Response = number | boolean | number[] | string;
