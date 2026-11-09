import type { DefLookup, PortDef } from './componentDef';
import { exprNames, exprTimeSteps, parseExpression, resolveName } from './grafcet';
import { isValidAddress, parseOperand, walkElements } from './plc';
import type { ComponentInstance, Project } from './types';

export type Severity = 'error' | 'warning';

export type IssueCode =
  | 'duplicateId'
  | 'unknownType'
  | 'missingComponent'
  | 'missingPort'
  | 'kindMismatch'
  | 'selfConnection'
  | 'duplicateConnection'
  | 'freePort'
  | 'duplicateLabel'
  | 'limitUnbound'
  | 'limitUnknownCylinder'
  | 'ladderOperand'
  | 'ladderCoilTarget'
  | 'ladderNoPlc'
  | 'grafcetNoInitial'
  | 'grafcetDuplicateStep'
  | 'grafcetOpenTransition'
  | 'grafcetExpression'
  | 'grafcetName'
  | 'grafcetAction'
  | 'grafcetMixedAction';

export interface Issue {
  severity: Severity;
  code: IssueCode;
  /** Values for the i18n message `validation.<code>`. */
  vars: Record<string, string>;
  componentIds: string[];
  connectionIds: string[];
}

const SEVERITY: Record<IssueCode, Severity> = {
  duplicateId: 'error',
  unknownType: 'error',
  missingComponent: 'error',
  missingPort: 'error',
  kindMismatch: 'error',
  selfConnection: 'error',
  duplicateConnection: 'warning',
  freePort: 'warning',
  duplicateLabel: 'warning',
  limitUnbound: 'warning',
  limitUnknownCylinder: 'warning',
  ladderOperand: 'warning',
  ladderCoilTarget: 'warning',
  ladderNoPlc: 'warning',
  grafcetNoInitial: 'warning',
  grafcetDuplicateStep: 'warning',
  grafcetOpenTransition: 'warning',
  grafcetExpression: 'warning',
  grafcetName: 'warning',
  grafcetAction: 'warning',
  grafcetMixedAction: 'warning',
};

function issue(
  code: IssueCode,
  vars: Record<string, string>,
  componentIds: string[] = [],
  connectionIds: string[] = [],
): Issue {
  return { severity: SEVERITY[code], code, vars, componentIds, connectionIds };
}

/** Human-readable name of a component for messages: its label, or its id. */
export function displayName(c: ComponentInstance): string {
  const label = c.params.label;
  return typeof label === 'string' && label.trim() !== '' ? label : c.id;
}

/**
 * Checks a project for structural problems (SPEC §4): free ports, duplicate
 * connections, mixed domains and repeated labels. Errors block simulation;
 * warnings are informative.
 */
export function validateProject(project: Project, getDef: DefLookup): Issue[] {
  const issues: Issue[] = [];
  const byId = new Map<string, ComponentInstance>();

  for (const c of project.components) {
    if (byId.has(c.id)) issues.push(issue('duplicateId', { id: c.id }, [c.id]));
    byId.set(c.id, c);
  }
  const connIds = new Set<string>();
  for (const w of project.connections) {
    if (connIds.has(w.id)) issues.push(issue('duplicateId', { id: w.id }, [], [w.id]));
    connIds.add(w.id);
  }

  for (const c of project.components) {
    if (!getDef(c.type))
      issues.push(issue('unknownType', { component: displayName(c), type: c.type }, [c.id]));
  }

  const connectedPorts = new Set<string>();
  const seenPairs = new Map<string, string>();

  for (const w of project.connections) {
    const ends: (PortDef | undefined)[] = [];
    for (const [compId, portId] of [w.from, w.to]) {
      const comp = byId.get(compId);
      if (!comp) {
        issues.push(issue('missingComponent', { connection: w.id, component: compId }, [], [w.id]));
        ends.push(undefined);
        continue;
      }
      const def = getDef(comp.type);
      if (!def) {
        ends.push(undefined);
        continue;
      }
      const port = def.ports.find((p) => p.id === portId);
      if (!port) {
        issues.push(
          issue('missingPort', { component: displayName(comp), port: portId }, [compId], [w.id]),
        );
      } else {
        connectedPorts.add(`${compId}\u0000${portId}`);
      }
      ends.push(port);
    }

    const [a, b] = ends;
    if (a && b && (a.kind !== b.kind || a.kind !== w.kind)) {
      issues.push(issue('kindMismatch', { connection: w.id }, [w.from[0], w.to[0]], [w.id]));
    }
    if (w.from[0] === w.to[0] && w.from[1] === w.to[1]) {
      issues.push(issue('selfConnection', { connection: w.id }, [w.from[0]], [w.id]));
    }

    const key = [w.from.join('\u0000'), w.to.join('\u0000')].sort().join('\u0001');
    const first = seenPairs.get(key);
    if (first !== undefined) {
      issues.push(
        issue('duplicateConnection', { connection: w.id, other: first }, [], [first, w.id]),
      );
    } else {
      seenPairs.set(key, w.id);
    }
  }

  for (const c of project.components) {
    const def = getDef(c.type);
    if (!def) continue;
    for (const p of def.ports) {
      if (!p.vent && !p.optional && !connectedPorts.has(`${c.id}\u0000${p.id}`)) {
        issues.push(issue('freePort', { component: displayName(c), port: p.id }, [c.id]));
      }
    }
  }

  const labels = new Map<string, string[]>();
  for (const c of project.components) {
    const label = c.params.label;
    if (typeof label !== 'string' || label.trim() === '') continue;
    labels.set(label, [...(labels.get(label) ?? []), c.id]);
  }
  for (const [label, ids] of labels) {
    if (ids.length > 1) issues.push(issue('duplicateLabel', { label }, ids));
  }

  // Limit valves must name an existing cylinder (mechanical coupling by label).
  const cylinderLabels = new Set(
    project.components
      .filter((c) => getDef(c.type)?.limitMarks)
      .map((c) => c.params.label)
      .filter((l): l is string => typeof l === 'string' && l !== ''),
  );
  for (const c of project.components) {
    for (const p of getDef(c.type)?.params ?? []) {
      if (p.type !== 'cylinderRef') continue;
      const ref = typeof c.params[p.key] === 'string' ? (c.params[p.key] as string) : '';
      if (ref === '') {
        issues.push(issue('limitUnbound', { component: displayName(c) }, [c.id]));
      } else if (!cylinderLabels.has(ref)) {
        issues.push(
          issue('limitUnknownCylinder', { component: displayName(c), cylinder: ref }, [c.id]),
        );
      }
    }
  }

  issues.push(...validateLadder(project, getDef));
  issues.push(...validateGrafcet(project, getDef));
  return issues;
}

/** GRAFCET checks (SPEC §6.6). Only when it is the running program or has content. */
function validateGrafcet(project: Project, getDef: DefLookup): Issue[] {
  const out: Issue[] = [];
  const g = project.plc.grafcet;
  if (!g || (g.steps.length === 0 && g.transitions.length === 0)) return out;
  const io = project.plc.io;
  if (
    project.plc.language === 'grafcet' &&
    !project.components.some((c) => getDef(c.type)?.domain === 'plc')
  ) {
    out.push(issue('ladderNoPlc', {}));
  }
  if (!g.steps.some((s) => s.initial)) out.push(issue('grafcetNoInitial', {}));
  const numbers = new Set<number>();
  const known = new Set<number>();
  for (const s of g.steps) {
    known.add(s.number);
    if (numbers.has(s.number)) out.push(issue('grafcetDuplicateStep', { step: String(s.number) }));
    numbers.add(s.number);
  }
  const checkExpr = (text: string, where: string) => {
    const r = parseExpression(text);
    if (!r.ok) {
      out.push(issue('grafcetExpression', { where, text: text || '—' }));
      return;
    }
    for (const name of exprNames(r.expr)) {
      const res = resolveName(name, io);
      if (!res || (res.kind === 'step' && !known.has(res.number))) {
        out.push(issue('grafcetName', { where, name }));
      }
    }
    for (const n of exprTimeSteps(r.expr)) {
      if (!known.has(n)) out.push(issue('grafcetName', { where, name: `X${n}` }));
    }
  };
  const continuous = new Set<string>();
  const stored = new Set<string>();
  for (const s of g.steps) {
    const where = `X${s.number}`;
    for (const a of s.actions) {
      const r = resolveName(a.operand, io);
      if (r?.kind !== 'bit' || r.key.startsWith('I')) {
        out.push(issue('grafcetAction', { where, operand: a.operand || '—' }));
        continue;
      }
      (a.kind === 'S' || a.kind === 'R' ? stored : continuous).add(r.key);
      if (a.kind === 'C') checkExpr(a.condition, where);
    }
  }
  for (const key of continuous) {
    if (stored.has(key)) out.push(issue('grafcetMixedAction', { operand: key }));
  }
  g.transitions.forEach((t, i) => {
    const where = `T${i + 1}`;
    if (t.from.length === 0 || t.to.length === 0)
      out.push(issue('grafcetOpenTransition', { where }));
    checkExpr(t.receptivity, where);
  });
  return out;
}

/** Ladder program checks (SPEC §6.5): operands that do not exist, coils on inputs. */
function validateLadder(project: Project, getDef: DefLookup): Issue[] {
  const out: Issue[] = [];
  const rungs = project.plc.ladder;
  if (!rungs.length) return out;
  if (!project.components.some((c) => getDef(c.type)?.domain === 'plc')) {
    out.push(issue('ladderNoPlc', {}));
  }
  rungs.forEach((rung, i) => {
    const segment = String(i + 1);
    for (const e of walkElements(rung.elements)) {
      const operands =
        e.kind === 'contact' || e.kind === 'coil'
          ? [e.operand]
          : e.kind === 'counter' && e.resetOperand !== ''
            ? [e.resetOperand]
            : [];
      for (const text of operands) {
        const op = parseOperand(text);
        if (!op || !isValidAddress(op)) {
          out.push(issue('ladderOperand', { segment, operand: text || '—' }));
        } else if (e.kind === 'coil' && (op.area === 'I' || op.area === 'T' || op.area === 'C')) {
          out.push(issue('ladderCoilTarget', { segment, operand: op.key }));
        }
      }
    }
  });
  return out;
}
