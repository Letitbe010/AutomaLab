/**
 * Minimal front-matter parser for the theory sheets (SPEC §8.3). Supports the
 * controlled YAML subset used in this repository:
 *   key: value
 *   key: [a, b, "quoted, text", 'single']   (may span several lines)
 *   key:                                      (one level of nested keys)
 *     child: value | [list]
 */
export type FrontValue = string | string[] | Record<string, string | string[]>;

const unquote = (s: string) => {
  const v = s.trim();
  return (v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))
    ? v.slice(1, -1)
    : v;
};

function parseScalar(raw: string): string | string[] {
  const v = raw.trim();
  if (!(v.startsWith('[') && v.endsWith(']'))) return unquote(v);
  const inner = v.slice(1, -1).trim();
  if (inner === '') return [];
  const items: string[] = [];
  const re = /\s*("[^"]*"|'[^']*'|[^,]+)\s*(?:,|$)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(inner)) && m[0] !== '') {
    const item = unquote(m[1]!);
    if (item !== '') items.push(item);
  }
  return items;
}

/** Joins lines of a flow list that continues until its closing bracket. */
function logicalLines(block: string): string[] {
  const out: string[] = [];
  let pending: string | null = null;
  for (const line of block.split('\n')) {
    if (pending !== null) {
      pending += ' ' + line.trim();
      if (line.trim().endsWith(']')) {
        out.push(pending);
        pending = null;
      }
      continue;
    }
    const opensList = /:\s*\[/.test(line) || /^\s*\[/.test(line);
    if (opensList && !line.trim().endsWith(']')) pending = line;
    else out.push(line);
  }
  if (pending !== null) out.push(pending);
  // A list starting on the line after "key:" belongs to that key.
  const merged: string[] = [];
  for (const line of out) {
    if (/^\s*\[/.test(line) && merged.length && /:\s*$/.test(merged[merged.length - 1]!)) {
      merged[merged.length - 1] += ' ' + line.trim();
    } else {
      merged.push(line);
    }
  }
  return merged;
}

export function parseFrontmatter(text: string): {
  data: Record<string, FrontValue>;
  body: string;
} {
  const normalized = text.replace(/\r\n/g, '\n');
  const m = /^---\n([\s\S]*?)\n---\n?/.exec(normalized);
  if (!m) return { data: {}, body: normalized };
  const data: Record<string, FrontValue> = {};
  let parent: Record<string, string | string[]> | null = null;
  for (const line of logicalLines(m[1]!)) {
    if (line.trim() === '' || line.trim().startsWith('#')) continue;
    const nested = /^\s+([\w-]+):\s*(.*)$/.exec(line);
    if (nested && parent) {
      parent[nested[1]!] = parseScalar(nested[2]!);
      continue;
    }
    const top = /^([\w-]+):\s*(.*)$/.exec(line);
    if (!top) throw new Error(`Invalid front-matter line: ${line}`);
    if (top[2]!.trim() === '') {
      parent = {};
      data[top[1]!] = parent;
    } else {
      parent = null;
      data[top[1]!] = parseScalar(top[2]!);
    }
  }
  return { data, body: normalized.slice(m[0].length) };
}
