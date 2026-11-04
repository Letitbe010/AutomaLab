/**
 * Markdown rendering for theory sheets and descriptions (SPEC §8.3):
 * markdown-it with KaTeX formulas (bundled, works offline). Extensions:
 *   ![[symbol:pn.cyl.double]]  → placeholder, replaced by the library symbol in the UI
 *   [text](theory:pn-presioa)  → link to another theory sheet (handled by the viewer)
 */
import katexPlugin from '@vscode/markdown-it-katex';
import MarkdownIt from 'markdown-it';

const SYMBOL_RE = /!\[\[symbol:([\w.-]+)\]\]/g;

// The plugin is CommonJS: in the browser bundle the import is the module object
// ({ default: fn }), under Node/Vitest it is the function itself.
const katex = ((katexPlugin as unknown as { default?: typeof katexPlugin }).default ??
  katexPlugin) as typeof katexPlugin;

function create(throwOnError: boolean) {
  const md = new MarkdownIt({ html: false, linkify: false, typographer: false });
  md.use(katex, { throwOnError });
  return md;
}

const lenient = create(false);
let strict: ReturnType<typeof create> | null = null;

/** Symbol types embedded in a Markdown text. */
export function embeddedSymbols(text: string): string[] {
  return [...text.matchAll(SYMBOL_RE)].map((m) => m[1]!);
}

/** Targets of [text](theory:id) links. */
export function theoryLinks(text: string): string[] {
  return [...text.matchAll(/\]\(theory:([\w-]+)\)/g)].map((m) => m[1]!);
}

/**
 * Renders Markdown to HTML. Raw HTML in the source is disabled; symbol
 * placeholders are added by replacing the embed syntax with a marker token.
 * `strict` throws on invalid formulas (used by content tests).
 */
export function renderMarkdown(text: string, options: { strict?: boolean } = {}): string {
  const md = options.strict ? (strict ??= create(true)) : lenient;
  const marker = (i: number) => `AUTOMALABSYMBOL${i}X`;
  const types: string[] = [];
  const source = text.replace(SYMBOL_RE, (_m, type: string) => {
    types.push(type);
    return marker(types.length - 1);
  });
  let html = md.render(source);
  types.forEach((type, i) => {
    html = html.replace(
      marker(i),
      `<span class="md-symbol" data-symbol="${type.replace(/[^\w.-]/g, '')}"></span>`,
    );
  });
  return html;
}
