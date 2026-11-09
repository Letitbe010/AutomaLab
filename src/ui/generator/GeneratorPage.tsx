import { useMemo, useState } from 'react';
import { t } from '../../i18n';
import { generateCascade } from '../../generator/cascade';
import { compareWithSequence, startCandidates, type CompareResult } from '../../generator/compare';
import { generatePlcProject, MAX_PLC_CYLINDERS } from '../../generator/grafcet';
import {
  cascadeGroups,
  cylinderNumber,
  findOverlaps,
  groupName,
  lettersOf,
  moveText,
  parseSequence,
  sequenceText,
  spacePhase,
  type Move,
  type SequenceError,
} from '../../generator/sequence';
import type { Project } from '../../core/types';
import { openGeneratedProject } from '../../storage/persistence';
import { fitView } from '../editor/actions';
import { useEditor } from '../editor/store';
import { useNav } from '../navigation';
import styles from './Generator.module.css';

const errorText = ({ code, ...vars }: SequenceError) => t(`generator.error.${code}`, vars);

/** Section "Sortzailea": from a sequence to its analysis and its circuits. */
export function GeneratorPage() {
  const [text, setText] = useState('A+ B+ B- A-');
  const parsed = useMemo(() => parseSequence(text), [text]);

  return (
    <div className={styles.page}>
      <p className={styles.intro}>{t('generator.intro')}</p>
      <label className={styles.field}>
        {t('generator.sequence')}
        <input
          type="text"
          value={text}
          spellCheck={false}
          autoComplete="off"
          aria-invalid={!parsed.ok}
          onChange={(e) => setText(e.target.value)}
        />
      </label>
      {parsed.ok ? (
        <Analysis key={sequenceText(parsed.moves)} moves={parsed.moves} />
      ) : (
        <p className={styles.error} role="alert" data-testid="sequence-error">
          {errorText(parsed.error)}
        </p>
      )}
    </div>
  );
}

async function openInEditor(project: Project) {
  await openGeneratedProject(project);
  useNav.getState().go('editor');
  requestAnimationFrame(() => requestAnimationFrame(fitView));
}

function Analysis({ moves }: { moves: Move[] }) {
  const overlaps = findOverlaps(moves);
  const { groups, memories, wraps } = cascadeGroups(moves);
  const letters = lettersOf(moves);
  const plcOk = letters.length <= MAX_PLC_CYLINDERS;

  return (
    <>
      <section className={styles.card}>
        <h2>{t('generator.diagram')}</h2>
        <PhaseDiagram moves={moves} />
      </section>

      <div className={styles.columns}>
        <section className={styles.card} data-testid="overlaps">
          <h2>{t('generator.overlaps')}</h2>
          {overlaps.length === 0 ? (
            <p>{t('generator.noOverlaps')}</p>
          ) : (
            <ul className={styles.list}>
              {overlaps.map((o) => (
                <li key={`${o.step}-${o.limit}`}>
                  {t('generator.overlap', {
                    step: o.step + 1,
                    move: moveText(o.move),
                    valve: `${cylinderNumber(o.move.letter)}V1`,
                    other: moveText(o.blockedBy),
                    limit: o.limit,
                  })}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={styles.card} data-testid="groups">
          <h2>{t('generator.groups')}</h2>
          <ul className={styles.groups}>
            {groups.map((g, i) => (
              <li key={i}>
                <strong>{groupName(i)}</strong>
                <span>{g.map((s) => moveText(moves[s]!)).join(' ')}</span>
              </li>
            ))}
          </ul>
          <p className={styles.muted}>
            {t('generator.counts', {
              memories,
              limits: moves.length,
              valves: letters.length,
            })}
          </p>
          <p className={styles.muted}>
            {t(wraps ? 'generator.wrapNote' : 'generator.restNote', {
              group: groupName(groups.length - 1),
            })}
          </p>
        </section>
      </div>

      <section className={styles.card}>
        <h2>{t('generator.generate')}</h2>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.primary}
            onClick={() => void openInEditor(generateCascade(moves))}
          >
            {t('generator.openCascade')}
          </button>
          <button
            type="button"
            className={styles.secondary}
            disabled={!plcOk}
            onClick={() => void openInEditor(generatePlcProject(moves))}
          >
            {t('generator.openGrafcet')}
          </button>
        </div>
        <p className={styles.muted}>
          {plcOk
            ? t('generator.generateNote')
            : t('generator.plcLimit', { max: MAX_PLC_CYLINDERS })}
        </p>
      </section>

      <Compare moves={moves} />
    </>
  );
}

const CELL = 72;
const ROW = 62;
const LEFT = 34;
const TOP = 30;
const HEIGHT = 32;

/** Theoretical space-phase diagram: phase lines 1…n+1, one trace per cylinder. */
function PhaseDiagram({ moves }: { moves: Move[] }) {
  const lines = spacePhase(moves);
  const width = LEFT + moves.length * CELL + 20;
  const height = TOP + lines.length * ROW;
  const phaseX = (i: number) => LEFT + i * CELL;

  return (
    <div className={styles.diagram}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        role="img"
        aria-label={t('generator.diagram')}
        data-testid="phase-diagram"
      >
        {moves.map((_, i) => (
          <text key={i} x={phaseX(i)} y={14} textAnchor="middle" className={styles.phase}>
            {i + 1}
          </text>
        ))}
        <text x={phaseX(moves.length)} y={14} textAnchor="middle" className={styles.phase}>
          1
        </text>
        {moves.map((m, i) => (
          <text key={i} x={phaseX(i) + CELL / 2} y={14} textAnchor="middle" className={styles.move}>
            {moveText(m)}
          </text>
        ))}
        {moves.concat(moves[0]!).map((_, i) => (
          <line key={i} x1={phaseX(i)} x2={phaseX(i)} y1={20} y2={height} className={styles.grid} />
        ))}
        {lines.map((line, r) => {
          const y0 = TOP + r * ROW + HEIGHT + 8;
          const yOf = (level: number) => y0 - level * HEIGHT;
          const points = line.levels.map((l, i) => `${phaseX(i)},${yOf(l)}`).join(' ');
          return (
            <g key={line.letter} data-cylinder={line.letter} data-levels={line.levels.join('')}>
              <text x={8} y={y0 - HEIGHT / 2 + 4} className={styles.letter}>
                {line.letter}
              </text>
              <line
                x1={LEFT}
                x2={phaseX(moves.length)}
                y1={yOf(0)}
                y2={yOf(0)}
                className={styles.base}
              />
              <polyline points={points} className={styles.trace} />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

const eventText = (e: string) => e.replace('-', '−');

function compareText(r: CompareResult, moves: Move[]): string {
  switch (r.status) {
    case 'same':
      return t('generator.result.same', { sequence: sequenceText(moves) });
    case 'invalid':
      return t('generator.result.invalid', { n: r.count });
    case 'missingCylinder':
      return t('generator.result.missingCylinder', { letter: r.letter, label: r.label });
    case 'noStart':
      return t('generator.result.noStart');
    case 'unstable':
      return t('generator.result.unstable');
    case 'different':
      return t('generator.result.different', {
        step: r.step,
        got: eventText(r.got),
        expected: eventText(r.expected),
      });
    case 'stopped':
      return t('generator.result.stopped', { step: r.step, expected: r.expected });
  }
}

/** Compare mode: the circuit open in the editor against this sequence. */
function Compare({ moves }: { moves: Move[] }) {
  const project = useEditor((s) => s.project);
  const candidates = useMemo(() => startCandidates(project), [project]);
  const [chosen, setChosen] = useState<string | null>(null);
  const [result, setResult] = useState<CompareResult | null>(null);
  const startId = chosen ?? candidates[0]?.id ?? null;

  return (
    <section className={styles.card}>
      <h2>{t('generator.compare')}</h2>
      <p>{t('generator.compareIntro', { name: project.name })}</p>
      <div className={styles.actions}>
        <label className={styles.inline}>
          {t('generator.startWith')}
          <select
            value={startId ?? ''}
            onChange={(e) => {
              setChosen(e.target.value);
              setResult(null);
            }}
          >
            {candidates.length === 0 && <option value="">—</option>}
            {candidates.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className={styles.secondary}
          onClick={() => setResult(compareWithSequence(project, moves, startId))}
        >
          {t('generator.runCompare')}
        </button>
      </div>
      {result && (
        <div
          className={result.status === 'same' ? styles.ok : styles.bad}
          role="status"
          data-testid="compare-result"
          data-status={result.status}
        >
          {compareText(result, moves)}
          {'events' in result && result.status !== 'same' && result.events.length > 0 && (
            <p className={styles.muted}>
              {t('generator.result.events', {
                events: result.events.map(eventText).join(' '),
              })}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
