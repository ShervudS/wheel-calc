import { describe, expect, it } from 'vitest';
import type { WheelState } from '../../../core/types/wheelState.ts';
import { inches } from '../../../core/units/utils.ts';
import { DEFAULT_STATE } from '../../../core/wheel/constants.ts';
import { BASE_SCALE } from '../constants.ts';
import { diagramScale } from '../geometry.ts';

const state = (patch: Partial<WheelState> = {}): WheelState => ({ ...DEFAULT_STATE, ...patch });

describe('diagram scale', () => {
  it('base without a tire', () => {
    expect(diagramScale(state())).toBe(BASE_SCALE);
  });

  it('smaller than base with a tire and shrinks as the sidewall grows', () => {
    const low = diagramScale(state({ tire: true, tw: 125, ta: 20 }));
    const high = diagramScale(state({ tire: true, tw: 305, ta: 70 }));
    expect(low).toBeLessThan(BASE_SCALE);
    expect(high).toBeLessThan(low);
  });

  it('does not depend on the rim diameter', () => {
    expect(diagramScale(state({ tire: true, D: inches(22) }))).toBe(
      diagramScale(state({ tire: true })),
    );
  });
});
