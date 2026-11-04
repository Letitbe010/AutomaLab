import type { ComponentDef } from '../../core/componentDef';
import { STROKE } from '../../symbols/primitives';

/**
 * Fluid T-junction: a single port that accepts any number of connections.
 * Created by the editor when a line is connected onto another line.
 */
export const fluidJunction: ComponentDef<null> = {
  type: 'fluid.junction',
  domain: 'pneumatic',
  nameKey: 'comp.junction.name',
  labelPrefix: '',
  bounds: [-0.5, -0.5, 1, 1],
  libraryHidden: true,
  ports: [{ id: 'j', kind: 'fluid', x: 0, y: 0 }],
  params: [],
  initState: () => null,
  symbol: () => <circle cx={0} cy={0} r={3} fill={STROKE} />,
};
