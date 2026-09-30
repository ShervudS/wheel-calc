// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { inches } from '../../../core/units/utils.ts';
import { DEFAULT_STATE } from '../../../core/wheel/constants.ts';
import { $, mount } from '../../__tests__/mount.ts';
import { CX, CY } from '../constants.ts';
import { projection } from '../geometry.ts';

const SC = 0.72;

const { gx } = projection(SC);

/** Screen equals viewBox: getScreenCTM is the identity matrix. */
function identityCtm() {
  const svg = $<SVGSVGElement>('#s');
  Object.defineProperty(svg, 'getScreenCTM', {
    value: () => new DOMMatrix(),
    configurable: true,
  });
  Object.defineProperty(svg, 'setPointerCapture', { value: () => {}, configurable: true });
  return svg;
}

const pointer = (target: Element, type: string, x = 0, y = 0) =>
  target.dispatchEvent(
    new PointerEvent(type, {
      bubbles: true,
      cancelable: true,
      clientX: x,
      clientY: y,
      pointerId: 1,
    }),
  );

describe('dragging with Pointer Events', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('hover highlights, leaving removes the highlight', () => {
    mount();
    const svg = identityCtm();
    const hit = $('[data-layer="hits"] [data-k="ET"]');
    pointer(hit, 'pointermove');
    expect($('[data-layer="overlay"]').innerHTML).toContain('Вылет ET +35');
    pointer(svg, 'pointerleave');
    expect($('[data-layer="overlay"]').innerHTML).toBe('');
  });

  it('dragging the mounting face: offset changes, release is a history step', () => {
    const app = mount();
    const svg = identityCtm();
    const hit = $('[data-layer="hits"] [data-k="ET"]');
    pointer(hit, 'pointerdown');
    pointer(svg, 'pointermove', gx(10), CY);
    expect(app.state.ET).toBe(10);
    expect($<HTMLInputElement>('#ET').value).toBe('10');
    pointer(svg, 'pointerup');
    expect($('[data-layer="overlay"]').innerHTML).toBe('');
    $('#ub').click();
    expect(app.state.ET).toBe(35);
  });

  it('dragging a flange: width clamped to limits', () => {
    const app = mount();
    const svg = identityCtm();
    pointer($('[data-layer="hits"] [data-k="W"]'), 'pointerdown');
    pointer(svg, 'pointermove', CX + 1000, CY);
    expect(app.state.W).toBe(inches(14));
    pointer(svg, 'pointercancel');
  });

  it('pointerdown off the lines starts nothing', () => {
    const app = mount();
    const svg = identityCtm();
    pointer(svg, 'pointerdown');
    pointer(svg, 'pointermove', CX, CY);
    expect(app.state).toEqual(DEFAULT_STATE);
  });
});
