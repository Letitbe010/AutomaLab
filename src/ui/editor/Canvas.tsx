import { useEffect, useMemo, useRef, useState, type PointerEvent, type WheelEvent } from 'react';
import { getComponentDef } from '../../components/registry';
import { GRID, portPosition, svgTransform, transformLocal } from '../../core/geometry';
import type { ComponentInstance, Point, PortRef } from '../../core/types';
import { findLimitBindings } from '../../engine/coupling/mechanical';
import type { NodeState } from '../../engine/types';
import { t } from '../../i18n';
import { HelpCard } from '../help/HelpCard';
import { useLearning } from '../learning/store';
import { clickSide, clickTarget } from '../sim/interaction';
import { useSim } from '../sim/simStore';
import { addAt, componentBox, screenToWorld, zoomBy } from './actions';
import {
  connect,
  insertBendPoint,
  materializeWire,
  moveBendPoint,
  moveComponents,
  removeBendPoint,
  splitWire,
  wirePolyline,
} from './model/ops';
import { routeWire, snap, snapPoint } from './model/routing';
import { useEditor } from './store';
import styles from './Editor.module.css';

export const DND_TYPE = 'application/x-automalab-type';

type Gesture =
  | { kind: 'pan'; startClient: Point; startView: { x: number; y: number } }
  | { kind: 'drag'; startWorld: Point; applied: Point; ids: string[] }
  | { kind: 'marquee'; start: Point; current: Point; additive: boolean }
  | { kind: 'bend'; wireId: string; index: number }
  | { kind: 'press'; compId: string; side: 'left' | 'right' };

const toPoints = (poly: Point[]) => poly.map((p) => p.join(',')).join(' ');

function closestData(target: EventTarget | null, attr: string): string | null {
  const el = (target as Element | null)?.closest?.(`[${attr}]`);
  return el ? el.getAttribute(attr) : null;
}

function parsePortRef(value: string): PortRef {
  const i = value.indexOf('|');
  return [value.slice(0, i), value.slice(i + 1)];
}

function ComponentView({
  comp,
  selected,
  mode,
  simState,
  clickable,
  readout,
}: {
  comp: ComponentInstance;
  selected: boolean;
  mode: 'edit' | 'sim';
  /** State from the running simulation (valve position, piston position...). */
  simState?: unknown;
  clickable?: boolean;
  /** Short text shown next to the symbol in simulation (gauge pressure). */
  readout?: string | undefined;
}) {
  const def = getComponentDef(comp.type);
  if (!def) return null;
  const Symbol = def.symbol;
  const [bx, by, bw, bh] = def.bounds;
  const label = typeof comp.params.label === 'string' ? comp.params.label : '';
  const [lx, ly] = def.labelAt ?? [bx, by];
  const [tx, ty] = transformLocal([lx * GRID, ly * GRID], comp.rot, comp.mirror);
  const state = simState ?? def.initState(comp.params);
  const position =
    typeof (state as { position?: unknown } | null)?.position === 'number'
      ? (state as { position: number }).position
      : undefined;
  const cls = mode === 'edit' ? styles.movable : clickable ? styles.clickable : undefined;
  return (
    <g data-component-id={comp.id} data-position={position} className={cls}>
      <g transform={svgTransform(comp)}>
        <rect
          x={bx * GRID}
          y={by * GRID}
          width={bw * GRID}
          height={bh * GRID}
          className={selected ? styles.selectBox : styles.hitBox}
        />
        <Symbol state={state} params={comp.params} />
      </g>
      {label && (
        <text x={comp.x + tx} y={comp.y + ty - 3} className={styles.compLabel}>
          {label}
        </text>
      )}
      {readout && (
        <text x={comp.x + tx} y={comp.y + ty + 8} className={styles.readout}>
          {readout}
        </text>
      )}
    </g>
  );
}

const WIRE_STATE_CLASS: Record<NodeState, string> = {
  PRESSURE: styles.wirePressure!,
  EXHAUST: styles.wireExhaust!,
  BLOCKED: styles.wireBlocked!,
};

const HOVER_DELAY_MS = 600;

export function Canvas() {
  const svgRef = useRef<SVGSVGElement>(null);
  const project = useEditor((s) => s.project);
  const selection = useEditor((s) => s.selection);
  const view = useEditor((s) => s.view);
  const viewport = useEditor((s) => s.viewport);
  const mode = useEditor((s) => s.mode);
  const wireDraft = useEditor((s) => s.wireDraft);
  const [gesture, setGesture] = useState<Gesture | null>(null);
  const [spaceDown, setSpaceDown] = useState(false);
  // Re-render on every simulation tick; the Simulation object itself is mutable.
  useSim((s) => s.version);
  const sim = mode === 'sim' ? useSim.getState().sim : null;
  const [hover, setHover] = useState<{ compId: string; at: Point; shown: boolean } | null>(null);
  const helpFor = useEditor((s) => s.helpFor);
  const highlightId = useLearning((s) => s.highlightId);
  const highlighted = highlightId
    ? project.components.find((c) => c.id === highlightId)
    : undefined;
  const highlightBox = highlighted ? componentBox(highlighted) : null;

  useEffect(() => {
    if (!hover || hover.shown) return;
    const id = setTimeout(() => setHover({ ...hover, shown: true }), HOVER_DELAY_MS);
    return () => clearTimeout(id);
  }, [hover]);

  // Track canvas size for zoom-to-centre and fit.
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      if (entry)
        useEditor.getState().setViewport(entry.contentRect.width, entry.contentRect.height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const isField = (e: KeyboardEvent) =>
      (e.target as HTMLElement | null)?.closest?.('input, textarea, select') != null;
    const down = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isField(e)) {
        setSpaceDown(true);
        e.preventDefault();
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === 'Space') setSpaceDown(false);
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  const localPoint = (e: { clientX: number; clientY: number }): Point => {
    const r = svgRef.current!.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  };
  const worldPoint = (e: { clientX: number; clientY: number }) => screenToWorld(localPoint(e));

  const selectedComps = useMemo(() => new Set(selection.components), [selection.components]);
  const selectedWires = useMemo(() => new Set(selection.connections), [selection.connections]);

  const polylines = useMemo(
    () => new Map(project.connections.map((w) => [w.id, wirePolyline(project, w)])),
    [project],
  );

  // Lines ending on a pilot port are pilot lines (drawn dashed).
  const pilotWires = useMemo(() => {
    const isPilot = ([compId, portId]: PortRef) => {
      const comp = project.components.find((c) => c.id === compId);
      return getComponentDef(comp?.type ?? '')?.ports.find((p) => p.id === portId)?.pilot === true;
    };
    return new Set(
      project.connections.filter((w) => isPilot(w.from) || isPilot(w.to)).map((w) => w.id),
    );
  }, [project]);

  // Limit-valve marks drawn at the cylinder end positions they detect.
  const limitMarks = useMemo(() => {
    const count = new Map<string, number>();
    return findLimitBindings(project.components).flatMap((b) => {
      const cyl = project.components.find((c) => c.id === b.cylinderId)!;
      const valve = project.components.find((c) => c.id === b.valveId)!;
      const at = getComponentDef(cyl.type)?.limitMarks?.[b.at];
      if (!at) return [];
      const key = `${b.cylinderId}${b.at}`;
      const n = count.get(key) ?? 0;
      count.set(key, n + 1);
      const toWorld = ([x, y]: Point): Point => {
        const [dx, dy] = transformLocal([x, y], cyl.rot, cyl.mirror);
        return [cyl.x + dx, cyl.y + dy];
      };
      return [
        {
          valveId: b.valveId,
          label: typeof valve.params.label === 'string' ? valve.params.label : valve.id,
          base: toWorld([at[0], at[1]]),
          tip: toWorld([at[0], at[1] - 18]),
          text: toWorld([at[0], at[1] - 22 - n * 9]),
        },
      ];
    });
  }, [project.components]);

  const connectedPorts = useMemo(
    () => new Set(project.connections.flatMap((w) => [w.from.join('|'), w.to.join('|')])),
    [project.connections],
  );

  /** Completes the draft on a port, or on a line (splitWireId) by inserting a T-junction. */
  function finishWire(to: PortRef | null, splitWireId?: string, at?: Point) {
    const st = useEditor.getState();
    const draft = st.wireDraft;
    if (!draft) return;
    const before = st.project;
    const result = st.apply((p) => {
      let target = to;
      if (splitWireId && at) {
        const jid = splitWire(p, splitWireId, at);
        if (!jid) return { ok: false as const, reason: 'missing' as const };
        target = [jid, 'j'];
      }
      return connect(p, draft.from, target!, draft.points);
    });
    if (!result.ok && st.project !== before) {
      // Roll back the junction inserted for a refused connection (one undo step).
      useEditor.setState((s) => ({ project: before, past: s.past.slice(0, -1) }));
    }
    if (result.ok) {
      st.setWireDraft(null);
      st.select({ connections: [result.id] });
      st.setNotice(null);
    } else {
      st.setNotice(`editor.connect.${result.reason}`);
      if (result.reason !== 'samePort') st.setWireDraft(null);
    }
  }

  function onPointerDown(e: PointerEvent<SVGSVGElement>) {
    const st = useEditor.getState();
    const target = e.target;
    svgRef.current?.setPointerCapture(e.pointerId);

    setHover(null);
    const world = worldPoint(e);
    const compId = closestData(target, 'data-component-id');

    // Simulation: clicking a manual operator actuates it (held while pressed).
    if (st.mode === 'sim' && e.button === 0 && !spaceDown && compId) {
      const comp = st.project.components.find((c) => c.id === compId);
      const targetOps = comp && clickTarget(comp.type);
      if (comp && targetOps) {
        const side = clickSide(comp, targetOps, world);
        const simStore = useSim.getState();
        // Shift+click latches a manual operator (e.g. both buttons of a two-hand control);
        // a plain click releases it again.
        if (targetOps.toggle || e.shiftKey) {
          const closed = simStore.sim?.componentInput(compId)[side] === true;
          simStore.setInput(compId, { [side]: !closed });
        } else {
          simStore.setInput(compId, { [side]: true });
          setGesture({ kind: 'press', compId, side });
        }
        return;
      }
    }

    if (e.button === 1 || spaceDown || (st.mode === 'sim' && e.button === 0)) {
      setGesture({ kind: 'pan', startClient: [e.clientX, e.clientY], startView: { ...view } });
      return;
    }
    if (e.button !== 0) return;
    const portAttr = closestData(target, 'data-port');
    const wireId = closestData(target, 'data-connection-id');
    const bend = closestData(target, 'data-bend');

    if (st.wireDraft) {
      if (portAttr) {
        finishWire(parsePortRef(portAttr));
      } else if (wireId) {
        // Ending on a line creates a T-junction there.
        finishWire(null, wireId, world);
      } else {
        st.setWireDraft({ ...st.wireDraft, points: [...st.wireDraft.points, snapPoint(world)] });
      }
      return;
    }

    if (portAttr) {
      const from = parsePortRef(portAttr);
      st.setWireDraft({ from, points: [], cursor: snapPoint(world) });
      st.setNotice(null);
      return;
    }
    if (bend) {
      const [wid, idx] = bend.split('|');
      st.beginGesture();
      st.apply((p) => materializeWire(p, wid!), false);
      setGesture({ kind: 'bend', wireId: wid!, index: Number(idx) });
      return;
    }
    if (compId) {
      let ids = st.selection.components;
      if (e.shiftKey) {
        ids = ids.includes(compId) ? ids.filter((i) => i !== compId) : [...ids, compId];
        st.select({ components: ids, connections: st.selection.connections });
      } else if (!ids.includes(compId)) {
        ids = [compId];
        st.select({ components: ids });
      }
      st.beginGesture();
      setGesture({ kind: 'drag', startWorld: world, applied: [0, 0], ids });
      return;
    }
    if (wireId) {
      if (e.shiftKey) {
        const ws = st.selection.connections;
        st.select({
          components: st.selection.components,
          connections: ws.includes(wireId) ? ws.filter((i) => i !== wireId) : [...ws, wireId],
        });
      } else {
        st.select({ connections: [wireId] });
      }
      return;
    }
    if (!e.shiftKey) st.select({});
    setGesture({ kind: 'marquee', start: world, current: world, additive: e.shiftKey });
  }

  function onPointerMove(e: PointerEvent<SVGSVGElement>) {
    const st = useEditor.getState();
    if (st.wireDraft) {
      st.setWireDraft({ ...st.wireDraft, cursor: snapPoint(worldPoint(e)) });
    }
    if (!gesture && !st.wireDraft) {
      // Contextual help after a short hover (SPEC §7.4).
      const compId = closestData(e.target, 'data-component-id');
      if (!compId) {
        if (hover) setHover(null);
      } else if (hover?.compId !== compId) {
        setHover({ compId, at: localPoint(e), shown: false });
      }
    }
    if (!gesture) return;
    if (gesture.kind === 'pan') {
      st.setView({
        ...view,
        x: gesture.startView.x + e.clientX - gesture.startClient[0],
        y: gesture.startView.y + e.clientY - gesture.startClient[1],
      });
    } else if (gesture.kind === 'drag') {
      const [wx, wy] = worldPoint(e);
      const dx = snap(wx - gesture.startWorld[0]);
      const dy = snap(wy - gesture.startWorld[1]);
      const [ax, ay] = gesture.applied;
      if (dx !== ax || dy !== ay) {
        st.apply((p) => moveComponents(p, gesture.ids, dx - ax, dy - ay), false);
        setGesture({ ...gesture, applied: [dx, dy] });
      }
    } else if (gesture.kind === 'bend') {
      const pt = worldPoint(e);
      st.apply((p) => moveBendPoint(p, gesture.wireId, gesture.index, pt), false);
    } else if (gesture.kind === 'marquee') {
      setGesture({ ...gesture, current: worldPoint(e) });
    }
  }

  function onPointerUp() {
    const st = useEditor.getState();
    if (gesture?.kind === 'press') {
      useSim.getState().setInput(gesture.compId, { [gesture.side]: false });
    }
    if (gesture?.kind === 'drag' || gesture?.kind === 'bend') st.endGesture();
    if (gesture?.kind === 'marquee') {
      const x1 = Math.min(gesture.start[0], gesture.current[0]);
      const x2 = Math.max(gesture.start[0], gesture.current[0]);
      const y1 = Math.min(gesture.start[1], gesture.current[1]);
      const y2 = Math.max(gesture.start[1], gesture.current[1]);
      if (x2 - x1 > 2 || y2 - y1 > 2) {
        const inside = st.project.components
          .filter((c) => {
            const b = componentBox(c);
            return b.x1 >= x1 && b.x2 <= x2 && b.y1 >= y1 && b.y2 <= y2;
          })
          .map((c) => c.id);
        const comps = gesture.additive
          ? [...new Set([...st.selection.components, ...inside])]
          : inside;
        const insideSet = new Set(comps);
        const wires = st.project.connections
          .filter((w) => insideSet.has(w.from[0]) && insideSet.has(w.to[0]))
          .map((w) => w.id);
        st.select({ components: comps, connections: wires });
      }
    }
    setGesture(null);
  }

  function onDoubleClick(e: React.MouseEvent<SVGSVGElement>) {
    const st = useEditor.getState();
    if (st.mode !== 'edit' || st.wireDraft) return;
    const bend = closestData(e.target, 'data-bend');
    const wireId = closestData(e.target, 'data-connection-id');
    if (bend) {
      const [wid, idx] = bend.split('|');
      st.apply((p) => {
        materializeWire(p, wid!);
        removeBendPoint(p, wid!, Number(idx));
      });
    } else if (wireId) {
      const pt = worldPoint(e);
      st.apply((p) => insertBendPoint(p, wireId, pt));
    }
  }

  function onWheel(e: WheelEvent<SVGSVGElement>) {
    zoomBy(e.deltaY < 0 ? 1.15 : 1 / 1.15, localPoint(e));
  }

  function onDrop(e: React.DragEvent<SVGSVGElement>) {
    const type = e.dataTransfer.getData(DND_TYPE);
    if (!type) return;
    e.preventDefault();
    addAt(type, worldPoint(e));
  }

  // Visible world rectangle, for the grid background.
  const wx = -view.x / view.zoom;
  const wy = -view.y / view.zoom;
  const ww = viewport.width / view.zoom;
  const wh = viewport.height / view.zoom;

  const draftPoly = useMemo(() => {
    if (!wireDraft) return null;
    const start = (() => {
      const comp = project.components.find((c) => c.id === wireDraft.from[0]);
      const port =
        comp && getComponentDef(comp.type)?.ports.find((p) => p.id === wireDraft.from[1]);
      return comp && port ? portPosition(comp, port) : null;
    })();
    return start ? routeWire(start, wireDraft.points, wireDraft.cursor) : null;
  }, [wireDraft, project.components]);

  const cursorClass =
    gesture?.kind === 'pan' || spaceDown
      ? styles.panning
      : wireDraft
        ? styles.wiring
        : mode === 'sim'
          ? styles.locked
          : '';

  const supplyBar = project.simulation.supplyPressureBar;
  const gaugeReadout = (c: ComponentInstance) => {
    if (!sim || c.type !== 'pn.gauge') return undefined;
    const bar = sim.portState(c.id, '1') === 'PRESSURE' ? supplyBar : 0;
    return `${bar.toLocaleString('eu')} bar`;
  };

  const hoverDef =
    hover?.shown && !gesture
      ? getComponentDef(project.components.find((c) => c.id === hover.compId)?.type ?? '')
      : undefined;
  const pinnedDef = helpFor
    ? getComponentDef(project.components.find((c) => c.id === helpFor)?.type ?? '')
    : undefined;

  return (
    <>
      <svg
        ref={svgRef}
        onPointerLeave={() => setHover(null)}
        className={`${styles.canvas} ${cursorClass}`}
        data-testid="canvas"
        data-mode={mode}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onDoubleClick={onDoubleClick}
        onWheel={onWheel}
        onDragOver={(e) => {
          if (mode === 'edit') e.preventDefault();
        }}
        onDrop={onDrop}
        onContextMenu={(e) => e.preventDefault()}
        role="application"
        aria-label={t('editor.canvas')}
      >
        <defs>
          <pattern id="grid-minor" width={GRID} height={GRID} patternUnits="userSpaceOnUse">
            <circle cx={0} cy={0} r={0.6} className={styles.gridDot} />
          </pattern>
          <pattern id="grid-major" width={GRID * 5} height={GRID * 5} patternUnits="userSpaceOnUse">
            <rect width={GRID * 5} height={GRID * 5} fill="url(#grid-minor)" />
            <path d={`M ${GRID * 5} 0 H 0 V ${GRID * 5}`} className={styles.gridLine} />
          </pattern>
        </defs>
        <g transform={`translate(${view.x} ${view.y}) scale(${view.zoom})`}>
          <rect x={wx} y={wy} width={ww} height={wh} fill="url(#grid-major)" />

          {project.connections.map((w) => {
            const poly = polylines.get(w.id);
            if (!poly) return null;
            const pts = toPoints(poly);
            const state = sim?.portState(w.from[0], w.from[1]);
            const stateCls = state ? WIRE_STATE_CLASS[state] : '';
            const pilotCls = pilotWires.has(w.id) ? styles.wirePilot : '';
            return (
              <g key={w.id} data-connection-id={w.id} data-state={state}>
                <polyline points={pts} className={styles.wireHit} />
                <polyline
                  points={pts}
                  className={`${styles.wire} ${stateCls} ${pilotCls} ${selectedWires.has(w.id) ? styles.wireSelected : ''}`}
                />
              </g>
            );
          })}

          {project.components.map((c) => (
            <ComponentView
              key={c.id}
              comp={c}
              selected={selectedComps.has(c.id)}
              mode={mode}
              simState={sim?.hasComponent(c.id) ? sim.componentState(c.id) : undefined}
              clickable={sim !== null && clickTarget(c.type) !== undefined}
              readout={gaugeReadout(c)}
            />
          ))}

          {highlightBox && (
            <rect
              data-highlight={highlightId}
              x={highlightBox.x1 - 8}
              y={highlightBox.y1 - 8}
              width={highlightBox.x2 - highlightBox.x1 + 16}
              height={highlightBox.y2 - highlightBox.y1 + 16}
              rx={8}
              className={styles.highlight}
            />
          )}

          {limitMarks.map((m) => {
            const on = sim?.isMechanicallyActuated(m.valveId) === true;
            return (
              <g key={m.valveId} data-limit-mark={m.valveId} data-on={on}>
                <line
                  x1={m.base[0]}
                  y1={m.base[1]}
                  x2={m.tip[0]}
                  y2={m.tip[1]}
                  className={on ? styles.limitMarkOn : styles.limitMark}
                />
                <text
                  x={m.text[0]}
                  y={m.text[1]}
                  className={`${styles.limitLabel} ${on ? styles.limitLabelOn : ''}`}
                >
                  {m.label}
                </text>
              </g>
            );
          })}

          {mode === 'edit' &&
            project.components.flatMap((c) => {
              const def = getComponentDef(c.type);
              if (!def || def.libraryHidden) return [];
              return def.ports.map((p) => {
                const [x, y] = portPosition(c, p);
                const key = `${c.id}|${p.id}`;
                return (
                  <circle
                    key={key}
                    data-port={key}
                    cx={x}
                    cy={y}
                    r={3}
                    className={`${styles.port} ${connectedPorts.has(key) ? styles.portConnected : ''}`}
                  />
                );
              });
            })}

          {mode === 'edit' &&
            selection.connections.length === 1 &&
            (() => {
              const id = selection.connections[0]!;
              const poly = polylines.get(id);
              if (!poly) return null;
              return poly
                .slice(1, -1)
                .map(([x, y], i) => (
                  <rect
                    key={`${id}-${i}`}
                    data-bend={`${id}|${i}`}
                    x={x - 3.5}
                    y={y - 3.5}
                    width={7}
                    height={7}
                    className={styles.bendHandle}
                  />
                ));
            })()}

          {draftPoly && <polyline points={toPoints(draftPoly)} className={styles.wireDraft} />}

          {gesture?.kind === 'marquee' && (
            <rect
              x={Math.min(gesture.start[0], gesture.current[0])}
              y={Math.min(gesture.start[1], gesture.current[1])}
              width={Math.abs(gesture.current[0] - gesture.start[0])}
              height={Math.abs(gesture.current[1] - gesture.start[1])}
              className={styles.marquee}
            />
          )}
        </g>
      </svg>
      {hoverDef && hover && !pinnedDef && (
        <HelpCard
          def={hoverDef}
          style={{
            left: Math.min(hover.at[0] + 16, viewport.width - 300),
            top: Math.min(hover.at[1] + 16, viewport.height - 160),
            pointerEvents: 'none',
          }}
        />
      )}
      {pinnedDef && (
        <HelpCard
          def={pinnedDef}
          style={{ right: 12, top: 12 }}
          onClose={() => useEditor.getState().setHelpFor(null)}
          onTheory={(id) => useLearning.getState().openDrawer(id)}
        />
      )}
    </>
  );
}
