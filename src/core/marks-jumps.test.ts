import { describe, expect, it } from 'vitest';
import type { VimState } from './types';
import { INITIAL_VIM_STATE, vimReducer } from './vimReducer';

const pressKey = (state: VimState, key: string, ctrlKey = false): VimState =>
  vimReducer(state, { type: 'KEYDOWN', payload: { key, ctrlKey } });

const pressKeys = (state: VimState, keys: Array<string | [string, boolean]>): VimState =>
  keys.reduce((current, key) => {
    if (Array.isArray(key)) return pressKey(current, key[0], key[1]);
    return pressKey(current, key);
  }, state);

const initialWith = (buffer: string[], cursor: VimState['cursor']): VimState => ({
  ...INITIAL_VIM_STATE,
  buffer,
  cursor
});

describe('marks', () => {
  it('sets a mark with ma and jumps to the exact position with `a', () => {
    const initial = initialWith(['alpha', '  beta', 'gamma'], { line: 1, col: 4 });

    const state = pressKeys(initial, ['m', 'a', 'G', '`', 'a']);

    expect(state.marks.a).toEqual({ line: 1, col: 4 });
    expect(state.cursor).toEqual({ line: 1, col: 4 });
  });

  it("jumps to the first non-blank on a marked line with 'a", () => {
    const initial = initialWith(['alpha', '  beta', 'gamma'], { line: 1, col: 5 });

    const state = pressKeys(initial, ['m', 'a', 'G', "'", 'a']);

    expect(state.cursor).toEqual({ line: 1, col: 2 });
  });

  it('returns to the previous jump location with double backtick', () => {
    const initial = initialWith(['alpha', 'beta', 'gamma'], { line: 0, col: 1 });

    const state = pressKeys(initial, ['m', 'a', 'G', '`', 'a', '`', '`']);

    expect(state.cursor).toEqual({ line: 2, col: 0 });
  });
});

describe('jumplist and changelist', () => {
  it('moves backward and forward through long-motion jumps with Ctrl-o and Ctrl-i', () => {
    const initial = initialWith(['alpha', 'beta', 'gamma'], { line: 0, col: 0 });

    let state = pressKey(initial, 'G');
    expect(state.cursor).toEqual({ line: 2, col: 0 });

    state = pressKey(state, 'o', true);
    expect(state.cursor).toEqual({ line: 0, col: 0 });

    state = pressKey(state, 'i', true);
    expect(state.cursor).toEqual({ line: 2, col: 0 });
  });

  it('moves through recent change positions with g; and g,', () => {
    let state = initialWith(['abc', 'def'], { line: 0, col: 0 });

    state = pressKey(state, 'x');
    state = pressKey(state, 'j');
    state = pressKey(state, 'x');
    state = pressKeys(state, ['g', ';']);
    expect(state.cursor).toEqual({ line: 0, col: 0 });

    state = pressKeys(state, ['g', ',']);
    expect(state.cursor).toEqual({ line: 1, col: 0 });
  });
});
