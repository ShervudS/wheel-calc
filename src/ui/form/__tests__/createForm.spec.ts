// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { inches } from '../../../core/units/utils.ts';
import { DEFAULT_STATE } from '../../../core/wheel/constants.ts';
import { $, change, input, mount, type } from '../../__tests__/mount.ts';

beforeEach(() => {
  vi.useFakeTimers();
  localStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('field input', () => {
  it('diameter in mm changes the state and leaves backspacing alone', () => {
    const app = mount();
    type('D', '457.2');
    expect(app.state.D).toBe(457.2);
    expect(input('D').value).toBe('457.2');
  });

  it('width changes backspacing', () => {
    mount();
    type('W', '228.6');
    expect(input('B').value).toBe('149.3');
  });

  it('backspacing recalculates the offset', () => {
    const app = mount();
    type('B', '120');
    expect(app.state.ET).toBeCloseTo(18.4, 10);
    expect(input('ET').value).toBe('18.4');
  });

  it('the field being edited is not overwritten; after change it shows the clamped value', () => {
    const app = mount();
    type('D', '1000');
    expect(input('D').value).toBe('1000');
    expect(app.state.D).toBe(inches(24));
    change('D');
    expect(input('D').value).toBe('609.6');
  });

  it('empty and zero values are ignored', () => {
    const app = mount();
    type('D', '');
    type('W', '0');
    type('ET', '-');
    expect(app.state).toEqual(DEFAULT_STATE);
  });

  it('X above the maximum: "Limited" hint', () => {
    const app = mount();
    const hint = $('#xh');
    expect(hint.textContent).toBe('Максимум при такой ширине и вылете — 44.6 мм');
    expect(hint.classList.contains('x-hint--limited')).toBe(false);
    type('X', '60');
    expect(app.state.X).toBe(44.6);
    expect(hint.textContent).toBe('Ограничено: максимум при такой ширине и вылете — 44.6 мм');
    expect(hint.classList.contains('x-hint--limited')).toBe(true);
    change('X');
    expect(input('X').value).toBe('44.6');
  });

  it('max X depends on width and offset', () => {
    mount();
    type('ET', '20');
    expect($('#xh').textContent).toContain('59.6');
  });
});

describe('units', () => {
  it('inches: fields, labels and step', () => {
    const app = mount();
    $('#u-in').click();
    expect(app.unit).toBe('in');
    expect(input('D').value).toBe('17');
    expect(input('W').value).toBe('8');
    expect(input('B').value).toBe('5.38');
    expect(input('ET').value).toBe('35');
    expect(input('D').step).toBe('0.5');
    expect(input('B').step).toBe('0.05');
    expect([...document.querySelectorAll('[data-length-unit]')].map((e) => e.textContent)).toEqual([
      'дюйм',
      'дюйм',
      'дюйм',
    ]);
    expect($('#u-in').getAttribute('aria-pressed')).toBe('true');
    expect($('#u-mm').getAttribute('aria-pressed')).toBe('false');
  });

  it('input in inches is stored in mm', () => {
    const app = mount('ru', '?u=in');
    type('D', '18');
    expect(app.state.D).toBe(457.2);
  });

  it('units are not part of history', () => {
    mount();
    $('#u-in').click();
    expect($<HTMLButtonElement>('#ub').disabled).toBe(true);
  });
});

describe('tire', () => {
  it('enabling shows fields, sizes and the tire on the diagram', () => {
    const app = mount();
    const cb = input('tOn');
    cb.checked = true;
    cb.dispatchEvent(new Event('change'));
    expect(app.state.tire).toBe(true);
    expect($('#tf').hidden).toBe(false);
    expect($('#tr').textContent).toBe('Боковина 98 мм, наружный диаметр колеса 628 мм');
    expect($('[data-layer="base"]').innerHTML).toContain('fill="var(--tire)"');
    expect($('#s').getAttribute('aria-label')).toContain('шина 245/40');
  });

  it('tire sizes in inches to tenths', () => {
    mount('ru', '?t=1&u=in');
    expect($('#tr').textContent).toBe('Боковина 3.9", наружный диаметр колеса 24.7"');
  });

  it('tire width is clamped to 125–405', () => {
    const app = mount('ru', '?t=1');
    type('TW', '50');
    expect(app.state.tw).toBe(125);
    change('TW');
    expect(input('TW').value).toBe('125');
  });

  it.each([
    ['?t=1&w=254&tw=205', 'bad', 'Слишком сильный «домик»: стретч будет нестабильным'],
    ['?t=1&w=228.6&tw=215', 'warn', '«Домик»: шина уже диска на 14 мм'],
    ['?t=1&w=127&tw=245', 'bad', 'Диск слишком узкий для такой шины'],
    ['?t=1&w=165.1&tw=245', 'warn', 'Шина широковата для этого диска'],
  ])('%s → %s warning', (q, level, title) => {
    mount('ru', q);
    const warn = $('#tWarn');
    expect(warn.hidden).toBe(false);
    expect(warn.getAttribute('data-level')).toBe(level);
    expect($('#tWarnT').textContent).toBe(title);
  });

  it('percentages in the warning text', () => {
    mount('ru', '?t=1&w=254&tw=205');
    expect($('#tWarnB').textContent).toContain('около 24%');
    mount('ru', '?t=1&w=127&tw=245');
    expect($('#tWarnB').textContent).toContain('около 52%');
  });

  it('normal fit has no warning', () => {
    mount('ru', '?t=1');
    expect($('#tWarn').hidden).toBe(true);
  });

  it('red tire outline at the bad level', () => {
    mount('ru', '?t=1&w=254&tw=205');
    expect($('[data-layer="base"]').innerHTML).toContain('stroke="var(--bad)"');
  });
});

describe('presets', () => {
  it('the list is grouped and labelled', () => {
    mount();
    const groups = [...document.querySelectorAll('#pr optgroup')];
    expect(groups.map((g) => g.getAttribute('label'))).toEqual([
      'Заводские (типовые)',
      'Вторичные (популярные)',
      '«Домик» (стретч, JDM)',
    ]);
    expect(groups[1]?.querySelector('option')?.textContent).toBe('17×8,5  ET+35  ·  235/40');
  });

  it('decimal point in English', () => {
    mount('en');
    expect(document.querySelectorAll('#pr option')[8]?.textContent).toBe(
      '18×9.5  ET+22  ·  255/35',
    );
  });

  it('picking a preset changes sizes and tire, keeps X and undoes in one step', () => {
    const app = mount('ru', '?x=20');
    const sel = $<HTMLSelectElement>('#pr');
    sel.value = '5';
    sel.dispatchEvent(new Event('change'));
    expect(app.state).toMatchObject({ D: 431.8, W: 215.9, ET: 35, X: 20, tw: 235, ta: 40 });
    expect(sel.selectedIndex).toBe(0);
    $('#ub').click();
    expect(app.state).toMatchObject({ W: 203.2, tw: 245, X: 20 });
  });

  it('X is clamped if it does not fit the new rim', () => {
    const app = mount();
    const sel = $<HTMLSelectElement>('#pr');
    sel.value = '0';
    sel.dispatchEvent(new Event('change'));
    expect(app.state.X).toBeCloseTo(9.2, 10);
  });
});
