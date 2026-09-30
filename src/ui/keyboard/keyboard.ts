import { nudge } from '../../core/wheel/nudge.ts';
import type { EditableParam } from '../../core/wheel/types.ts';
import { kbAnnouncement } from '../a11y/a11y.ts';
import type { Controller } from '../types/controller.ts';
import { byId } from '../utils/dom.ts';
import { KB_PARAMS } from './constants.ts';
import { arrowDir, historyAction } from './utils.ts';

export function bindKeyboard(doc: Document, ctrl: Controller, signal?: AbortSignal): void {
  const out = byId(doc, 'kbs');

  doc.addEventListener(
    'keydown',
    (e) => {
      const action = historyAction(e);
      if (!action) return;
      e.preventDefault();
      ctrl[action]();
    },
    signal ? { signal } : {},
  );

  for (const btn of doc.querySelectorAll<HTMLButtonElement>('.kb-controls__btn[data-k]')) {
    const k = btn.dataset['k'];
    if (k === undefined || !KB_PARAMS.includes(k)) continue;
    const key = k as EditableParam;
    const say = () => {
      out.textContent = kbAnnouncement(key, ctrl.state, ctrl.unit, ctrl.xLimited, ctrl.t);
    };
    btn.addEventListener('focus', () => {
      ctrl.setHot(key);
      say();
    });
    btn.addEventListener('blur', () => ctrl.setHot(null));
    btn.addEventListener('keydown', (e) => {
      const dir = arrowDir(e.key);
      if (!dir) return;
      e.preventDefault();
      ctrl.update(nudge(ctrl.state, key, dir, e.shiftKey), { commit: 'later' });
      say();
    });
  }
}
