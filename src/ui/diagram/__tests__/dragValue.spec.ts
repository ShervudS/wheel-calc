// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { inches } from '../../../core/units/utils.ts';
import { DEFAULT_STATE } from '../../../core/wheel/constants.ts';
import { CX, CY } from '../constants.ts';
import { dragValue, projection } from '../geometry.ts';

const SC = 0.72;

const { gx, gy } = projection(SC);

describe('dragValue', () => {
  it('bead seats: diameter in half-inch steps', () => {
    expect(dragValue('D', { x: 0, y: gy(inches(18) / 2, 1) }, DEFAULT_STATE, SC)).toEqual({
      D: 457.2,
    });
    // The bottom half yields the same diameter.
    expect(dragValue('D', { x: 0, y: gy(inches(18) / 2, -1) }, DEFAULT_STATE, SC).D).toBeCloseTo(
      457.2,
      10,
    );
    expect(dragValue('D', { x: 0, y: gy(inches(18.2) / 2, 1) }, DEFAULT_STATE, SC).D).toBeCloseTo(
      457.2,
      10,
    );
  });

  it('drop center: diameter including the depth', () => {
    const y = gy(inches(17) / 2 - 24, 1);
    expect(dragValue('Dw', { x: 0, y }, DEFAULT_STATE, SC).D).toBeCloseTo(431.8, 10);
  });

  it('flange: width, symmetric around the center', () => {
    const w = inches(9);
    expect(dragValue('W', { x: gx(w / 2), y: CY }, DEFAULT_STATE, SC).W).toBeCloseTo(w, 10);
    expect(dragValue('W', { x: gx(-w / 2), y: CY }, DEFAULT_STATE, SC).W).toBeCloseTo(w, 10);
  });

  it('mounting face: offset in whole mm', () => {
    expect(dragValue('ET', { x: gx(20.4), y: CY }, DEFAULT_STATE, SC)).toEqual({ ET: 20 });
    expect(dragValue('ET', { x: CX - 10 * SC, y: CY }, DEFAULT_STATE, SC)).toEqual({ ET: -10 });
  });

  it('spokes: X from the mounting face', () => {
    expect(dragValue('X', { x: gx(35 + 25), y: CY }, DEFAULT_STATE, SC)).toEqual({ X: 25 });
  });
});
