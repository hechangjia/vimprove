import { describe, it, expect } from 'vitest';
import { vimReducer, INITIAL_VIM_STATE } from './vimReducer';
import { toggleCharCase, applyCaseRange } from './caseOperators';
import type { VimState } from './types';

describe('caseOperators: toggleCharCase', () => {
  it('lowercase -> uppercase', () => {
    expect(toggleCharCase('a')).toBe('A');
  });
  it('uppercase -> lowercase', () => {
    expect(toggleCharCase('Z')).toBe('z');
  });
  it('non-letter unchanged', () => {
    expect(toggleCharCase('1')).toBe('1');
    expect(toggleCharCase('!')).toBe('!');
  });
});

describe('caseOperators: applyCaseRange', () => {
  it('toggle range upper/lower', () => {
    const result = applyCaseRange(['Hello'], { line: 0, col: 0 }, { line: 0, col: 4 }, 'toggle');
    expect(result).toEqual(['hELLO']);
  });
  it('to upper', () => {
    const result = applyCaseRange(['hello'], { line: 0, col: 0 }, { line: 0, col: 4 }, 'upper');
    expect(result).toEqual(['HELLO']);
  });
  it('to lower', () => {
    const result = applyCaseRange(['HELLO'], { line: 0, col: 0 }, { line: 0, col: 4 }, 'lower');
    expect(result).toEqual(['hello']);
  });
});

const kd = (s: VimState, key: string): VimState =>
  vimReducer(s, { type: 'KEYDOWN', payload: { key } });

const seed = (lines: string[], line = 0, col = 0): VimState => ({
  ...INITIAL_VIM_STATE,
  buffer: lines,
  cursor: { line, col },
});

describe('reducer: ~', () => {
  it('toggles char under cursor and moves right', () => {
    let s = seed(['hello'], 0, 0);
    s = kd(s, '~');
    expect(s.buffer).toEqual(['Hello']);
    expect(s.cursor).toEqual({ line: 0, col: 1 });
  });

  it('3~ toggles 3 chars', () => {
    let s = seed(['hello'], 0, 0);
    s = kd(s, '3');
    s = kd(s, '~');
    expect(s.buffer).toEqual(['HELlo']);
  });

  it('~ at end of line is no-op', () => {
    let s = seed(['ab'], 0, 5);
    s = kd(s, '~');
    expect(s.buffer).toEqual(['ab']);
  });
});

describe('reducer: gu / gU / g~', () => {
  it('guw lowercases the next word', () => {
    let s = seed(['HELLO WORLD'], 0, 0);
    s = kd(s, 'g');
    s = kd(s, 'u');
    s = kd(s, 'w');
    expect(s.buffer).toEqual(['hello WORLD']);
  });

  it('gU$ uppercases to end of line', () => {
    let s = seed(['abc def'], 0, 4);
    s = kd(s, 'g');
    s = kd(s, 'U');
    s = kd(s, '$');
    expect(s.buffer).toEqual(['abc DEF']);
  });

  it('g~~ toggles case of current line', () => {
    let s = seed(['Hello World'], 0, 0);
    s = kd(s, 'g');
    s = kd(s, '~');
    s = kd(s, '~');
    expect(s.buffer).toEqual(['hELLO wORLD']);
  });

  it('guu lowercases entire line', () => {
    let s = seed(['HELLO WORLD'], 0, 3);
    s = kd(s, 'g');
    s = kd(s, 'u');
    s = kd(s, 'u');
    expect(s.buffer).toEqual(['hello world']);
  });
});
