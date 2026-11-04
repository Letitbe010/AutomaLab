import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { defaultParams, type ComponentDef } from '../../core/componentDef';
import { portPosition, svgTransform } from '../../core/geometry';
import type { Rotation } from '../../core/types';
import { COMPONENT_DEFS } from '../../components/registry';
import { t } from '../../i18n';
import styles from './SymbolGallery.module.css';

const PAD = 14;

/** SVG that sizes its viewBox to its content (falls back to a fixed box where getBBox is missing). */
function FitSvg({ children, label }: { children: ReactNode; label: string }) {
  const ref = useRef<SVGGElement>(null);
  const [box, setBox] = useState('-80 -50 280 120');
  useLayoutEffect(() => {
    const g = ref.current;
    if (!g || typeof g.getBBox !== 'function') return;
    const b = g.getBBox();
    setBox(`${b.x - PAD} ${b.y - PAD} ${b.width + 2 * PAD} ${b.height + 2 * PAD}`);
  }, []);
  const [, , w, h] = box.split(' ').map(Number);
  return (
    <svg viewBox={box} width={w} height={h} role="img" aria-label={label}>
      <g ref={ref}>{children}</g>
    </svg>
  );
}

function PlacedSymbol({
  def,
  state,
  rot = 0,
  mirror = false,
  showPorts = true,
}: {
  def: ComponentDef<unknown>;
  state: unknown;
  rot?: Rotation;
  mirror?: boolean;
  showPorts?: boolean;
}) {
  const Symbol = def.symbol;
  const params = defaultParams(def);
  const placement = { x: 0, y: 0, rot, mirror };
  return (
    <>
      <g transform={svgTransform(placement)}>
        <Symbol state={state} params={params} />
      </g>
      {/* Port markers use the core geometry, so they also check portPosition() visually. */}
      {showPorts &&
        def.ports.map((p) => {
          const [x, y] = portPosition(placement, p);
          return (
            <g key={p.id} data-port={p.id}>
              <circle
                cx={x}
                cy={y}
                r={3}
                fill="var(--panel)"
                stroke="var(--port)"
                strokeWidth={1.5}
              />
              <text x={x + 5} y={y - 4} className={styles.portLabel}>
                {p.id}
              </text>
            </g>
          );
        })}
    </>
  );
}

function GalleryCard({ def }: { def: ComponentDef<unknown> }) {
  const params = defaultParams(def);
  const states = def.previewStates ?? [{ nameKey: '', state: def.initState(params) }];
  const name = t(def.nameKey);
  return (
    <article className={styles.card} data-testid={`symbol-${def.type}`}>
      <header className={styles.cardHead}>
        <h2>{name}</h2>
        <code>{def.type}</code>
      </header>
      {def.helpKey && <p className={styles.help}>{t(def.helpKey)}</p>}
      <div className={styles.row}>
        {states.map((s) => (
          <figure key={s.nameKey} className={styles.figure}>
            <FitSvg label={name}>
              <PlacedSymbol def={def} state={s.state} />
            </FitSvg>
            {s.nameKey && <figcaption>{t(s.nameKey)}</figcaption>}
          </figure>
        ))}
      </div>
      <div className={styles.subTitle}>{t('symbols.rotations')}</div>
      <div className={styles.row}>
        {([0, 90, 180, 270] as const).map((rot) => (
          <figure key={rot} className={styles.figureSmall}>
            <FitSvg label={`${name} ${rot}°`}>
              <PlacedSymbol def={def} state={states[0]?.state} rot={rot} />
            </FitSvg>
            <figcaption>{rot}°</figcaption>
          </figure>
        ))}
        <figure className={styles.figureSmall}>
          <FitSvg label={`${name} M`}>
            <PlacedSymbol def={def} state={states[0]?.state} mirror />
          </FitSvg>
          <figcaption>M</figcaption>
        </figure>
      </div>
      <div className={styles.ports}>
        <span>{t('symbols.ports')}:</span>
        {def.ports.map((p) => (
          <code key={p.id}>
            {p.id} ({p.x}, {p.y})
          </code>
        ))}
      </div>
    </article>
  );
}

/** Development page listing every symbol in every preview state (SPEC §9). */
export function SymbolGallery() {
  return (
    <main className={styles.page}>
      <div className={styles.titleRow}>
        <h1>{t('symbols.title')}</h1>
        <span className={styles.rule} />
        <a href="#/">{t('symbols.back')}</a>
      </div>
      <p className={styles.intro}>{t('symbols.intro')}</p>
      <div className={styles.grid}>
        {COMPONENT_DEFS.map((def) => (
          <GalleryCard key={def.type} def={def} />
        ))}
      </div>
    </main>
  );
}
