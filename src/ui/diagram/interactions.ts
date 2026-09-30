import type { Controller } from '../types/controller.ts';
import { dragValue, hotOf } from './geometry.ts';
import type { DragKey } from './types.ts';
import { dragKeyOf, toSvgPoint } from './utils.ts';

/** Dragging diagram lines with Pointer Events: mouse, pen and touch. */
export function bindDiagram(svg: SVGSVGElement, ctrl: Controller): void {
  let drag: DragKey | null = null;

  svg.addEventListener('pointerdown', (e) => {
    const k = dragKeyOf(e.target);
    if (!k) return;
    drag = k;
    ctrl.setHot(hotOf(k));
    svg.setPointerCapture?.(e.pointerId);
    e.preventDefault();
  });

  svg.addEventListener('pointermove', (e) => {
    if (!drag) {
      const k = dragKeyOf(e.target);
      ctrl.setHot(k ? hotOf(k) : null);
      return;
    }
    const p = toSvgPoint(svg, e.clientX, e.clientY);
    if (p) ctrl.update(dragValue(drag, p, ctrl.state, ctrl.scale));
  });

  svg.addEventListener('pointerleave', () => {
    if (!drag) ctrl.setHot(null);
  });

  const end = () => {
    if (!drag) return;
    drag = null;
    ctrl.setHot(null);
    ctrl.commit();
  };
  svg.addEventListener('pointerup', end);
  svg.addEventListener('pointercancel', end);
}
