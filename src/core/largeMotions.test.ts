import { describe, it, expect } from 'vitest';
import {
  gotoFirstLine,
  gotoLastLine,
  gotoLineN,
  paraNext,
  paraPrev,
  bracketMatch,
} from './largeMotions';

const buf = (lines: string[]) => lines;
const cursor = (l: number, c: number) => ({ line: l, col: c });

describe('large motions: gg / G / {N}G', () => {
  it('gg jumps to first non-blank of line 0', () => {
    const buffer = buf(['  alpha', 'beta', '  gamma']);
    const result = gotoFirstLine(buffer, cursor(2, 5));
    expect(result).toEqual({ line: 0, col: 2 });
  });

  it('G with no count jumps to first non-blank of last line', () => {
    const buffer = buf(['alpha', '   beta', '  gamma']);
    const result = gotoLastLine(buffer, cursor(0, 0));
    expect(result).toEqual({ line: 2, col: 2 });
  });

  it('{N}G jumps to first non-blank of line N (1-based)', () => {
    const buffer = buf(['l0', '  l1', '    l2']);
    const result = gotoLineN(buffer, 2);
    expect(result).toEqual({ line: 1, col: 2 });
  });

  it('{N}G clamps to last line when N exceeds buffer length', () => {
    const buffer = buf(['l0', 'l1']);
    const result = gotoLineN(buffer, 99);
    expect(result).toEqual({ line: 1, col: 0 });
  });

  it('gg on empty line lands at col 0', () => {
    const buffer = buf(['', 'beta']);
    const result = gotoFirstLine(buffer, cursor(1, 0));
    expect(result).toEqual({ line: 0, col: 0 });
  });
});

describe('large motions: { / } (paragraph)', () => {
  const buf3 = [
    'line a1',
    'line a2',
    '',
    'line b1',
    'line b2',
    '',
    'line c1',
  ];

  it('} from middle of first block jumps to first blank line', () => {
    const result = paraNext(buf3, { line: 0, col: 0 });
    expect(result).toEqual({ line: 2, col: 0 });
  });

  it('} from blank line jumps to next blank line', () => {
    const result = paraNext(buf3, { line: 2, col: 0 });
    expect(result).toEqual({ line: 5, col: 0 });
  });

  it('} from last block lands on last line', () => {
    const result = paraNext(buf3, { line: 6, col: 0 });
    expect(result.line).toBe(6);
  });

  it('{ from middle of last block jumps to previous blank line', () => {
    const result = paraPrev(buf3, { line: 6, col: 0 });
    expect(result).toEqual({ line: 5, col: 0 });
  });

  it('{ from first block jumps to line 0', () => {
    const result = paraPrev(buf3, { line: 0, col: 3 });
    expect(result).toEqual({ line: 0, col: 0 });
  });
});

describe('large motions: % (bracket match on same line)', () => {
  it('matches ( -> ) on same line', () => {
    const result = bracketMatch(['foo(bar)'], { line: 0, col: 3 });
    expect(result).toEqual({ line: 0, col: 7 });
  });

  it('matches ) -> ( on same line', () => {
    const result = bracketMatch(['foo(bar)'], { line: 0, col: 7 });
    expect(result).toEqual({ line: 0, col: 3 });
  });

  it('matches nested brackets', () => {
    const result = bracketMatch(['(a(b)c)'], { line: 0, col: 0 });
    expect(result).toEqual({ line: 0, col: 6 });
  });

  it('returns same cursor if not on a bracket', () => {
    const c = { line: 0, col: 1 };
    const result = bracketMatch(['xxxxx'], c);
    expect(result).toEqual(c);
  });

  it('returns same cursor if unmatched', () => {
    const c = { line: 0, col: 0 };
    const result = bracketMatch(['('], c);
    expect(result).toEqual(c);
  });

  it('matches { } and [ ]', () => {
    expect(bracketMatch(['{a}'], { line: 0, col: 0 })).toEqual({ line: 0, col: 2 });
    expect(bracketMatch(['[a]'], { line: 0, col: 2 })).toEqual({ line: 0, col: 0 });
  });
});
