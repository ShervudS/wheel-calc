// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_STATE } from '../../../core/wheel/constants.ts';
import { $, change, input, mount, type } from '../../__tests__/mount.ts';
import { COMMIT_DELAY } from '../constants.ts';

beforeEach(() => {
  vi.useFakeTimers();
  localStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('initial state', () => {
  it('fields show the defaults', () => {
    const app = mount();
    expect(app.state).toEqual(DEFAULT_STATE);
    expect(input('D').value).toBe('431.8');
    expect(input('W').value).toBe('203.2');
    expect(input('ET').value).toBe('35');
    expect(input('X').value).toBe('40');
    expect(input('B').value).toBe('136.6');
  });

  it('history and reset buttons are disabled', () => {
    mount();
    expect($<HTMLButtonElement>('#ub').disabled).toBe(true);
    expect($<HTMLButtonElement>('#rb').disabled).toBe(true);
    expect($<HTMLButtonElement>('#xb').disabled).toBe(true);
  });

  it('state comes from the link', () => {
    const app = mount('ru', '?d=457.2&w=228.6&et=20&x=30&u=in&t=1&tw=255&ta=35');
    expect(app.state).toMatchObject({ D: 457.2, W: 228.6, ET: 20, X: 30, tire: true, tw: 255 });
    expect(app.unit).toBe('in');
    expect(input('D').value).toBe('18');
    expect(input('tOn').checked).toBe(true);
    expect($('#tf').hidden).toBe(false);
  });

  it('the diagram is drawn in three layers', () => {
    mount();
    expect($('[data-layer="base"]').innerHTML).toContain('<path');
    expect($('[data-layer="hits"]').querySelectorAll('[data-k]').length).toBe(13);
    expect($('[data-layer="overlay"]').innerHTML).toBe('');
  });
});

describe('history', () => {
  it('input becomes a step after a pause; undo and redo', () => {
    const app = mount();
    type('ET', '20');
    expect($<HTMLButtonElement>('#ub').disabled).toBe(false);
    vi.advanceTimersByTime(COMMIT_DELAY);
    $('#ub').click();
    expect(app.state.ET).toBe(35);
    expect(input('ET').value).toBe('35');
    expect($<HTMLButtonElement>('#rb').disabled).toBe(false);
    $('#rb').click();
    expect(app.state.ET).toBe(20);
  });

  it('undo before the pause reverts uncommitted input', () => {
    const app = mount();
    type('ET', '20');
    $('#ub').click();
    expect(app.state.ET).toBe(35);
  });

  it('a new action clears redo', () => {
    mount();
    type('ET', '10');
    change('ET');
    $('#ub').click();
    type('ET', '15');
    change('ET');
    expect($<HTMLButtonElement>('#rb').disabled).toBe(true);
  });

  it('Reset is a regular step that can be undone', () => {
    const app = mount('ru', '?et=10&t=1');
    expect($<HTMLButtonElement>('#xb').disabled).toBe(false);
    $('#xb').click();
    expect(app.state).toEqual(DEFAULT_STATE);
    expect($<HTMLButtonElement>('#xb').disabled).toBe(true);
    expect(input('tOn').checked).toBe(false);
    $('#ub').click();
    expect(app.state.ET).toBe(10);
    expect(app.state.tire).toBe(true);
  });

  it('enabling the tire is a step immediately', () => {
    const app = mount();
    const cb = input('tOn');
    cb.checked = true;
    cb.dispatchEvent(new Event('change'));
    $('#ub').click();
    expect(app.state.tire).toBe(false);
  });
});

describe('accessibility', () => {
  it('the diagram aria-label describes the parameters', () => {
    mount();
    expect($('#s').getAttribute('aria-label')).toBe(
      'Схема диска в разрезе: диаметр 432 мм, ширина 203 мм, вылет ET 35 мм, X-фактор 40 мм',
    );
    mount('en', '?u=in&t=1');
    expect($('#s').getAttribute('aria-label')).toBe(
      'Wheel cross-section: diameter 17", width 8", ET offset 35 mm, X-factor 40 mm, tire 245/40',
    );
  });

  it('hints and warnings are announced via aria-live', () => {
    mount();
    for (const id of ['xh', 'tWarn', 'kbs'])
      expect($(`#${id}`).getAttribute('aria-live')).toBe('polite');
  });
});

describe('English page', () => {
  it('UI texts in English', () => {
    mount('en');
    expect($('#xh').textContent).toBe('Maximum at this width and offset — 44.6 mm');
    expect($('#tt').textContent).toBe('Dark theme');
    expect($('#lang').textContent).toBe('Русский');
    expect($('#lang').getAttribute('href')).toMatch(/^\.\.\/\?/);
  });
});
