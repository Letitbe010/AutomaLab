import { render } from '@testing-library/react';
import { defaultParams } from '../../src/core/componentDef';
import { COMPONENT_DEFS, getComponentDef } from '../../src/components/registry';
import { hasKey } from '../../src/i18n';

describe('component registry', () => {
  it('has unique component types', () => {
    const types = COMPONENT_DEFS.map((d) => d.type);
    expect(new Set(types).size).toBe(types.length);
  });

  it('includes the phase 1 test components', () => {
    for (const type of ['pn.source', 'pn.valve.3-2.button-spring', 'pn.cyl.single']) {
      expect(getComponentDef(type)?.type).toBe(type);
    }
  });

  describe.each(COMPONENT_DEFS.map((d) => [d.type, d] as const))('%s', (_type, def) => {
    it('has unique ports placed on integer grid points', () => {
      const ids = def.ports.map((p) => p.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const p of def.ports) {
        expect(Number.isInteger(p.x) && Number.isInteger(p.y)).toBe(true);
      }
    });

    it('has every UI text in the Basque catalogue', () => {
      const keys = [def.nameKey, ...(def.helpKey ? [def.helpKey] : [])];
      keys.push(...def.params.map((p) => p.labelKey));
      keys.push(...(def.previewStates ?? []).map((s) => s.nameKey));
      for (const k of keys) expect(hasKey(k), k).toBe(true);
    });

    it('has a label parameter and valid numeric defaults', () => {
      expect(def.params.some((p) => p.key === 'label')).toBe(true);
      for (const p of def.params) {
        if (p.type !== 'number') continue;
        if (p.min !== undefined) expect(p.default).toBeGreaterThanOrEqual(p.min);
        if (p.max !== undefined) expect(p.default).toBeLessThanOrEqual(p.max);
      }
    });

    it('renders its symbol in every preview state', () => {
      const params = defaultParams(def);
      const states = [def.initState(params), ...(def.previewStates ?? []).map((s) => s.state)];
      const Symbol = def.symbol;
      for (const state of states) {
        const { container, unmount } = render(
          <svg>
            <Symbol state={state} params={params} />
          </svg>,
        );
        expect(container.querySelector('svg')!.childElementCount).toBeGreaterThan(0);
        unmount();
      }
    });
  });
});
