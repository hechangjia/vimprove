import type { Cursor } from './types';
import { isWhitespace } from './utils';

const firstNonBlankCol = (line: string): number => {
  for (let i = 0; i < line.length; i++) {
    if (!isWhitespace(line[i])) return i;
  }
  return 0;
};

/** `gg` — jump to first non-blank of line 0 */
export const gotoFirstLine = (buffer: string[], _cursor: Cursor): Cursor => {
  if (buffer.length === 0) return { line: 0, col: 0 };
  return { line: 0, col: firstNonBlankCol(buffer[0] ?? '') };
};

/** `G` (no count) — jump to first non-blank of last line */
export const gotoLastLine = (buffer: string[], _cursor: Cursor): Cursor => {
  if (buffer.length === 0) return { line: 0, col: 0 };
  const last = buffer.length - 1;
  return { line: last, col: firstNonBlankCol(buffer[last] ?? '') };
};

/** `{N}G` — jump to line N (1-based), clamped to buffer length */
export const gotoLineN = (buffer: string[], lineN: number): Cursor => {
  if (buffer.length === 0) return { line: 0, col: 0 };
  const target = Math.min(Math.max(1, lineN), buffer.length) - 1;
  return { line: target, col: firstNonBlankCol(buffer[target] ?? '') };
};

const isBlank = (line: string): boolean => line.trim().length === 0;

/** `}` — forward to next blank line (or last line) */
export const paraNext = (buffer: string[], cursor: Cursor): Cursor => {
  for (let i = cursor.line + 1; i < buffer.length; i++) {
    if (isBlank(buffer[i] ?? '')) return { line: i, col: 0 };
  }
  if (buffer.length === 0) return { line: 0, col: 0 };
  const last = buffer.length - 1;
  const lastLine = buffer[last] ?? '';
  return { line: last, col: Math.max(0, lastLine.length - 1) };
};

/** `{` — backward to previous blank line (or line 0) */
export const paraPrev = (buffer: string[], cursor: Cursor): Cursor => {
  for (let i = cursor.line - 1; i >= 0; i--) {
    if (isBlank(buffer[i] ?? '')) return { line: i, col: 0 };
  }
  return { line: 0, col: 0 };
};

const OPEN_TO_CLOSE: Record<string, string> = { '(': ')', '[': ']', '{': '}' };
const CLOSE_TO_OPEN: Record<string, string> = { ')': '(', ']': '[', '}': '{' };

/** `%` — single-line bracket match. Returns unchanged cursor if no match. */
export const bracketMatch = (buffer: string[], cursor: Cursor): Cursor => {
  const line = buffer[cursor.line] ?? '';
  if (line.length === 0 || cursor.col >= line.length) return cursor;
  const ch = line[cursor.col];

  if (OPEN_TO_CLOSE[ch]) {
    const close = OPEN_TO_CLOSE[ch];
    let depth = 1;
    for (let i = cursor.col + 1; i < line.length; i++) {
      if (line[i] === ch) depth++;
      else if (line[i] === close) {
        depth--;
        if (depth === 0) return { line: cursor.line, col: i };
      }
    }
    return cursor;
  }

  if (CLOSE_TO_OPEN[ch]) {
    const open = CLOSE_TO_OPEN[ch];
    let depth = 1;
    for (let i = cursor.col - 1; i >= 0; i--) {
      if (line[i] === ch) depth++;
      else if (line[i] === open) {
        depth--;
        if (depth === 0) return { line: cursor.line, col: i };
      }
    }
    return cursor;
  }

  return cursor;
};
