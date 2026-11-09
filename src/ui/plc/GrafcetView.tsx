import { useRef, useState, type PointerEvent, type ReactNode } from 'react';
import {
  parseExpression,
  type ActionKind,
  type Grafcet,
  type GrafcetStep,
  type GrafcetTransition,
} from '../../core/grafcet';
import { grafcetToLadder } from '../../engine/plc/grafcet/toLadder';
import type { GrafcetRuntime } from '../../engine/plc/grafcet/runtime';
import { t } from '../../i18n';
import { useEditor } from '../editor/store';
import { useSim } from '../sim/simStore';
import {
  addAction,
  addAndBranch,
  addBelow,
  addOrBranch,
  addPrevious,
  addStep,
  linkNext,
  moveItem,
  removeItem,
} from './grafcetModel';
import { useEditorTab } from './tabs';
import styles from './Plc.module.css';

const HALF = 22;
const BAR = 22;
const BRANCH = 16;

type Pick = 'next' | 'previous' | null;

const EMPTY: Grafcet = { steps: [], transitions: [] };

/** GRAFCET editor and online view (SPEC §6.6, decided 2026-11-09). */
export function GrafcetView() {
  const grafcet = useEditor((s) => s.project.plc.grafcet) ?? EMPTY;
  const language = useEditor((s) => s.project.plc.language ?? 'ladder');
  const io = useEditor((s) => s.project.plc.io);
  const mode = useEditor((s) => s.mode);
  useSim((s) => s.version);
  const sim = mode === 'sim' ? useSim.getState().sim : null;
  const rt = sim?.grafcet ?? null;
  const editable = mode === 'edit';
  const [selected, setSelected] = useState<string | null>(null);
  const [pick, setPick] = useState<Pick>(null);
  const [message, setMessage] = useState<string | null>(null);
  const drag = useRef<{ id: string; dx: number; dy: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const apply = (fn: (g: Grafcet) => void, record = true) =>
    useEditor.getState().apply((d) => {
      d.plc.grafcet ??= { steps: [], transitions: [] };
      fn(d.plc.grafcet);
    }, record);

  const step = grafcet.steps.find((s) => s.id === selected);
  const transition = grafcet.transitions.find((x) => x.id === selected);

  function run(fn: (g: Grafcet) => string | null | void) {
    let next: string | null | void = null;
    apply((g) => {
      next = fn(g);
    });
    if (next) setSelected(next);
  }

  function world(e: PointerEvent): [number, number] {
    const box = svgRef.current!.getBoundingClientRect();
    return [e.clientX - box.left, e.clientY - box.top];
  }

  function down(e: PointerEvent, id: string, kind: 'step' | 'transition') {
    e.stopPropagation();
    if (pick && kind === 'step' && transition) {
      const target = id;
      apply((g) =>
        pick === 'next'
          ? linkNext(g, transition.id, target)
          : addPrevious(g, transition.id, target),
      );
      setPick(null);
      return;
    }
    setPick(null);
    setSelected(id);
    if (!editable) return;
    const item =
      grafcet.steps.find((s) => s.id === id) ?? grafcet.transitions.find((x) => x.id === id);
    if (!item) return;
    const [x, y] = world(e);
    drag.current = { id, dx: x - item.x, dy: y - item.y };
    useEditor.getState().beginGesture();
    (e.target as Element).setPointerCapture?.(e.pointerId);
  }

  function moveDrag(e: PointerEvent) {
    if (!drag.current) return;
    const { id, dx, dy } = drag.current;
    const [x, y] = world(e);
    apply((g) => moveItem(g, id, x - dx, y - dy), false);
  }

  function up() {
    if (!drag.current) return;
    drag.current = null;
    useEditor.getState().endGesture();
  }

  function convert() {
    const res = grafcetToLadder(grafcet, io);
    if (!res.ok) {
      setMessage(t('grafcet.convertFailed', { n: res.problems.length }));
      return;
    }
    const hasLadder = useEditor.getState().project.plc.ladder.length > 0;
    if (hasLadder && !window.confirm(t('grafcet.convertConfirm'))) return;
    useEditor.getState().apply((d) => {
      d.plc.ladder = res.ladder;
      d.plc.io = res.io;
      d.plc.language = 'ladder';
    });
    useEditorTab.getState().setTab('ladder');
  }

  const setLanguage = (language: 'ladder' | 'grafcet') =>
    useEditor.getState().apply((d) => {
      d.plc.language = language;
    });

  const width = Math.max(
    900,
    ...grafcet.steps.map((s) => s.x + 420),
    ...grafcet.transitions.map((x) => x.x + 420),
  );
  const height = Math.max(
    500,
    ...grafcet.steps.map((s) => s.y + 120),
    ...grafcet.transitions.map((x) => x.y + 140),
  );
  const notRunning = sim !== null && rt === null;

  return (
    <div className={styles.ladder} data-testid="grafcet-view">
      <div className={styles.palette} role="toolbar" aria-label={t('grafcet.toolbar')}>
        {editable ? (
          <>
            <div className={styles.seg} role="group" aria-label={t('grafcet.language')}>
              <span className={styles.muted}>{t('grafcet.language')}</span>
              {(['ladder', 'grafcet'] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  aria-pressed={language === l}
                  onClick={() => setLanguage(l)}
                >
                  {t(`grafcet.lang.${l}`)}
                </button>
              ))}
            </div>
            <span className={styles.sep} />
            <button type="button" className={styles.btn} onClick={() => run(addStep)}>
              {t('grafcet.addStep')}
            </button>
            <button
              type="button"
              className={styles.btn}
              disabled={!step && !(transition && transition.to.length === 0)}
              onClick={() => run((g) => addBelow(g, selected!))}
            >
              {t('grafcet.addBelow')}
            </button>
            <button
              type="button"
              className={styles.btn}
              disabled={!step}
              onClick={() => run((g) => addOrBranch(g, selected!))}
            >
              {t('grafcet.orBranch')}
            </button>
            <button
              type="button"
              className={styles.btn}
              disabled={!transition}
              onClick={() => run((g) => addAndBranch(g, selected!))}
            >
              {t('grafcet.andBranch')}
            </button>
            <button
              type="button"
              className={styles.btn}
              disabled={!transition}
              aria-pressed={pick === 'next'}
              onClick={() => setPick(pick === 'next' ? null : 'next')}
            >
              {t('grafcet.linkNext')}
            </button>
            <button
              type="button"
              className={styles.btn}
              disabled={!transition}
              aria-pressed={pick === 'previous'}
              onClick={() => setPick(pick === 'previous' ? null : 'previous')}
            >
              {t('grafcet.addPrevious')}
            </button>
            <button
              type="button"
              className={styles.btn}
              disabled={!selected}
              onClick={() => {
                run((g) => removeItem(g, selected!));
                setSelected(null);
              }}
            >
              {t('ladder.remove')}
            </button>
            <span className={styles.sep} />
            <button
              type="button"
              className={styles.btn}
              disabled={grafcet.steps.length === 0}
              onClick={convert}
            >
              {t('grafcet.convert')}
            </button>
          </>
        ) : (
          <GrafcetScan rt={rt} />
        )}
      </div>
      {pick && <p className={styles.banner}>{t('grafcet.pickHint')}</p>}
      {message && <p className={styles.banner}>{message}</p>}
      {notRunning && <p className={styles.banner}>{t('grafcet.notRunning')}</p>}

      <div className={styles.ladderBody}>
        <div className={styles.grafcetArea}>
          <svg
            ref={svgRef}
            width={width}
            height={height}
            className={styles.grafcetSvg}
            onPointerMove={moveDrag}
            onPointerUp={up}
            onPointerDown={() => {
              setSelected(null);
              setPick(null);
            }}
          >
            <Links grafcet={grafcet} />
            {grafcet.transitions.map((x, i) => (
              <TransitionView
                key={x.id}
                t={x}
                index={i}
                rt={rt}
                selected={selected === x.id}
                onDown={(e) => down(e, x.id, 'transition')}
              />
            ))}
            {grafcet.steps.map((s) => (
              <StepView
                key={s.id}
                s={s}
                active={rt?.active.has(s.id) === true}
                selected={selected === s.id}
                onDown={(e) => down(e, s.id, 'step')}
              />
            ))}
          </svg>
          {grafcet.steps.length === 0 && (
            <p className={styles.grafcetEmpty}>{t('grafcet.empty')}</p>
          )}
        </div>
        <aside className={styles.inspector} aria-label={t('ladder.inspector')}>
          <datalist id="grafcet-names">
            {io.map((e) => (
              <option key={e.address} value={e.symbol || e.address}>
                {e.address}
              </option>
            ))}
          </datalist>
          {step ? (
            <StepInspector step={step} editable={editable} apply={apply} />
          ) : transition ? (
            <TransitionInspector t={transition} editable={editable} apply={apply} rt={rt} />
          ) : (
            <p className={styles.muted}>{t(editable ? 'grafcet.hint' : 'grafcet.simHint')}</p>
          )}
        </aside>
      </div>
    </div>
  );
}

function GrafcetScan({ rt }: { rt: GrafcetRuntime | null }) {
  if (!rt) return <span className={styles.muted}>{t('grafcet.notRunning')}</span>;
  function scanOnce() {
    const s = useSim.getState();
    const g = s.sim?.grafcet;
    if (!g) return;
    s.pause();
    const start = g.scans;
    s.sim!.runUntil(() => g.scans > start, 1000);
    useSim.setState({ version: s.version + 1 });
  }
  return (
    <>
      <button type="button" className={styles.btn} onClick={scanOnce}>
        {t('ladder.scanOnce')}
      </button>
      <span className={styles.scanInfo} data-testid="scan-info">
        {t('ladder.scans', { n: rt.scans })}
      </span>
    </>
  );
}

/** Orthogonal links; AND divergences and convergences are double bars. */
function Links({ grafcet }: { grafcet: Grafcet }) {
  const byId = new Map(grafcet.steps.map((s) => [s.id, s]));
  const leftMost = Math.min(200, ...grafcet.steps.map((s) => s.x));
  const lines: ReactNode[] = [];
  const poly = (key: string, points: [number, number][]) =>
    lines.push(<polyline key={key} points={points.map((p) => p.join(',')).join(' ')} />);
  const bar = (key: string, x1: number, x2: number, y: number) =>
    lines.push(
      <g key={key}>
        <line x1={x1 - 10} x2={x2 + 10} y1={y - 2} y2={y - 2} />
        <line x1={x1 - 10} x2={x2 + 10} y1={y + 2} y2={y + 2} />
      </g>,
    );
  grafcet.transitions.forEach((tr, i) => {
    const from = tr.from.flatMap((id) => byId.get(id) ?? []);
    const to = tr.to.flatMap((id) => byId.get(id) ?? []);
    if (from.length === 1) {
      const s = from[0]!;
      const y0 = s.y + HALF + BRANCH;
      poly(`f${tr.id}`, [
        [s.x, s.y + HALF],
        [s.x, y0],
        [tr.x, y0],
        [tr.x, tr.y],
      ]);
    } else if (from.length > 1) {
      const y0 = tr.y - BAR;
      bar(`fb${tr.id}`, Math.min(...from.map((s) => s.x)), Math.max(...from.map((s) => s.x)), y0);
      for (const s of from) {
        poly(`f${tr.id}${s.id}`, [
          [s.x, s.y + HALF],
          [s.x, y0 - 2],
        ]);
      }
      poly(`fm${tr.id}`, [
        [tr.x, y0 + 2],
        [tr.x, tr.y],
      ]);
    }
    if (to.length > 1) {
      const y1 = tr.y + BAR;
      bar(`tb${tr.id}`, Math.min(...to.map((s) => s.x)), Math.max(...to.map((s) => s.x)), y1);
      poly(`tm${tr.id}`, [
        [tr.x, tr.y],
        [tr.x, y1 - 2],
      ]);
      for (const s of to) {
        poly(`t${tr.id}${s.id}`, [
          [s.x, y1 + 2],
          [s.x, s.y - HALF],
        ]);
      }
    } else if (to.length === 1) {
      const s = to[0]!;
      if (s.y - HALF > tr.y) {
        const y1 = s.y - HALF - BRANCH;
        poly(`t${tr.id}`, [
          [tr.x, tr.y],
          [tr.x, y1],
          [s.x, y1],
          [s.x, s.y - HALF],
        ]);
      } else {
        // Jump back: leaves to the left and goes up, with an arrow (IEC 60848).
        const side = leftMost - 60 - i * 12;
        const y0 = tr.y + BRANCH;
        const y1 = s.y - HALF - BRANCH;
        poly(`t${tr.id}`, [
          [tr.x, tr.y],
          [tr.x, y0],
          [side, y0],
          [side, y1],
          [s.x, y1],
          [s.x, s.y - HALF],
        ]);
        const mid = (y0 + y1) / 2;
        lines.push(
          <polygon
            key={`a${tr.id}`}
            points={`${side - 5},${mid + 8} ${side + 5},${mid + 8} ${side},${mid - 2}`}
            className={styles.grafcetArrow}
          />,
        );
      }
    }
  });
  return <g className={styles.grafcetLinks}>{lines}</g>;
}

function StepView({
  s,
  active,
  selected,
  onDown,
}: {
  s: GrafcetStep;
  active: boolean;
  selected: boolean;
  onDown: (e: PointerEvent) => void;
}) {
  return (
    <g
      className={`${styles.gStep} ${selected ? styles.gSelected : ''}`}
      data-step-id={s.id}
      data-active={active}
      onPointerDown={onDown}
    >
      <rect
        x={s.x - HALF}
        y={s.y - HALF}
        width={HALF * 2}
        height={HALF * 2}
        className={active ? styles.gActive : ''}
      />
      {s.initial && (
        <rect
          x={s.x - HALF + 4}
          y={s.y - HALF + 4}
          width={HALF * 2 - 8}
          height={HALF * 2 - 8}
          className={styles.gInner}
        />
      )}
      <text x={s.x} y={s.y + (active ? -6 : 5)} textAnchor="middle" className={styles.gNumber}>
        {s.number}
      </text>
      {active && <circle cx={s.x} cy={s.y + 11} r={5} className={styles.gToken} />}
      {s.actions.map((a, i) => (
        <g key={a.id}>
          {i === 0 && <line x1={s.x + HALF} x2={s.x + HALF + 14} y1={s.y} y2={s.y} />}
          <rect
            x={s.x + HALF + 14}
            y={s.y - 12 + i * 24}
            width={150}
            height={24}
            className={styles.gAction}
          />
          <text x={s.x + HALF + 20} y={s.y + 4 + i * 24} className={styles.gActionText}>
            {a.kind === 'N' ? '' : `${a.kind}  `}
            {a.operand || '???'}
            {a.kind === 'C' && a.condition ? ` [${a.condition}]` : ''}
          </text>
        </g>
      ))}
      {s.comment && s.actions.length === 0 && (
        <text x={s.x + HALF + 10} y={s.y + 4} className={styles.gComment}>
          {s.comment}
        </text>
      )}
    </g>
  );
}

function prettyExpr(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /[/!]([A-Za-zÀ-ÿ][\wÀ-ÿ.]*)/g;
  let last = 0;
  const plain = (s: string) =>
    s
      .replace(/\*/g, '·')
      .replace(/\^/g, '↑')
      .replace(/(^|[\s(·+])_/g, '$1↓');
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text))) {
    if (text.slice(Math.max(0, m.index - 1), m.index) === 't') continue;
    out.push(plain(text.slice(last, m.index)));
    out.push(
      <tspan key={k++} textDecoration="overline">
        {m[1]}
      </tspan>,
    );
    last = m.index + m[0].length;
  }
  out.push(plain(text.slice(last)));
  return out;
}

function TransitionView({
  t: tr,
  index,
  rt,
  selected,
  onDown,
}: {
  t: GrafcetTransition;
  index: number;
  rt: GrafcetRuntime | null;
  selected: boolean;
  onDown: (e: PointerEvent) => void;
}) {
  const enabled = rt?.isEnabled(tr) === true;
  return (
    <g
      className={`${styles.gTransition} ${selected ? styles.gSelected : ''} ${enabled ? styles.gEnabled : ''}`}
      data-transition-id={tr.id}
      data-enabled={rt ? enabled : undefined}
      onPointerDown={onDown}
    >
      <rect x={tr.x - 26} y={tr.y - 9} width={52} height={18} className={styles.gHit} />
      <line x1={tr.x - 16} x2={tr.x + 16} y1={tr.y} y2={tr.y} className={styles.gBar} />
      <text x={tr.x - 22} y={tr.y + 4} textAnchor="end" className={styles.gComment}>
        T{index + 1}
      </text>
      <text x={tr.x + 24} y={tr.y + 4} className={styles.gReceptivity}>
        {tr.receptivity ? prettyExpr(tr.receptivity) : '???'}
      </text>
    </g>
  );
}

function ExprError({ text }: { text: string }) {
  const r = parseExpression(text);
  if (r.ok) return null;
  return (
    <span className={styles.exprError}>{t(`grafcet.syntax.${r.code}`, { pos: r.pos + 1 })}</span>
  );
}

function StepInspector({
  step,
  editable,
  apply,
}: {
  step: GrafcetStep;
  editable: boolean;
  apply: (fn: (g: Grafcet) => void) => void;
}) {
  const edit = (fn: (s: GrafcetStep) => void) =>
    apply((g) => {
      const s = g.steps.find((k) => k.id === step.id);
      if (s) fn(s);
    });
  return (
    <div className={styles.inspectorBody} data-testid="grafcet-inspector">
      <h3>{t('grafcet.step')}</h3>
      <label className={styles.field}>
        {t('grafcet.number')}
        <input
          type="number"
          min={0}
          value={step.number}
          disabled={!editable}
          onChange={(e) =>
            edit((s) => {
              s.number = Math.max(0, Math.round(Number(e.target.value)));
            })
          }
        />
      </label>
      <label className={styles.checkField}>
        <input
          type="checkbox"
          checked={step.initial}
          disabled={!editable}
          onChange={(e) =>
            edit((s) => {
              s.initial = e.target.checked;
            })
          }
        />
        {t('grafcet.initial')}
      </label>
      <label className={styles.field}>
        {t('ladder.comment')}
        <input
          value={step.comment}
          disabled={!editable}
          onChange={(e) =>
            edit((s) => {
              s.comment = e.target.value;
            })
          }
        />
      </label>
      <h3>{t('grafcet.actions')}</h3>
      {step.actions.map((a) => {
        const set = (fn: (x: (typeof step.actions)[number]) => void) =>
          edit((s) => {
            const x = s.actions.find((k) => k.id === a.id);
            if (x) fn(x);
          });
        return (
          <div key={a.id} className={styles.actionRow} data-action-id={a.id}>
            <select
              value={a.kind}
              disabled={!editable}
              aria-label={t('ladder.type')}
              onChange={(e) =>
                set((x) => {
                  x.kind = e.target.value as ActionKind;
                })
              }
            >
              {(['N', 'C', 'S', 'R'] as const).map((k) => (
                <option key={k} value={k}>
                  {t(`grafcet.kind.${k}`)}
                </option>
              ))}
            </select>
            <input
              value={a.operand}
              list="grafcet-names"
              placeholder="Q0.0"
              disabled={!editable}
              aria-label={t('ladder.operand')}
              onChange={(e) =>
                set((x) => {
                  x.operand = e.target.value.trim();
                })
              }
            />
            {a.kind === 'C' && (
              <>
                <input
                  value={a.condition}
                  list="grafcet-names"
                  placeholder={t('grafcet.condition')}
                  disabled={!editable}
                  aria-label={t('grafcet.condition')}
                  onChange={(e) =>
                    set((x) => {
                      x.condition = e.target.value;
                    })
                  }
                />
                <ExprError text={a.condition} />
              </>
            )}
            {editable && (
              <button
                type="button"
                className={styles.btn}
                aria-label={t('ladder.remove')}
                onClick={() =>
                  edit((s) => {
                    s.actions = s.actions.filter((k) => k.id !== a.id);
                  })
                }
              >
                ×
              </button>
            )}
          </div>
        );
      })}
      {editable && (
        <button type="button" className={styles.btn} onClick={() => edit(addAction)}>
          {t('grafcet.addAction')}
        </button>
      )}
    </div>
  );
}

function TransitionInspector({
  t: tr,
  editable,
  apply,
  rt,
}: {
  t: GrafcetTransition;
  editable: boolean;
  apply: (fn: (g: Grafcet) => void) => void;
  rt: GrafcetRuntime | null;
}) {
  const edit = (fn: (x: GrafcetTransition) => void) =>
    apply((g) => {
      const x = g.transitions.find((k) => k.id === tr.id);
      if (x) fn(x);
    });
  return (
    <div className={styles.inspectorBody} data-testid="grafcet-inspector">
      <h3>{t('grafcet.transition')}</h3>
      <label className={styles.field}>
        {t('grafcet.receptivity')}
        <input
          value={tr.receptivity}
          list="grafcet-names"
          placeholder="Martxa * /A_aurrean"
          disabled={!editable}
          onChange={(e) =>
            edit((x) => {
              x.receptivity = e.target.value;
            })
          }
        />
      </label>
      <ExprError text={tr.receptivity} />
      <p className={styles.muted}>{t('grafcet.syntaxHelp')}</p>
      <label className={styles.field}>
        {t('ladder.comment')}
        <input
          value={tr.comment}
          disabled={!editable}
          onChange={(e) =>
            edit((x) => {
              x.comment = e.target.value;
            })
          }
        />
      </label>
      {rt && (
        <p className={styles.muted}>
          {t('grafcet.receptivityValue', { v: rt.receptivity(tr.id) ? 1 : 0 })}
        </p>
      )}
    </div>
  );
}
