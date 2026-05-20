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

describe('named registers', () => {
  it('yanks into a named register with "ayiw', () => {
    const state = pressKeys(initialWith(['alpha beta'], { line: 0, col: 0 }), ['"', 'a', 'y', 'i', 'w']);

    expect(state.mode).toBe('normal');
    expect(state.register).toBe('alpha');
    expect(state.registers.a).toBe('alpha');
    expect(state.yankRegister).toBe('alpha');
  });

  it('deletes into the black-hole register without replacing the default register', () => {
    const initial = {
      ...initialWith(['alpha beta'], { line: 0, col: 0 }),
      register: 'keep',
      yankRegister: 'keep'
    };

    const state = pressKeys(initial, ['"', '_', 'd', 'w']);

    expect(state.buffer).toEqual(['beta']);
    expect(state.register).toBe('keep');
    expect(state.yankRegister).toBe('keep');
    expect(state.registers._).toBeUndefined();
  });

  it('pastes from a named register with "ap', () => {
    const initial = {
      ...initialWith(['xx'], { line: 0, col: 0 }),
      register: 'DEFAULT',
      registers: { a: 'hello' }
    };

    const state = pressKeys(initial, ['"', 'a', 'p']);

    expect(state.buffer).toEqual(['xhellox']);
    expect(state.register).toBe('DEFAULT');
  });
});

describe('macros', () => {
  it('records a macro with qa...q and replays it with @a', () => {
    let state = initialWith(['abc'], { line: 0, col: 0 });

    state = pressKeys(state, ['q', 'a', 'x', 'q']);
    expect(state.buffer).toEqual(['bc']);
    expect(state.macros.a).toEqual([{ key: 'x', ctrlKey: false }]);

    state = pressKeys(state, ['@', 'a']);

    expect(state.buffer).toEqual(['c']);
    expect(state.lastMacroRegister).toBe('a');
  });

  it('replays a macro with a count prefix', () => {
    let state = initialWith(['abcd'], { line: 0, col: 0 });

    state = pressKeys(state, ['q', 'a', 'x', 'q']);
    state = pressKeys(state, ['2', '@', 'a']);

    expect(state.buffer).toEqual(['d']);
  });

  it('replays the last macro with @@', () => {
    let state = initialWith(['abc'], { line: 0, col: 0 });

    state = pressKeys(state, ['q', 'a', 'x', 'q']);
    state = pressKeys(state, ['@', 'a']);
    state = pressKeys(state, ['@', '@']);

    expect(state.buffer).toEqual(['']);
  });
});
