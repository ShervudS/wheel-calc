import { tireWarning } from '../../core/tire/fit.ts';
import { overallDiameter, sidewall } from '../../core/tire/size.ts';
import { fromUnit, inputValue } from '../../core/units/convert.ts';
import { round } from '../../core/utils/round.ts';
import { backspacing, etFromBackspacing } from '../../core/wheel/geometry.ts';
import { type Preset, PRESET_GROUPS } from '../../data/presets.ts';
import type { Controller } from '../types/controller.ts';
import { byId } from '../utils/dom.ts';
import { localNumber, tireLenText } from '../utils/format.ts';
import { WARN_KEYS } from './constants.ts';
import type { FieldId, Form } from './types.ts';
import { deferredCommit, numberOf } from './utils.ts';

export function createForm(doc: Document, ctrl: Controller, getXMax: () => number): Form {
  const { t } = ctrl;
  const input = (id: FieldId) => byId<HTMLInputElement>(doc, id);
  const f = {
    D: input('D'),
    W: input('W'),
    ET: input('ET'),
    X: input('X'),
    B: input('B'),
    TW: input('TW'),
    TA: input('TA'),
  };
  const xHint = byId(doc, 'xh');
  const tireOn = byId<HTMLInputElement>(doc, 'tOn');
  const tireFields = byId(doc, 'tf');
  const tireResult = byId(doc, 'tr');
  const warn = byId(doc, 'tWarn');
  const warnTitle = byId(doc, 'tWarnT');
  const warnBody = byId(doc, 'tWarnB');
  const unitMm = byId<HTMLButtonElement>(doc, 'u-mm');
  const unitIn = byId<HTMLButtonElement>(doc, 'u-in');
  const presets = byId<HTMLSelectElement>(doc, 'pr');
  const unitLabels = doc.querySelectorAll<HTMLElement>('[data-length-unit]');

  const presetByValue = new Map<string, Preset>();
  for (const group of PRESET_GROUPS) {
    const og = doc.createElement('optgroup');
    og.label = t(group.key);
    for (const p of group.items) {
      const o = doc.createElement('option');
      o.value = String(presetByValue.size);
      o.textContent = t('presets.option', {
        d: p.d,
        w: localNumber(p.w, t),
        et: (p.et > 0 ? '+' : '') + String(p.et),
        tw: p.tw,
        ta: p.ta,
      });
      presetByValue.set(o.value, p);
      og.appendChild(o);
    }
    presets.appendChild(og);
  }

  function fillTire(): void {
    const s = ctrl.state;
    const u = (mm: number) => tireLenText(mm, ctrl.unit, t);
    const sw = sidewall(s.tw, s.ta);
    tireResult.textContent = t('tire.result', {
      sidewall: u(sw),
      diameter: u(overallDiameter(s.D, s.tw, s.ta)),
    });
    const w = s.tire ? tireWarning(s.W, s.tw) : null;
    warn.hidden = !w;
    if (!w) {
      warn.removeAttribute('data-level');
      return;
    }
    const percent = Math.round((w.kind === 'stretchBad' ? w.ratio - 1 : w.ratio) * 100);
    const params = { diff: u(w.diff), percent };
    warn.setAttribute('data-level', w.level);
    warnTitle.textContent = t(WARN_KEYS[w.kind].title, params);
    warnBody.textContent = t(WARN_KEYS[w.kind].body, params);
  }

  function fill(skip: FieldId | null): void {
    const s = ctrl.state;
    const { unit } = ctrl;
    const lengths = { D: s.D, W: s.W, B: backspacing(s.W, s.ET) } as const;
    for (const id of ['D', 'W', 'B'] as const) {
      if (id !== skip) f[id].value = String(inputValue(lengths[id], unit));
    }
    if (skip !== 'ET') f.ET.value = String(round(s.ET, 1));
    if (skip !== 'X') f.X.value = String(round(s.X, 1));
    if (skip !== 'TW') f.TW.value = String(Math.round(s.tw));
    if (skip !== 'TA') f.TA.value = String(Math.round(s.ta));
    f.D.step = f.W.step = unit === 'mm' ? '1' : '0.5';
    f.B.step = unit === 'mm' ? '1' : '0.05';
    for (const el of unitLabels) el.textContent = t(unit === 'mm' ? 'unit.mm' : 'unit.in');
    unitMm.setAttribute('aria-pressed', String(unit === 'mm'));
    unitIn.setAttribute('aria-pressed', String(unit === 'in'));

    xHint.classList.toggle('x-hint--limited', ctrl.xLimited);
    xHint.textContent = t(ctrl.xLimited ? 'x.hintLimited' : 'x.hintMax', {
      value: round(getXMax(), 1),
    });

    tireOn.checked = s.tire;
    tireFields.hidden = !s.tire;
    fillTire();
  }

  const onInput = (id: FieldId, handler: (v: number) => void) => {
    f[id].addEventListener('input', () => {
      const v = numberOf(f[id]);
      if (Number.isNaN(v)) ctrl.later();
      else handler(v);
    });
    // On leaving the field, show the normalized value and commit a history step.
    f[id].addEventListener('change', () => {
      ctrl.refresh();
      ctrl.commit();
    });
  };
  const positive = (id: FieldId, handler: (v: number) => void) =>
    onInput(id, (v) => (v > 0 ? handler(v) : ctrl.later()));

  positive('D', (v) => ctrl.update({ D: fromUnit(v, ctrl.unit) }, deferredCommit('D')));
  positive('W', (v) => ctrl.update({ W: fromUnit(v, ctrl.unit) }, deferredCommit('W')));
  onInput('ET', (v) => ctrl.update({ ET: v }, deferredCommit('ET')));
  onInput('X', (v) => ctrl.update({ X: v }, deferredCommit('X')));
  onInput('B', (v) =>
    ctrl.update(
      { ET: etFromBackspacing(fromUnit(v, ctrl.unit), ctrl.state.W) },
      deferredCommit('B'),
    ),
  );
  positive('TW', (v) => ctrl.update({ tw: v }, deferredCommit('TW')));
  positive('TA', (v) => ctrl.update({ ta: v }, deferredCommit('TA')));

  tireOn.addEventListener('change', () => ctrl.update({ tire: tireOn.checked }, { commit: 'now' }));
  unitMm.addEventListener('click', () => ctrl.setUnit('mm'));
  unitIn.addEventListener('click', () => ctrl.setUnit('in'));
  presets.addEventListener('change', () => {
    const p = presetByValue.get(presets.value);
    if (p) ctrl.applyPreset(p);
    presets.selectedIndex = 0;
  });

  return { fill };
}
