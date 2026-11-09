import { useState } from 'react';
import type { IoEntry, LadderElement, Rung } from '../../core/plc';
import type { LadderRuntime } from '../../engine/plc/ladder/runtime';
import { t } from '../../i18n';
import { useEditor } from '../editor/store';
import { useSim } from '../sim/simStore';
import { symbolOf } from './io';
import {
  addParallel,
  addRung,
  findElement,
  insertElement,
  locate,
  makeElement,
  moveRung,
  newId,
  removeElement,
  removeRung,
  updateElement,
  type ElementTemplate,
} from '../ladder/model';
import styles from './Plc.module.css';

const PALETTE: { t: ElementTemplate; group: 'contact' | 'coil' | 'box' }[] = [
  { t: 'no', group: 'contact' },
  { t: 'nc', group: 'contact' },
  { t: 'p', group: 'contact' },
  { t: 'n', group: 'contact' },
  { t: 'out', group: 'coil' },
  { t: 'set', group: 'coil' },
  { t: 'reset', group: 'coil' },
  { t: 'TON', group: 'box' },
  { t: 'TOF', group: 'box' },
  { t: 'TP', group: 'box' },
  { t: 'CTU', group: 'box' },
  { t: 'CTD', group: 'box' },
];

interface Ctx {
  io: IoEntry[];
  rt: LadderRuntime | null;
  selected: string | null;
  select(id: string, rungId: string): void;
}

/** Ladder (KOP-like) program of the project's PLC (SPEC §6.5, decided 2026-11-05). */
export function LadderView() {
  const rungs = useEditor((s) => s.project.plc.ladder);
  const io = useEditor((s) => s.project.plc.io);
  const mode = useEditor((s) => s.mode);
  useSim((s) => s.version);
  const sim = mode === 'sim' ? useSim.getState().sim : null;
  const rt = sim?.ladder ?? null;
  const editable = mode === 'edit';
  const [selected, setSelected] = useState<string | null>(null);
  const [rungId, setRungId] = useState<string | null>(null);

  const apply = (fn: (r: Rung[]) => void) => useEditor.getState().apply((d) => fn(d.plc.ladder));

  const currentRung = rungId && rungs.some((r) => r.id === rungId) ? rungId : rungs.at(-1)?.id;

  function add(tpl: ElementTemplate) {
    let id = '';
    apply((r) => {
      let target = currentRung;
      if (!target) target = addRung(r, null);
      id = newId(r, 'e');
      const loc = selected ? locate(r, selected) : null;
      insertElement(r, loc ? loc.rung.id : target, selected, makeElement(r, tpl, id));
    });
    setSelected(id);
  }

  function parallel() {
    if (!selected) return;
    apply((r) => {
      const id = newId(r, 'e');
      const el = makeElement(r, 'no', id);
      const parId = `${id}p`;
      addParallel(r, selected, el, parId);
    });
  }

  function remove() {
    if (selected) {
      apply((r) => removeElement(r, selected));
      setSelected(null);
    }
  }

  const sel = selected ? findElement(rungs, selected) : null;
  const ctx: Ctx = {
    io,
    rt,
    selected,
    select: (id, rid) => {
      setSelected(id);
      setRungId(rid);
    },
  };

  return (
    <div className={styles.ladder} data-testid="ladder-view">
      <div className={styles.palette} role="toolbar" aria-label={t('ladder.palette')}>
        {editable ? (
          <>
            {PALETTE.map((p) => (
              <button
                key={p.t}
                type="button"
                className={styles.tool}
                title={t(`ladder.el.${p.t}`)}
                aria-label={t(`ladder.el.${p.t}`)}
                onClick={() => add(p.t)}
              >
                <PaletteIcon tpl={p.t} />
              </button>
            ))}
            <span className={styles.sep} />
            <button type="button" className={styles.btn} disabled={!selected} onClick={parallel}>
              {t('ladder.parallel')}
            </button>
            <button type="button" className={styles.btn} disabled={!selected} onClick={remove}>
              {t('ladder.remove')}
            </button>
            <span className={styles.sep} />
            <button
              type="button"
              className={styles.btn}
              onClick={() => {
                let id = '';
                apply((r) => {
                  id = addRung(r, currentRung ?? null);
                });
                setRungId(id);
                setSelected(null);
              }}
            >
              {t('ladder.newRung')}
            </button>
          </>
        ) : (
          <ScanControls rt={rt} />
        )}
      </div>

      <div className={styles.ladderBody}>
        <div className={styles.rungs}>
          {rungs.length === 0 && <p className={styles.muted}>{t('ladder.empty')}</p>}
          {rungs.map((rung, i) => (
            <section
              key={rung.id}
              className={`${styles.rung} ${rung.id === currentRung ? styles.rungCurrent : ''}`}
              data-rung-id={rung.id}
              onClick={() => setRungId(rung.id)}
            >
              <header className={styles.rungHead}>
                <span className={styles.rungTitle}>{t('ladder.rung', { n: i + 1 })}</span>
                <input
                  className={styles.comment}
                  value={rung.comment}
                  placeholder={t('ladder.comment')}
                  aria-label={t('ladder.comment')}
                  disabled={!editable}
                  onChange={(e) => {
                    const v = e.target.value;
                    apply((r) => {
                      const x = r.find((k) => k.id === rung.id);
                      if (x) x.comment = v;
                    });
                  }}
                />
                {editable && (
                  <span className={styles.rungTools}>
                    <button
                      type="button"
                      aria-label={t('ladder.up')}
                      onClick={() => apply((r) => moveRung(r, rung.id, -1))}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      aria-label={t('ladder.down')}
                      onClick={() => apply((r) => moveRung(r, rung.id, 1))}
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      aria-label={t('ladder.removeRung')}
                      onClick={() => apply((r) => removeRung(r, rung.id))}
                    >
                      ×
                    </button>
                  </span>
                )}
              </header>
              <div className={styles.rail}>
                <span className={`${styles.railBar} ${rt ? styles.powered : ''}`} />
                {/* Trailing coils sit against the right rail, as in TIA Portal. */}
                <Series
                  list={rung.elements.slice(0, coilStart(rung.elements))}
                  rungId={rung.id}
                  ctx={ctx}
                />
                <span className={styles.wireFill} />
                <Series
                  list={rung.elements.slice(coilStart(rung.elements))}
                  rungId={rung.id}
                  ctx={ctx}
                />
                <span className={styles.railBar} />
              </div>
            </section>
          ))}
        </div>

        <aside className={styles.inspector} aria-label={t('ladder.inspector')}>
          {sel ? (
            <Inspector el={sel} editable={editable} io={io} rt={rt} apply={apply} />
          ) : (
            <p className={styles.muted}>{t(editable ? 'ladder.hint' : 'ladder.simHint')}</p>
          )}
        </aside>
      </div>
    </div>
  );
}

/** Index where the trailing coils start (coils, or parallels made only of coils). */
function coilStart(list: LadderElement[]): number {
  const isCoil = (e: LadderElement): boolean =>
    e.kind === 'coil' || (e.kind === 'parallel' && e.branches.every((b) => b.every(isCoil)));
  let i = list.length;
  while (i > 0 && isCoil(list[i - 1]!)) i--;
  return i;
}

function ScanControls({ rt }: { rt: LadderRuntime | null }) {
  const { sim } = useSim.getState();
  if (!rt || !sim) {
    return (
      <span className={styles.muted}>
        {t(sim?.grafcet ? 'ladder.grafcetRunning' : 'ladder.noPlc')}
      </span>
    );
  }
  function scanOnce() {
    const s = useSim.getState();
    if (!s.sim?.ladder) return;
    s.pause();
    const start = s.sim.ladder.scans;
    s.sim.runUntil(() => s.sim!.ladder!.scans > start, 1000);
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
      <span className={styles.muted}>{t('ladder.scanHint')}</span>
    </>
  );
}

function Series({ list, rungId, ctx }: { list: LadderElement[]; rungId: string; ctx: Ctx }) {
  return (
    <div className={styles.series}>
      {list.map((e) =>
        e.kind === 'parallel' ? (
          <div
            key={e.id}
            className={`${styles.parallel} ${ctx.selected === e.id ? styles.selected : ''}`}
            onClick={(ev) => {
              ev.stopPropagation();
              ctx.select(e.id, rungId);
            }}
            data-element-id={e.id}
          >
            {e.branches.map((b, i) => (
              <div key={i} className={styles.branch}>
                <Series list={b} rungId={rungId} ctx={ctx} />
                <span className={styles.wireFill} />
              </div>
            ))}
          </div>
        ) : (
          <ElementView key={e.id} el={e} rungId={rungId} ctx={ctx} />
        ),
      )}
    </div>
  );
}

function ElementView({ el, rungId, ctx }: { el: LadderElement; rungId: string; ctx: Ctx }) {
  const powered = ctx.rt?.power.get(el.id) === true;
  const operand = el.kind === 'contact' || el.kind === 'coil' ? el.operand : '';
  const symbol = operand ? symbolOf(ctx.io, operand) : '';
  const box = el.kind === 'timer' || el.kind === 'counter';
  return (
    <button
      type="button"
      className={`${styles.element} ${box ? styles.box : ''} ${powered ? styles.powered : ''} ${ctx.selected === el.id ? styles.selected : ''}`}
      data-element-id={el.id}
      data-powered={ctx.rt ? powered : undefined}
      onClick={(ev) => {
        ev.stopPropagation();
        ctx.select(el.id, rungId);
      }}
    >
      {!box && (
        <span className={styles.operand}>
          <span className={styles.symbolName}>{symbol ? `"${symbol}"` : ' '}</span>
          <span className={operand ? '' : styles.missing}>{operand || '???'}</span>
        </span>
      )}
      {box ? <BoxView el={el} rt={ctx.rt} /> : <Glyph el={el} />}
    </button>
  );
}

function Glyph({ el }: { el: LadderElement }) {
  if (el.kind === 'contact') {
    return (
      <svg viewBox="0 0 60 24" className={styles.glyph} aria-hidden="true">
        <line x1={0} y1={12} x2={22} y2={12} />
        <line x1={38} y1={12} x2={60} y2={12} />
        <line x1={22} y1={2} x2={22} y2={22} />
        <line x1={38} y1={2} x2={38} y2={22} />
        {el.type === 'nc' && <line x1={24} y1={21} x2={36} y2={3} />}
        {(el.type === 'p' || el.type === 'n') && (
          <text x={30} y={16} textAnchor="middle" className={styles.glyphText}>
            {el.type.toUpperCase()}
          </text>
        )}
      </svg>
    );
  }
  if (el.kind === 'coil') {
    return (
      <svg viewBox="0 0 60 24" className={styles.glyph} aria-hidden="true">
        <line x1={0} y1={12} x2={20} y2={12} />
        <line x1={40} y1={12} x2={60} y2={12} />
        <path d="M 24 2 Q 18 12 24 22" fill="none" />
        <path d="M 36 2 Q 42 12 36 22" fill="none" />
        {el.type !== 'out' && (
          <text x={30} y={16} textAnchor="middle" className={styles.glyphText}>
            {el.type === 'set' ? 'S' : 'R'}
          </text>
        )}
      </svg>
    );
  }
  return null;
}

const sec = (ms: number) => (ms / 1000).toFixed(ms % 100 === 0 ? 1 : 2).replace('.', ',');

function BoxView({ el, rt }: { el: LadderElement; rt: LadderRuntime | null }) {
  if (el.kind === 'timer') {
    const st = rt?.timers.get(el.name);
    return (
      <span className={styles.boxInner}>
        <span className={styles.boxName}>{el.name}</span>
        <span className={styles.boxType}>{el.type}</span>
        <span className={styles.boxRow}>
          <span>IN</span>
          <span>Q</span>
        </span>
        <span className={styles.boxRow}>
          <span>PT {sec(el.ptMs)} s</span>
          {st && <span data-testid={`et-${el.name}`}>ET {sec(st.et)} s</span>}
        </span>
      </span>
    );
  }
  if (el.kind === 'counter') {
    const st = rt?.counters.get(el.name);
    return (
      <span className={styles.boxInner}>
        <span className={styles.boxName}>{el.name}</span>
        <span className={styles.boxType}>{el.type}</span>
        <span className={styles.boxRow}>
          <span>{el.type === 'CTU' ? 'CU' : 'CD'}</span>
          <span>Q</span>
        </span>
        <span className={styles.boxRow}>
          <span>
            {el.type === 'CTU' ? 'R' : 'LD'} {el.resetOperand || '—'}
          </span>
          <span>
            PV {el.pv}
            {st ? ` · CV ${st.cv}` : ''}
          </span>
        </span>
      </span>
    );
  }
  return null;
}

function Inspector({
  el,
  editable,
  io,
  rt,
  apply,
}: {
  el: LadderElement;
  editable: boolean;
  io: IoEntry[];
  rt: LadderRuntime | null;
  apply: (fn: (r: Rung[]) => void) => void;
}) {
  const set = (patch: Partial<LadderElement>) => apply((r) => updateElement(r, el.id, patch));
  const operandField = (value: string, key: 'operand' | 'resetOperand', labelKey: string) => (
    <label className={styles.field}>
      {t(labelKey)}
      <input
        value={value}
        list="plc-operands"
        disabled={!editable}
        placeholder="I0.0"
        onChange={(e) => set({ [key]: e.target.value.trim() } as Partial<LadderElement>)}
      />
      <span className={styles.muted}>{symbolOf(io, value) || ' '}</span>
    </label>
  );
  return (
    <div className={styles.inspectorBody} data-testid="ladder-inspector">
      <h3>{t(`ladder.kind.${el.kind}`)}</h3>
      <datalist id="plc-operands">
        {io.map((e) => (
          <option key={e.address} value={e.address}>
            {e.symbol}
          </option>
        ))}
      </datalist>
      {el.kind === 'contact' && (
        <>
          <label className={styles.field}>
            {t('ladder.type')}
            <select
              value={el.type}
              disabled={!editable}
              onChange={(e) => set({ type: e.target.value as 'no' })}
            >
              {(['no', 'nc', 'p', 'n'] as const).map((v) => (
                <option key={v} value={v}>
                  {t(`ladder.el.${v}`)}
                </option>
              ))}
            </select>
          </label>
          {operandField(el.operand, 'operand', 'ladder.operand')}
          {rt && (
            <p className={styles.muted}>{t('ladder.value', { v: rt.read(el.operand) ? 1 : 0 })}</p>
          )}
        </>
      )}
      {el.kind === 'coil' && (
        <>
          <label className={styles.field}>
            {t('ladder.type')}
            <select
              value={el.type}
              disabled={!editable}
              onChange={(e) => set({ type: e.target.value as 'out' })}
            >
              {(['out', 'set', 'reset'] as const).map((v) => (
                <option key={v} value={v}>
                  {t(`ladder.el.${v}`)}
                </option>
              ))}
            </select>
          </label>
          {operandField(el.operand, 'operand', 'ladder.operand')}
        </>
      )}
      {el.kind === 'timer' && (
        <>
          <label className={styles.field}>
            {t('ladder.type')}
            <select
              value={el.type}
              disabled={!editable}
              onChange={(e) => set({ type: e.target.value as 'TON' })}
            >
              {(['TON', 'TOF', 'TP'] as const).map((v) => (
                <option key={v} value={v}>
                  {t(`ladder.el.${v}`)}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.field}>
            {t('ladder.instance')}
            <input
              value={el.name}
              disabled={!editable}
              onChange={(e) => set({ name: e.target.value })}
            />
          </label>
          <label className={styles.field}>
            {t('ladder.pt')}
            <input
              type="number"
              min={0}
              step={0.1}
              value={el.ptMs / 1000}
              disabled={!editable}
              onChange={(e) =>
                set({ ptMs: Math.max(0, Math.round(Number(e.target.value) * 1000)) })
              }
            />
          </label>
          <p className={styles.muted}>{t('ladder.timerHint', { name: el.name })}</p>
        </>
      )}
      {el.kind === 'counter' && (
        <>
          <label className={styles.field}>
            {t('ladder.type')}
            <select
              value={el.type}
              disabled={!editable}
              onChange={(e) => set({ type: e.target.value as 'CTU' })}
            >
              {(['CTU', 'CTD'] as const).map((v) => (
                <option key={v} value={v}>
                  {t(`ladder.el.${v}`)}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.field}>
            {t('ladder.instance')}
            <input
              value={el.name}
              disabled={!editable}
              onChange={(e) => set({ name: e.target.value })}
            />
          </label>
          <label className={styles.field}>
            {t('ladder.pv')}
            <input
              type="number"
              step={1}
              value={el.pv}
              disabled={!editable}
              onChange={(e) => set({ pv: Math.round(Number(e.target.value)) })}
            />
          </label>
          {operandField(
            el.resetOperand,
            'resetOperand',
            el.type === 'CTU' ? 'ladder.reset' : 'ladder.load',
          )}
          <p className={styles.muted}>{t('ladder.counterHint', { name: el.name })}</p>
        </>
      )}
      {el.kind === 'parallel' && <p className={styles.muted}>{t('ladder.parallelHint')}</p>}
    </div>
  );
}

function PaletteIcon({ tpl }: { tpl: ElementTemplate }) {
  if (['TON', 'TOF', 'TP', 'CTU', 'CTD'].includes(tpl)) {
    return <span className={styles.paletteText}>{tpl}</span>;
  }
  const el: LadderElement = ['no', 'nc', 'p', 'n'].includes(tpl)
    ? { id: '', kind: 'contact', type: tpl as 'no', operand: '' }
    : { id: '', kind: 'coil', type: tpl as 'out', operand: '' };
  return <Glyph el={el} />;
}
