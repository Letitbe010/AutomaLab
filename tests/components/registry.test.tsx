import { render } from '@testing-library/react';
import { defaultParams } from '../../src/core/componentDef';
import { COMPONENT_DEFS, getComponentDef } from '../../src/components/registry';
import { hasKey } from '../../src/i18n';
import { componentHelp, componentName, GROUP_ORDER } from '../../src/components/text';
import { VALVE_SPECS } from '../../src/components/pneumatic/valveSpecs';

describe('component registry', () => {
  it('has unique component types', () => {
    const types = COMPONENT_DEFS.map((d) => d.type);
    expect(new Set(types).size).toBe(types.length);
  });

  it('includes the P1 pneumatic parts with the type ids used by the SPEC', () => {
    const required = [
      'pn.source',
      'pn.exhaust',
      'pn.cyl.single',
      'pn.cyl.double',
      'pn.valve.3-2.button-spring',
      'pn.valve.5-2.pilot',
      'pn.valve.5-2.sol-spring',
      'pn.valve.5-3c.sol',
      'pn.valve.5-3e.pilot',
      'pn.valve.5-3p.pilot',
      'pn.valve.check',
      'pn.valve.flow-oneway',
      'pn.valve.or',
      'pn.valve.and',
      'pn.gauge',
    ];
    for (const type of required) expect(getComponentDef(type)?.type, type).toBe(type);
  });

  it('gives every visible component a unique, fully resolved name', () => {
    const names = COMPONENT_DEFS.filter((d) => !d.libraryHidden).map(componentName);
    expect(new Set(names).size).toBe(names.length);
    for (const n of names) expect(n).not.toMatch(/[{}]/);
  });

  describe.each(VALVE_SPECS.map((s) => [s.type, s] as const))('valve spec %s', (_t, spec) => {
    it('uses every port in every switching position', () => {
      const ids = spec.ports.map((p) => p.id).sort();
      for (const position of spec.positions) {
        const used = new Set(
          position.flatMap((p) => (p.kind === 'flow' ? [p.from, p.to] : [p.port])),
        );
        expect([...used].sort()).toEqual(ids);
      }
    });
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
      keys.push(...Object.values(def.textVars ?? {}), `group.${def.group}`);
      for (const k of keys) expect(hasKey(k), k).toBe(true);
      expect(componentHelp(def) ?? '').not.toMatch(/[{}]/);
    });

    it('belongs to a known library group', () => {
      expect(GROUP_ORDER as readonly string[]).toContain(def.group);
    });

    it('has a label parameter and valid numeric defaults', () => {
      if (def.labelPrefix !== '') expect(def.params.some((p) => p.key === 'label')).toBe(true);
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
