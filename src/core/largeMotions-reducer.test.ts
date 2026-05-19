import { describe, it, expect } from 'vitest';
import { vimReducer, INITIAL_VIM_STATE } from './vimReducer';
import type { VimState } from './types';

const keydown = (s: VimState, key: string): VimState =>
  vimReducer(s, { type: 'KEYDOWN', payload: { key } });

const seed = (lines: string[], line = 0, col = 0): VimState => ({
  ...INITIAL_VIM_STATE,
  buffer: lines,
  cursor: { line, col },
});

describe('reducer: gg / G', () => {
  it('gg jumps to first non-blank of line 0', () => {
    let s = seed(['  alpha', 'beta', '  gamma'], 2, 5);
    s = keydown(s, 'g');
    expect(s.pendingG).toBe(true);
    s = keydown(s, 'g');
    expect(s.pendingG).toBe(false);
    expect(s.cursor).toEqual({ line: 0, col: 2 });
  });

  it('G with no count jumps to last line first non-blank', () => {
    let s = seed(['l0', 'l1', '  l2'], 0, 0);
    s = keydown(s, 'G');
    expect(s.cursor).toEqual({ line: 2, col: 2 });
  });

  it('5G jumps to line 5 (1-based)', () => {
    let s = seed(['l0', 'l1', 'l2', 'l3', 'l4', 'l5', 'l6']);
    s = keydown(s, '5');
    s = keydown(s, 'G');
    expect(s.cursor).toEqual({ line: 4, col: 0 });
    expect(s.count).toBe('');
  });

  it('Escape clears pendingG', () => {
    let s = seed(['hello']);
    s = keydown(s, 'g');
    expect(s.pendingG).toBe(true);
    s = keydown(s, 'Escape');
    expect(s.pendingG).toBe(false);
  });

  it('unknown follow-up to g clears pendingG without effect', () => {
    let s = seed(['hello'], 0, 2);
    s = keydown(s, 'g');
    s = keydown(s, 'q');
    expect(s.pendingG).toBe(false);
    expect(s.cursor).toEqual({ line: 0, col: 2 });
  });
});

describe('reducer: { / }', () => {
  const buf3 = ['a1', 'a2', '', 'b1', 'b2', '', 'c1'];

  it('} from line 0 jumps to first blank', () => {
    let s = seed(buf3, 0, 0);
    s = keydown(s, '}');
    expect(s.cursor).toEqual({ line: 2, col: 0 });
  });

  it('{ from last line jumps to previous blank', () => {
    let s = seed(buf3, 6, 0);
    s = keydown(s, '{');
    expect(s.cursor).toEqual({ line: 5, col: 0 });
  });

  it('2} from line 0 jumps twice', () => {
    let s = seed(buf3, 0, 0);
    s = keydown(s, '2');
    s = keydown(s, '}');
    expect(s.cursor).toEqual({ line: 5, col: 0 });
  });
});

describe('reducer: %', () => {
  it('% on ( jumps to )', () => {
    let s = seed(['foo(bar)'], 0, 3);
    s = keydown(s, '%');
    expect(s.cursor).toEqual({ line: 0, col: 7 });
  });

  it('% on ) jumps to (', () => {
    let s = seed(['foo(bar)'], 0, 7);
    s = keydown(s, '%');
    expect(s.cursor).toEqual({ line: 0, col: 3 });
  });

  it('% on non-bracket char is no-op', () => {
    let s = seed(['xxxxx'], 0, 1);
    s = keydown(s, '%');
    expect(s.cursor).toEqual({ line: 0, col: 1 });
  });
});
