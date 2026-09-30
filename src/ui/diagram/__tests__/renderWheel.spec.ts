import { describe, expect, it } from 'vitest';
import type { WheelState } from '../../../core/types/wheelState.ts';
import { inches } from '../../../core/units/utils.ts';
import { createT } from '../../../i18n/createT.ts';
import { DEFAULT_STATE } from '../../../core/wheel/constants.ts';
import { diagramScale } from '../geometry.ts';
import { renderWheel } from '../render.ts';
import type { RenderView } from '../types.ts';

const t = createT('ru');

const state = (patch: Partial<WheelState> = {}): WheelState => ({ ...DEFAULT_STATE, ...patch });

const view = (s: WheelState, patch: Partial<RenderView> = {}): RenderView => ({
  unit: 'mm',
  hot: null,
  scale: diagramScale(s),
  ...patch,
});

const render = (s: WheelState, patch: Partial<RenderView> = {}) =>
  renderWheel(s, view(s, patch), t);

const tireCount = (svg: string) => svg.split('fill="var(--tire)"').length - 1;

describe('render snapshots', () => {
  it('no tire', () => {
    expect(render(state())).toMatchSnapshot();
  });

  it('normal tire 245/40 on 17×8', () => {
    expect(render(state({ tire: true }))).toMatchSnapshot();
  });

  it('stretched 205/40 on 17×9', () => {
    expect(render(state({ W: inches(9), ET: 22, X: 30, tire: true, tw: 205 }))).toMatchSnapshot();
  });
});

describe('render', () => {
  it('no tire path without a tire, two halves with one', () => {
    expect(tireCount(render(state()).base)).toBe(0);
    expect(tireCount(render(state({ tire: true })).base)).toBe(2);
  });

  it('normal and stretched tires have different shapes', () => {
    const normal = render(state({ tire: true })).base;
    const stretch = render(state({ W: inches(9), tire: true, tw: 205 })).base;
    // A normal tire has curved (Q) sidewalls from the flange, a stretched one straight (L) lines inward.
    expect(normal).toMatch(/d="M[\d.,]+Q/);
    expect(stretch).toMatch(/d="M[\d.,]+L/);
  });

  it('dimension labels in mm and inches', () => {
    const mm = render(state()).base;
    expect(mm).toContain('W 203 мм');
    expect(mm).toContain('B 137 мм');
    expect(mm).toContain('X 40 мм');
    expect(mm).toContain('Ø 432 мм');
    expect(mm).toContain('ET +35');
    const inch = render(state(), { unit: 'in' }).base;
    // The inch quote is escaped in SVG text; on screen it is ".
    expect(inch).toContain('W 8&quot;');
    expect(inch).toContain('Ø 17&quot;');
    expect(inch).toContain('B 5.38&quot;');
    expect(inch).toContain('X 40 мм');
  });

  it('negative offset is labelled left of the face', () => {
    const base = render(state({ ET: -20, X: 10 })).base;
    expect(base).toMatch(/text-anchor="end" style="fill:var\(--acct\)">ET -20</);
  });

  it.each([
    ['D', 'Диаметр Ø 432 мм'],
    ['W', 'Ширина 203 мм'],
    ['ET', 'Вылет ET +35'],
    ['X', 'X-фактор 40 мм'],
  ] as const)('highlight %s: arrows and label', (hot, label) => {
    const { overlay } = render(state(), { hot });
    expect(overlay).toContain(label);
    expect(overlay).toContain('fill="var(--acc)"');
  });

  it('highlight changes only the overlay layer', () => {
    const a = render(state());
    const b = render(state(), { hot: 'W' });
    expect(b.base).toBe(a.base);
    expect(b.hits).toBe(a.hits);
    expect(b.overlay).not.toBe(a.overlay);
  });

  it('dictionary text is escaped', () => {
    const evil = createT('ru');
    const tt: typeof evil = (key, params) => (key === 'svg.outboard' ? '<b>&' : evil(key, params));
    const s = state();
    expect(renderWheel(s, view(s), tt).base).toContain('&lt;b&gt;&amp;');
  });
});
