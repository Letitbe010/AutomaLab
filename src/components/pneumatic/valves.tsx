import type { ComponentDef, PortDef } from '../../core/componentDef';
import {
  Blocked,
  FlowArrow,
  OPERATOR_WIDTH,
  OperatorSymbol,
  SymbolGroup,
  TimerPilotLine,
  ValveBox,
} from '../../symbols/primitives';
import {
  BOX,
  isPilotOperator,
  operatorYs,
  portGrid,
  VALVE_SPECS,
  type ValveSpec,
} from './valveSpecs';

export interface ValveState {
  /** Index of the box sitting on the ports (0 = leftmost). */
  position: number;
}

const POSITION_LETTERS: Record<number, string[]> = { 2: ['a', 'b'], 3: ['a', '0', 'b'] };

function slotPoint(spec: ValveSpec, portId: string): [number, number] {
  const slot = spec.ports.find((p) => p.id === portId)!;
  return [slot.x, slot.side === 'top' ? 0 : BOX];
}

/** Box contents: flow arrows and blocked ports, in box-local pixels. */
function BoxContents({ spec, index }: { spec: ValveSpec; index: number }) {
  return (
    <g transform={`translate(${index * BOX} 0)`}>
      <ValveBox x={0} y={0} />
      {spec.positions[index]!.map((path, i) => {
        if (path.kind === 'flow') {
          const [x1, y1] = slotPoint(spec, path.from);
          const [x2, y2] = slotPoint(spec, path.to);
          return <FlowArrow key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
        }
        const [x, y] = slotPoint(spec, path.port);
        return <Blocked key={i} x={x} y={y} dir={y === 0 ? 'down' : 'up'} />;
      })}
    </g>
  );
}

function sideWidth(ops: ValveSpec['left']): number {
  return Math.max(...ops.map((o) => OPERATOR_WIDTH[o]));
}

function makeValve(spec: ValveSpec): ComponentDef<ValveState> {
  const n = spec.positions.length;
  const leftYs = operatorYs(spec.left.length);
  const rightYs = operatorYs(spec.right.length);
  // Pilot ports are fixed outside the box strip at rest (two grid units by default).
  const offset = spec.pilotOffset ?? 20;
  const leftPilotX = -spec.rest * BOX - offset;
  const rightPilotX = (n - spec.rest) * BOX + offset;
  const leftPilotIdx = spec.left.findIndex(isPilotOperator);
  const rightPilotIdx = spec.right.findIndex(isPilotOperator);
  const timed = spec.left[leftPilotIdx] === 'timedPilot';

  const ports: PortDef[] = spec.ports.map((s) => {
    const [x, y] = portGrid(s);
    return {
      id: s.id,
      kind: 'fluid',
      x,
      y,
      ...(s.id === '3' || s.id === '5' ? { vent: true } : {}),
    };
  });
  if (spec.leftPilotPort && leftPilotIdx >= 0) {
    ports.push({
      id: spec.leftPilotPort,
      kind: 'fluid',
      pilot: true,
      x: leftPilotX / 10,
      y: leftYs[leftPilotIdx]! / 10,
    });
  }
  if (spec.rightPilotPort && rightPilotIdx >= 0) {
    ports.push({
      id: spec.rightPilotPort,
      kind: 'fluid',
      pilot: true,
      x: rightPilotX / 10,
      y: rightYs[rightPilotIdx]! / 10,
    });
  }

  const leftExtent = leftPilotIdx >= 0 ? offset + 2 : sideWidth(spec.left) + 2;
  const rightExtent = rightPilotIdx >= 0 ? offset + 2 : sideWidth(spec.right) + 2;
  const x0 = -spec.rest * BOX - leftExtent;
  const x1 = (n - spec.rest) * BOX + rightExtent;
  const letters = POSITION_LETTERS[n] ?? [];

  const opKey = (o: string) => `comp.op.${o}`;
  const textVars: Record<string, string> = {
    ways: `comp.valve.ways.${spec.ways.replace('/', '')}`,
    variant: spec.variantKey,
    left: opKey(spec.left[0]!),
    right: opKey(spec.right[0]!),
  };

  return {
    type: spec.type,
    domain: 'pneumatic',
    group: spec.group ?? `valves${spec.ways.replace('/', '')}`,
    nameKey: spec.nameKey ?? 'comp.valve.name',
    helpKey:
      spec.helpKey ??
      `comp.valve.help.${spec.ways.replace('/', '')}${spec.ways === '3/2' ? spec.variantKey.slice(-2) : ''}`,
    textVars,
    labelPrefix: spec.labelPrefix,
    bounds: [Math.floor(x0 / 10), -1, Math.ceil((x1 - x0) / 10) + 1, timed ? 7 : 6],
    labelAt: [Math.floor(x0 / 10), -0.5],
    ports,
    params: [
      { key: 'label', labelKey: 'param.label', type: 'string', default: '' },
      ...(spec.extraParams ?? []),
      // Solenoid coils are linked to the electric circuit by name (Y1, Y2...), SPEC §4.
      ...(spec.left[0] === 'solenoid'
        ? [{ key: 'coilLeft', labelKey: 'param.coilLeft', type: 'string', default: 'Y1' } as const]
        : []),
      ...(spec.right[0] === 'solenoid'
        ? [
            {
              key: 'coilRight',
              labelKey: 'param.coilRight',
              type: 'string',
              default: 'Y2',
            } as const,
          ]
        : []),
    ],
    initState: () => ({ position: spec.rest }),
    previewStates: spec.positions.map((_, i) => ({
      nameKey: i === spec.rest ? 'comp.valve.posRest' : 'comp.valve.pos',
      vars: { letter: letters[i] ?? String(i) },
      state: { position: i },
    })),
    symbol: ({ state, params }) => {
      const pos = Math.min(n - 1, Math.max(0, state.position));
      const shift = -pos * BOX;
      const leftEdge = shift;
      const rightEdge = shift + n * BOX;
      return (
        <SymbolGroup>
          {spec.ports.map((s) => {
            const x = s.x;
            return s.side === 'top' ? (
              <line key={s.id} x1={x} y1={-10} x2={x} y2={0} />
            ) : (
              <line key={s.id} x1={x} y1={BOX} x2={x} y2={BOX + 10} />
            );
          })}
          {/* Pilot lines stretch from the fixed port to the moving operator. */}
          {timed && <TimerPilotLine x0={leftPilotX} x1={leftEdge - 10} y={leftYs[leftPilotIdx]!} />}
          {leftPilotIdx >= 0 && !timed && (
            <line
              x1={leftPilotX}
              y1={leftYs[leftPilotIdx]}
              x2={leftEdge - 10}
              y2={leftYs[leftPilotIdx]}
              strokeDasharray="4 3"
            />
          )}
          {rightPilotIdx >= 0 && (
            <line
              x1={rightPilotX}
              y1={rightYs[rightPilotIdx]}
              x2={rightEdge + 10}
              y2={rightYs[rightPilotIdx]}
              strokeDasharray="4 3"
            />
          )}
          <g transform={`translate(${shift} 0)`}>
            {spec.positions.map((_, i) => (
              <BoxContents key={i} spec={spec} index={i} />
            ))}
            {spec.left.map((op, i) => (
              <g key={`l${i}`} transform={`translate(0 ${leftYs[i]})`}>
                <OperatorSymbol kind={op} />
              </g>
            ))}
            {spec.right.map((op, i) => (
              <g key={`r${i}`} transform={`translate(${n * BOX} ${rightYs[i]}) scale(-1 1)`}>
                <OperatorSymbol kind={op} />
              </g>
            ))}
            {spec.left[0] === 'solenoid' && typeof params.coilLeft === 'string' && (
              <CoilName x={-14} text={params.coilLeft} anchor="end" />
            )}
            {spec.right[0] === 'solenoid' && typeof params.coilRight === 'string' && (
              <CoilName x={n * BOX + 14} text={params.coilRight} anchor="start" />
            )}
          </g>
        </SymbolGroup>
      );
    },
  };
}

/** Name of the solenoid coil (Y1...) that drives an operator (SPEC §4 tags). */
function CoilName({ x, text, anchor }: { x: number; text: string; anchor: 'start' | 'end' }) {
  return (
    <text
      x={x}
      y={-3}
      fill="var(--sym-stroke)"
      stroke="none"
      fontSize={8}
      fontFamily="var(--mono)"
      textAnchor={anchor}
    >
      {text}
    </text>
  );
}

export const VALVE_DEFS: ComponentDef<ValveState>[] = VALVE_SPECS.map(makeValve);
