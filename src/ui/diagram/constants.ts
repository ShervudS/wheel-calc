import { INCH } from '../../core/units/constants.ts';
import type { Side } from './types.ts';

/** Diagram canvas size in viewBox units. */
export const VIEW_W = 640;
export const VIEW_H = 620;

/** Wheel center on the canvas. */
export const CX = 320;
export const CY = 300;

/** mm → viewBox scale without a tire. */
export const BASE_SCALE = 0.72;

/** Mounting face radius, mm. */
export const R_PAD = 75;

/** Radius where the spoke leaves the mounting face, mm. */
export const R_SPOKE = 93;

/** Rim flange height above the bead seat, mm. */
export const FLANGE_H = 17;

/** Drop center depth below the bead seat, mm. */
export const WELL_DEPTH = 24;

/** Half an inch: drag step for diameter and width. */
export const HALF_INCH = INCH / 2;

/** Draggable diagram lines (data-k attribute). */
export const DRAG_KEYS: readonly string[] = ['D', 'Dw', 'W', 'ET', 'X'];

/** Top (1) and bottom (−1) halves of the section. */
export const SIDES: readonly Side[] = [1, -1];

export const ACC = 'var(--acc)';
