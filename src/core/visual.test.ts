import { describe, expect, it } from 'vitest';
import type { VimState } from './types';
import { INITIAL_VIM_STATE, vimReducer } from './vimReducer';

const pressKey = (state: VimState, key: string, ctrlKey = false): VimState =>
  vimReducer(state, { type: 'KEYDOWN', payload: { key, ctrlKey } });

const initialWith = (buffer: string[], cursor: VimState['cursor']): VimState => ({
  ...INITIAL_VIM_STATE,
  buffer,
  cursor
});

describe('Visual mode foundation', () => {
  it('enters visual mode with v and anchors at the current cursor', () => {
    const initial = initialWith(['alpha beta'], { line: 0, col: 2 });

    const next = pressKey(initial, 'v');

    expect(next.mode).toBe('visual');
    expect(next.visualAnchor).toEqual({ line: 0, col: 2 });
    expect(next.cursor).toEqual({ line: 0, col: 2 });
  });

  it('moves in visual mode while preserving the anchor', () => {
    const initial = pressKey(initialWith(['alpha beta'], { line: 0, col: 2 }), 'v');

    const next = pressKey(pressKey(initial, 'l'), 'l');

    expect(next.mode).toBe('visual');
    expect(next.visualAnchor).toEqual({ line: 0, col: 2 });
    expect(next.cursor).toEqual({ line: 0, col: 4 });
  });

  it('supports counted motions in visual mode', () => {
    const initial = pressKey(initialWith(['alpha beta'], { line: 0, col: 0 }), 'v');

    const next = pressKey(pressKey(initial, '3'), 'l');

    expect(next.mode).toBe('visual');
    expect(next.visualAnchor).toEqual({ line: 0, col: 0 });
    expect(next.cursor).toEqual({ line: 0, col: 3 });
    expect(next.count).toBe('');
  });

  it('exits visual mode with Escape and clears the anchor', () => {
    const visual = pressKey(pressKey(initialWith(['alpha beta'], { line: 0, col: 2 }), 'v'), 'l');

    const next = pressKey(visual, 'Escape');

    expect(next.mode).toBe('normal');
    expect(next.visualAnchor).toBeNull();
    expect(next.cursor).toEqual({ line: 0, col: 3 });
  });

  it('toggles visual mode off with v', () => {
    const visual = pressKey(pressKey(initialWith(['alpha beta'], { line: 0, col: 2 }), 'v'), 'l');

    const next = pressKey(visual, 'v');

    expect(next.mode).toBe('normal');
    expect(next.visualAnchor).toBeNull();
    expect(next.cursor).toEqual({ line: 0, col: 3 });
  });

  it('yanks the selected characters and exits visual mode', () => {
    const visual = pressKey(pressKey(pressKey(initialWith(['alpha beta'], { line: 0, col: 0 }), 'v'), '3'), 'l');

    const next = pressKey(visual, 'y');

    expect(next.mode).toBe('normal');
    expect(next.visualAnchor).toBeNull();
    expect(next.buffer).toEqual(['alpha beta']);
    expect(next.register).toBe('alph');
    expect(next.cursor).toEqual({ line: 0, col: 0 });
  });

  it('deletes the selected characters and exits visual mode', () => {
    const visual = pressKey(pressKey(pressKey(initialWith(['alpha beta'], { line: 0, col: 0 }), 'v'), '3'), 'l');

    const next = pressKey(visual, 'd');

    expect(next.mode).toBe('normal');
    expect(next.visualAnchor).toBeNull();
    expect(next.buffer).toEqual(['a beta']);
    expect(next.register).toBe('alph');
    expect(next.cursor).toEqual({ line: 0, col: 0 });
  });

  it('changes the selected characters and enters insert mode at selection start', () => {
    const visual = pressKey(pressKey(pressKey(initialWith(['alpha beta'], { line: 0, col: 0 }), 'v'), '3'), 'l');

    const next = pressKey(visual, 'c');

    expect(next.mode).toBe('insert');
    expect(next.visualAnchor).toBeNull();
    expect(next.buffer).toEqual(['a beta']);
    expect(next.register).toBe('alph');
    expect(next.cursor).toEqual({ line: 0, col: 0 });
    expect(next.insertCol).toBe(0);
    expect(next.insertStart).toEqual({ line: 0, col: 0 });
  });

  it('handles backward visual selections for delete', () => {
    const visual = pressKey(pressKey(initialWith(['alpha beta'], { line: 0, col: 3 }), 'v'), 'h');

    const next = pressKey(visual, 'd');

    expect(next.mode).toBe('normal');
    expect(next.buffer).toEqual(['ala beta']);
    expect(next.register).toBe('ph');
    expect(next.cursor).toEqual({ line: 0, col: 2 });
  });

  it('undo restores a visual delete', () => {
    const visual = pressKey(pressKey(pressKey(initialWith(['alpha beta'], { line: 0, col: 0 }), 'v'), '3'), 'l');
    const deleted = pressKey(visual, 'd');

    const next = pressKey(deleted, 'u');

    expect(next.mode).toBe('normal');
    expect(next.buffer).toEqual(['alpha beta']);
    expect(next.cursor).toEqual({ line: 0, col: 0 });
  });

  it('can replace a visual change selection with inserted text', () => {
    let state = pressKey(pressKey(pressKey(initialWith(['alpha beta'], { line: 0, col: 0 }), 'v'), '3'), 'l');
    state = pressKey(state, 'c');
    state = pressKey(state, 'B');
    state = pressKey(state, 'r');
    state = pressKey(state, 'a');
    state = pressKey(state, 'v');
    state = pressKey(state, 'o');
    state = pressKey(state, 'Escape');

    expect(state.mode).toBe('normal');
    expect(state.buffer).toEqual(['Bravoa beta']);
    expect(state.cursor).toEqual({ line: 0, col: 4 });
  });

  it('selects the current inner word with viw', () => {
    let state = pressKey(initialWith(['const foo = "bar";'], { line: 0, col: 6 }), 'v');
    state = pressKey(state, 'i');
    state = pressKey(state, 'w');

    expect(state.mode).toBe('visual');
    expect(state.visualAnchor).toEqual({ line: 0, col: 6 });
    expect(state.cursor).toEqual({ line: 0, col: 8 });
  });

  it('selects inside delimiters with visual text objects', () => {
    let paren = pressKey(initialWith(['foo(bar, baz)'], { line: 0, col: 5 }), 'v');
    paren = pressKey(paren, 'i');
    paren = pressKey(paren, '(');

    expect(paren.visualAnchor).toEqual({ line: 0, col: 4 });
    expect(paren.cursor).toEqual({ line: 0, col: 11 });

    let quote = pressKey(initialWith(['const str = "hello world";'], { line: 0, col: 14 }), 'v');
    quote = pressKey(quote, 'i');
    quote = pressKey(quote, '"');

    expect(quote.visualAnchor).toEqual({ line: 0, col: 13 });
    expect(quote.cursor).toEqual({ line: 0, col: 23 });
  });
});

describe('Visual-line mode foundation', () => {
  it('enters visual-line mode with V and anchors at the current line', () => {
    const initial = initialWith(['alpha', 'beta', 'gamma'], { line: 1, col: 2 });

    const next = pressKey(initial, 'V');

    expect(next.mode).toBe('visual-line');
    expect(next.visualAnchor).toEqual({ line: 1, col: 0 });
    expect(next.cursor).toEqual({ line: 1, col: 0 });
  });

  it('extends visual-line selection with vertical motions', () => {
    const visual = pressKey(initialWith(['alpha', 'beta', 'gamma'], { line: 0, col: 2 }), 'V');

    const next = pressKey(visual, 'j');

    expect(next.mode).toBe('visual-line');
    expect(next.visualAnchor).toEqual({ line: 0, col: 0 });
    expect(next.cursor).toEqual({ line: 1, col: 0 });
  });

  it('yanks whole selected lines and exits visual-line mode', () => {
    const visual = pressKey(pressKey(initialWith(['alpha', 'beta', 'gamma'], { line: 0, col: 2 }), 'V'), 'j');

    const next = pressKey(visual, 'y');

    expect(next.mode).toBe('normal');
    expect(next.visualAnchor).toBeNull();
    expect(next.buffer).toEqual(['alpha', 'beta', 'gamma']);
    expect(next.register).toBe('alpha\nbeta\n');
    expect(next.cursor).toEqual({ line: 0, col: 0 });
  });

  it('deletes whole selected lines and exits visual-line mode', () => {
    const visual = pressKey(pressKey(initialWith(['alpha', 'beta', 'gamma'], { line: 0, col: 2 }), 'V'), 'j');

    const next = pressKey(visual, 'd');

    expect(next.mode).toBe('normal');
    expect(next.visualAnchor).toBeNull();
    expect(next.buffer).toEqual(['gamma']);
    expect(next.register).toBe('alpha\nbeta\n');
    expect(next.cursor).toEqual({ line: 0, col: 0 });
  });

  it('changes whole selected lines and enters insert mode', () => {
    const visual = pressKey(pressKey(initialWith(['alpha', 'beta', 'gamma'], { line: 0, col: 2 }), 'V'), 'j');

    const next = pressKey(visual, 'c');

    expect(next.mode).toBe('insert');
    expect(next.visualAnchor).toBeNull();
    expect(next.buffer).toEqual(['', 'gamma']);
    expect(next.register).toBe('alpha\nbeta\n');
    expect(next.cursor).toEqual({ line: 0, col: 0 });
    expect(next.insertCol).toBe(0);
    expect(next.insertStart).toEqual({ line: 0, col: 0 });
  });
});

describe('Visual-block mode foundation', () => {
  it('enters visual-block mode with Ctrl-v and anchors at the current cursor', () => {
    const initial = initialWith(['alpha', 'bravo', 'charlie'], { line: 0, col: 1 });

    const next = pressKey(initial, 'v', true);

    expect(next.mode).toBe('visual-block');
    expect(next.visualAnchor).toEqual({ line: 0, col: 1 });
    expect(next.cursor).toEqual({ line: 0, col: 1 });
  });

  it('extends visual-block selection with motions', () => {
    let state = pressKey(initialWith(['alpha', 'bravo', 'charlie'], { line: 0, col: 1 }), 'v', true);
    state = pressKey(state, 'j');
    state = pressKey(state, 'l');

    expect(state.mode).toBe('visual-block');
    expect(state.visualAnchor).toEqual({ line: 0, col: 1 });
    expect(state.cursor).toEqual({ line: 1, col: 2 });
  });

  it('yanks rectangular text from a visual-block selection', () => {
    let state = pressKey(initialWith(['alpha', 'bravo', 'charlie'], { line: 0, col: 1 }), 'v', true);
    state = pressKey(state, 'j');
    state = pressKey(state, 'l');

    const next = pressKey(state, 'y');

    expect(next.mode).toBe('normal');
    expect(next.visualAnchor).toBeNull();
    expect(next.buffer).toEqual(['alpha', 'bravo', 'charlie']);
    expect(next.register).toBe('lp\nra');
    expect(next.cursor).toEqual({ line: 0, col: 1 });
  });

  it('deletes rectangular text from a visual-block selection', () => {
    let state = pressKey(initialWith(['alpha', 'bravo', 'charlie'], { line: 0, col: 1 }), 'v', true);
    state = pressKey(state, 'j');
    state = pressKey(state, 'l');

    const next = pressKey(state, 'd');

    expect(next.mode).toBe('normal');
    expect(next.visualAnchor).toBeNull();
    expect(next.buffer).toEqual(['aha', 'bvo', 'charlie']);
    expect(next.register).toBe('lp\nra');
    expect(next.cursor).toEqual({ line: 0, col: 1 });
  });

  it('changes rectangular text and enters insert at the block start', () => {
    let state = pressKey(initialWith(['alpha', 'bravo', 'charlie'], { line: 0, col: 1 }), 'v', true);
    state = pressKey(state, 'j');
    state = pressKey(state, 'l');

    const next = pressKey(state, 'c');

    expect(next.mode).toBe('insert');
    expect(next.visualAnchor).toBeNull();
    expect(next.buffer).toEqual(['aha', 'bvo', 'charlie']);
    expect(next.register).toBe('lp\nra');
    expect(next.cursor).toEqual({ line: 0, col: 1 });
    expect(next.insertCol).toBe(1);
  });
});
