import { DRAG_KEYS } from './constants.ts';
import type { DragKey } from './types.ts';

/** Which diagram line is dragged: data-k of the event target. */
export function dragKeyOf(target: EventTarget | null): DragKey | null {
  const k = target && 'getAttribute' in target ? (target as Element).getAttribute('data-k') : null;
  return k !== null && DRAG_KEYS.includes(k) ? (k as DragKey) : null;
}

/** Pointer screen coordinates to diagram viewBox coordinates. */
export function toSvgPoint(
  svg: SVGSVGElement,
  clientX: number,
  clientY: number,
): { x: number; y: number } | null {
  const m = svg.getScreenCTM?.();
  if (!m) return null;
  const p = new DOMPoint(clientX, clientY).matrixTransform(m.inverse());
  return { x: p.x, y: p.y };
}
