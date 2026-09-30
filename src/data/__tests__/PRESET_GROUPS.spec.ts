import { describe, expect, it } from 'vitest';
import { TIRE_LIMITS } from '../../core/tire/constants.ts';
import { inches } from '../../core/units/utils.ts';
import { constrain } from '../../core/wheel/constrain.ts';
import ru from '../../i18n/ru.json' with { type: 'json' };
import { ALL_PRESETS, PRESET_GROUPS, applyPreset } from '../presets.ts';
import { DEFAULT_STATE } from '../../core/wheel/constants.ts';

describe('PRESET_GROUPS', () => {
  it('three groups, 12 sizes as in the prototype', () => {
    expect(PRESET_GROUPS.map((g) => g.items.length)).toEqual([5, 5, 2]);
    expect(ALL_PRESETS).toHaveLength(12);
  });

  it.each(ALL_PRESETS.map((p) => [`${p.d}×${p.w} ET${p.et} ${p.tw}/${p.ta}`, p] as const))(
    '%s passes constraints without clamping',
    (_, preset) => {
      const s = applyPreset({ ...DEFAULT_STATE, X: 0 }, preset);
      const r = constrain(s);
      expect(r.state).toEqual(s);
      expect(r.xLimited).toBe(false);
      expect(r.xMax).toBeGreaterThan(0);
      expect(preset.tw).toBeGreaterThanOrEqual(TIRE_LIMITS.tw[0]);
      expect(preset.ta).toBeLessThanOrEqual(TIRE_LIMITS.ta[1]);
    },
  );

  it('stretch presets are really narrower than the rim', () => {
    const stretch = PRESET_GROUPS.find((g) => g.key === 'preset.group.stretch');
    expect(stretch?.items.length).toBeGreaterThan(0);
    for (const p of stretch?.items ?? []) expect(p.tw).toBeLessThan(inches(p.w));
  });

  it('every group has a translation', () => {
    for (const g of PRESET_GROUPS) expect(ru[g.key]).toBeTruthy();
  });
});
