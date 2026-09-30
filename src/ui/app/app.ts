import {
  canRedo,
  canUndo,
  createHistory,
  record,
  redo as historyRedo,
  undo as historyUndo,
} from '../../core/history/history.ts';
import type { History } from '../../core/history/types.ts';
import type { WheelState } from '../../core/types/wheelState.ts';
import { fromQuery } from '../../core/url/urlState.ts';
import { sameState } from '../../core/wheel/compare.ts';
import { DEFAULT_STATE } from '../../core/wheel/constants.ts';
import { constrain } from '../../core/wheel/constrain.ts';
import { applyPreset as withPreset } from '../../data/presets.ts';
import { DEFAULT_LANG } from '../../i18n/constants.ts';
import { RUNTIME_SCRIPT_ID } from '../../i18n/constants.ts';
import { createTranslator } from '../../i18n/translate.ts';
import type { Lang } from '../../i18n/types.ts';
import { isLang, parseRuntimeMessages } from '../../i18n/utils.ts';
import { svgAriaLabel } from '../a11y/a11y.ts';
import { diagramScale } from '../diagram/geometry.ts';
import { bindDiagram } from '../diagram/interactions.ts';
import { renderWheel } from '../diagram/render.ts';
import type { SvgLayers } from '../diagram/types.ts';
import { createForm } from '../form/form.ts';
import type { FieldId } from '../form/types.ts';
import { bindKeyboard } from '../keyboard/keyboard.ts';
import { createShare } from '../share/share.ts';
import { initTheme } from '../theme/theme.ts';
import type { Controller, UpdateOptions } from '../types/controller.ts';
import type { HotKey } from '../types/hotKey.ts';
import { byId, qs } from '../utils/dom.ts';
import { COMMIT_DELAY, SCALE_ANIM_MS } from './constants.ts';
import type { InitOptions, Win } from './types.ts';

export function initApp(doc: Document, win: Win, opts: InitOptions = {}): Controller {
  const htmlLang = doc.documentElement.lang;
  const lang: Lang = isLang(htmlLang) ? htmlLang : DEFAULT_LANG;
  // UI texts live in the page: dictionaries never reach the JS bundle.
  const t = createTranslator(parseRuntimeMessages(byId(doc, RUNTIME_SCRIPT_ID).textContent ?? ''));

  const loaded = fromQuery(win.location.search);
  let state = loaded.state;
  let unit = loaded.unit;
  let { xMax } = constrain(state);
  let xLimited = false;
  let hist: History<WheelState> = createHistory(state);
  let hot: HotKey | null = null;
  let commitTimer: ReturnType<typeof setTimeout> | undefined;

  const svg = byId<SVGSVGElement>(doc, 's');
  const layerEls: Record<keyof SvgLayers, Element> = {
    base: qs(svg, '[data-layer="base"]'),
    hits: qs(svg, '[data-layer="hits"]'),
    overlay: qs(svg, '[data-layer="overlay"]'),
  };
  const painted: SvgLayers = { base: '', hits: '', overlay: '' };
  const undoBtn = byId<HTMLButtonElement>(doc, 'ub');
  const redoBtn = byId<HTMLButtonElement>(doc, 'rb');
  const resetBtn = byId<HTMLButtonElement>(doc, 'xb');

  const reducedMotion = win.matchMedia?.('(prefers-reduced-motion: reduce)');
  let scale = diagramScale(state);
  let scaleTarget = scale;
  let raf = 0;

  function paintSvg(): void {
    const layers = renderWheel(state, { unit, hot, scale }, t);
    // Targeted update: a layer's nodes are recreated only when its markup changed.
    for (const k of ['base', 'hits', 'overlay'] as const) {
      if (layers[k] !== painted[k]) {
        layerEls[k].innerHTML = layers[k];
        painted[k] = layers[k];
      }
    }
  }

  function syncScale(): void {
    const target = diagramScale(state);
    if (reducedMotion?.matches || typeof win.requestAnimationFrame !== 'function') {
      scale = scaleTarget = target;
      return;
    }
    if (Math.abs(target - scaleTarget) <= 1e-4) return;
    scaleTarget = target;
    win.cancelAnimationFrame(raf);
    const from = scale;
    let t0: number | null = null;
    const step = (ts: number) => {
      t0 ??= ts;
      const p = Math.min(1, (ts - t0) / SCALE_ANIM_MS);
      const eased = 1 - (1 - p) ** 3;
      scale = from + (scaleTarget - from) * eased;
      paintSvg();
      if (p < 1) raf = win.requestAnimationFrame(step);
    };
    raf = win.requestAnimationFrame(step);
  }

  function updateButtons(): void {
    const pending = !sameState(state, hist.present);
    undoBtn.disabled = !canUndo(hist) && !pending;
    redoBtn.disabled = !canRedo(hist) || pending;
    resetBtn.disabled = sameState(state, DEFAULT_STATE);
  }

  function render(skip: FieldId | null = null): void {
    form.fill(skip);
    syncScale();
    paintSvg();
    svg.setAttribute('aria-label', svgAriaLabel(state, unit, t));
    share.sync();
    updateButtons();
  }

  function commit(): void {
    clearTimeout(commitTimer);
    hist = record(hist, state, sameState);
    updateButtons();
  }

  function later(): void {
    clearTimeout(commitTimer);
    commitTimer = setTimeout(commit, COMMIT_DELAY);
    updateButtons();
  }

  function update(patch: Partial<WheelState>, how: UpdateOptions = {}): void {
    const r = constrain({ ...state, ...patch });
    state = r.state;
    xMax = r.xMax;
    xLimited = r.xLimited;
    render(how.skip ?? null);
    if (how.commit === 'now') commit();
    else if (how.commit === 'later') later();
  }

  const ctrl: Controller = {
    lang,
    t,
    get state() {
      return state;
    },
    get unit() {
      return unit;
    },
    get xLimited() {
      return xLimited;
    },
    get scale() {
      return scale;
    },
    update,
    refresh: () => render(),
    setUnit(u) {
      unit = u;
      render();
    },
    setHot(k) {
      if (hot === k) return;
      hot = k;
      paintSvg();
    },
    commit,
    later,
    undo() {
      commit();
      if (!canUndo(hist)) return;
      hist = historyUndo(hist);
      update(hist.present);
    },
    redo() {
      commit();
      if (!canRedo(hist)) return;
      hist = historyRedo(hist);
      update(hist.present);
    },
    reset() {
      commit();
      update(DEFAULT_STATE, { commit: 'now' });
    },
    applyPreset(p) {
      commit();
      update(withPreset(state, p), { commit: 'now' });
    },
  };

  const form = createForm(doc, ctrl, () => xMax);
  const share = createShare(doc, win, ctrl);
  undoBtn.addEventListener('click', ctrl.undo);
  redoBtn.addEventListener('click', ctrl.redo);
  resetBtn.addEventListener('click', ctrl.reset);
  bindDiagram(svg, ctrl);
  bindKeyboard(doc, ctrl, opts.signal);
  initTheme(doc, win, t, opts.signal);
  render();
  return ctrl;
}
