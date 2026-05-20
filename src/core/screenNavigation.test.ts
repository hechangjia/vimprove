import { describe, expect, it } from 'vitest';
import { INITIAL_VIM_STATE, vimReducer } from './vimReducer';
import type { VimState } from './types';

const lines = Array.from({ length: 30 }, (_, index) => `line ${String(index + 1).padStart(2, '0')}`);

const seed = (line = 0, viewportTop = 0): VimState => ({
  ...INITIAL_VIM_STATE,
  buffer: lines,
  cursor: { line, col: 0 },
  viewportTop,
  viewportHeight: 10
});

const press = (state: VimState, key: string, ctrlKey = false): VimState =>
  vimReducer(state, { type: 'KEYDOWN', payload: { key, ctrlKey } });

describe('screen navigation', () => {
  it('moves by half pages with Ctrl-d and Ctrl-u', () => {
    const down = press(seed(4, 0), 'd', true);
    expect(down.cursor.line).toBe(9);
    expect(down.viewportTop).toBe(5);
    expect(down.lastCommand).toEqual({ type: 'move' });

    const up = press(down, 'u', true);
    expect(up.cursor.line).toBe(4);
    expect(up.viewportTop).toBe(0);
  });

  it('moves by full pages with Ctrl-f and Ctrl-b', () => {
    const forward = press(seed(4, 0), 'f', true);
    expect(forward.cursor.line).toBe(14);
    expect(forward.viewportTop).toBe(10);

    const backward = press(forward, 'b', true);
    expect(backward.cursor.line).toBe(4);
    expect(backward.viewportTop).toBe(0);
  });

  it('positions the viewport with zz, zt, and zb', () => {
    let state = press(seed(12, 0), 'z');
    expect(state.pendingZ).toBe(true);

    state = press(state, 'z');
    expect(state.pendingZ).toBe(false);
    expect(state.viewportTop).toBe(7);

    state = press(state, 'z');
    state = press(state, 't');
    expect(state.viewportTop).toBe(12);

    state = press(state, 'z');
    state = press(state, 'b');
    expect(state.viewportTop).toBe(3);
  });

  it('jumps to top, middle, and bottom visible lines with H/M/L', () => {
    const top = press(seed(12, 10), 'H');
    expect(top.cursor.line).toBe(10);

    const middle = press(seed(12, 10), 'M');
    expect(middle.cursor.line).toBe(15);

    const bottom = press(seed(12, 10), 'L');
    expect(bottom.cursor.line).toBe(19);
  });

  it('clears pending z on Escape', () => {
    const pending = press(seed(12, 0), 'z');
    const cleared = press(pending, 'Escape');

    expect(cleared.pendingZ).toBe(false);
    expect(cleared.mode).toBe('normal');
  });
});
