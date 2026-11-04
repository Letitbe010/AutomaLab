import type { DefLookup, PortDef } from './componentDef';
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
  | 'duplicateLabel';

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
      if (!connectedPorts.has(`${c.id}\u0000${p.id}`)) {
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

  return issues;
}
