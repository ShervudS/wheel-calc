// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_STATE } from '../../../core/wheel/constants.ts';
import { $, change, key, mount, type } from '../../__tests__/mount.ts';
import { COMMIT_DELAY } from '../../app/constants.ts';

const btn = (k: string) => $<HTMLButtonElement>(`.kb-controls__btn[data-k="${k}"]`);

beforeEach(() => {
  vi.useFakeTimers();
  localStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('keyboard on the diagram', () => {
  it('focus highlights the parameter and announces the value', () => {
    mount();
    btn('D').focus();
    expect($('[data-layer="overlay"]').innerHTML).toContain('Диаметр Ø 432 мм');
    expect($('#kbs').textContent).toBe('Диаметр: 432 мм');
    btn('D').blur();
    expect($('[data-layer="overlay"]').innerHTML).toBe('');
  });

  it('arrows change the parameter, Shift makes bigger steps', () => {
    const app = mount();
    key(btn('D'), { key: 'ArrowUp' });
    expect(app.state.D).toBe(444.5);
    key(btn('W'), { key: 'ArrowRight', shiftKey: true });
    expect(app.state.W).toBe(228.6);
    key(btn('ET'), { key: 'ArrowDown', shiftKey: true });
    expect(app.state.ET).toBe(30);
    key(btn('X'), { key: 'ArrowLeft' });
    expect(app.state.X).toBe(39);
    expect($('#kbs').textContent).toBe('X-фактор: 39 мм');
  });

  it('hitting the X limit is announced', () => {
    mount('ru', '?x=44.6');
    btn('X').focus();
    key(btn('X'), { key: 'ArrowUp', shiftKey: true });
    expect($('#kbs').textContent).toBe('X-фактор: 44.6 мм (максимум при такой ширине и вылете)');
  });

  it('other keys are ignored', () => {
    const app = mount();
    key(btn('D'), { key: 'Enter' });
    expect(app.state).toEqual(DEFAULT_STATE);
  });

  it('keyboard steps merge into one history step', () => {
    const app = mount();
    key(btn('ET'), { key: 'ArrowUp' });
    key(btn('ET'), { key: 'ArrowUp' });
    vi.advanceTimersByTime(COMMIT_DELAY);
    $('#ub').click();
    expect(app.state.ET).toBe(35);
  });
});

describe('history shortcuts', () => {
  it('Ctrl+Z, Ctrl+Shift+Z and Ctrl+Y', () => {
    const app = mount();
    type('ET', '10');
    change('ET');
    key(document, { key: 'z', ctrlKey: true });
    expect(app.state.ET).toBe(35);
    key(document, { key: 'Z', ctrlKey: true, shiftKey: true });
    expect(app.state.ET).toBe(10);
    key(document, { key: 'z', metaKey: true });
    expect(app.state.ET).toBe(35);
    key(document, { key: 'y', ctrlKey: true });
    expect(app.state.ET).toBe(10);
    key(document, { key: 'z', ctrlKey: true, altKey: true });
    expect(app.state.ET).toBe(10);
  });
});
