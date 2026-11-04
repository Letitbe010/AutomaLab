import type { ComponentDef } from '../../core/componentDef';
import { defaultParams } from '../../core/componentDef';

/** Static preview of a symbol, fitted to its bounds. */
export function Thumb({
  def,
  className,
}: {
  def: ComponentDef<unknown>;
  className?: string | undefined;
}) {
  const [bx, by, bw, bh] = def.bounds;
  const pad = 0.6;
  const Symbol = def.symbol;
  const params = defaultParams(def);
  return (
    <svg
      viewBox={`${(bx - pad) * 10} ${(by - pad) * 10} ${(bw + 2 * pad) * 10} ${(bh + 2 * pad) * 10}`}
      className={className}
      aria-hidden="true"
    >
      <Symbol state={def.initState(params)} params={params} />
    </svg>
  );
}
