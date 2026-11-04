import { useMemo } from 'react';
import { getComponentDef } from '../../components/registry';
import { svgTransform } from '../../core/geometry';
import type { Project } from '../../core/types';
import { componentBox } from '../editor/actions';
import { wirePolyline } from '../editor/model/ops';
import styles from './Templates.module.css';

const PAD = 20;

/** Static miniature of a whole circuit (SPEC §8.5 "SVG miniatura automatikoa"). */
export function CircuitPreview({
  project,
  className,
}: {
  project: Project;
  className?: string | undefined;
}) {
  const { viewBox, wires } = useMemo(() => {
    const wires = project.connections
      .map((w) => wirePolyline(project, w))
      .filter((p): p is NonNullable<typeof p> => p !== null);
    const xs: number[] = [];
    const ys: number[] = [];
    for (const c of project.components) {
      const b = componentBox(c);
      xs.push(b.x1, b.x2);
      ys.push(b.y1, b.y2);
    }
    for (const p of wires.flat()) {
      xs.push(p[0]);
      ys.push(p[1]);
    }
    if (!xs.length) return { viewBox: '0 0 100 100', wires };
    const x1 = Math.min(...xs) - PAD;
    const y1 = Math.min(...ys) - PAD;
    const w = Math.max(...xs) - x1 + PAD;
    const h = Math.max(...ys) - y1 + PAD;
    return { viewBox: `${x1} ${y1} ${w} ${h}`, wires };
  }, [project]);

  return (
    <svg viewBox={viewBox} className={`${styles.preview} ${className ?? ''}`} aria-hidden="true">
      {wires.map((poly, i) => (
        <polyline key={i} points={poly.map((p) => p.join(',')).join(' ')} className={styles.wire} />
      ))}
      {project.components.map((c) => {
        const def = getComponentDef(c.type);
        if (!def) return null;
        const Symbol = def.symbol;
        return (
          <g key={c.id} transform={svgTransform(c)}>
            <Symbol state={def.initState(c.params)} params={c.params} />
          </g>
        );
      })}
    </svg>
  );
}
