import { describe, it, expect } from 'vitest';
import { vimReducer, INITIAL_VIM_STATE } from './vimReducer';
import type { VimState } from './types';

const kd = (s: VimState, key: string): VimState =>
  vimReducer(s, { type: 'KEYDOWN', payload: { key } });

const seed = (lines: string[], line = 0, col = 0): VimState => ({
  ...INITIAL_VIM_STATE,
  buffer: lines,
  cursor: { line, col },
});

describe('uppercase shortcuts: D / C / Y / S', () => {
  it('D deletes from cursor to end of line', () => {
    let s = seed(['hello world'], 0, 6);
    s = kd(s, 'D');
    expect(s.buffer).toEqual(['hello ']);
    expect(s.register).toBe('world');
  });

  it('C deletes to EOL and enters insert', () => {
    let s = seed(['hello world'], 0, 6);
    s = kd(s, 'C');
    expect(s.buffer).toEqual(['hello ']);
    expect(s.mode).toBe('insert');
  });

  it('Y yanks current line', () => {
    let s = seed(['alpha', 'beta'], 0, 2);
    s = kd(s, 'Y');
    expect(s.register).toContain('alpha');
  });

  it('S deletes line content and enters insert', () => {
    let s = seed(['    indented'], 0, 6);
    s = kd(s, 'S');
    expect(s.mode).toBe('insert');
  });
});
