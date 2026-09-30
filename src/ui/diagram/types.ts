import type { Unit } from '../../core/units/types.ts';
import type { HotKey } from '../types/hotKey.ts';

export interface Projection {
  scale: number;
  /** Horizontal coordinate: x in mm from the rim centerline. */
  gx(x: number): number;
  /** Vertical coordinate: q is the radius in mm, sg the top (1) or bottom (−1) half. */
  gy(q: number, sg: 1 | -1): number;
}

/** What is dragged: D bead seats, Dw drop center, W flanges, ET mounting face, X spokes. */
export type DragKey = 'D' | 'Dw' | 'W' | 'ET' | 'X';

export interface RenderView {
  unit: Unit;
  hot: HotKey | null;
  scale: number;
}

/**
 * The diagram is split into layers so hover redraws only the highlight
 * and the hit areas under the pointer stay the same DOM nodes.
 */
export interface SvgLayers {
  /** Grid, tire, rim, spokes, dimensions, labels. */
  base: string;
  /** Invisible wide lines for pointer hits. */
  hits: string;
  /** Highlight, arrows and label of the parameter under the pointer. */
  overlay: string;
}

export type Pt = readonly [x: number, q: number];

export type Side = 1 | -1;
