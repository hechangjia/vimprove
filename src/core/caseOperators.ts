import type { Cursor, VimState } from './types';
import { getMotionTarget } from './motions';
import { pushHistory } from './stateUtils';
import { isWhitespace } from './utils';

export type CaseMode = 'toggle' | 'upper' | 'lower';

const firstNonBlankCol = (line: string): number => {
  for (let i = 0; i < line.length; i++) {
    if (!isWhitespace(line[i])) return i;
  }
  return 0;
};

export const toggleCharCase = (ch: string): string => {
  if (ch >= 'a' && ch <= 'z') return ch.toUpperCase();
  if (ch >= 'A' && ch <= 'Z') return ch.toLowerCase();
  return ch;
};

const transformChar = (ch: string, mode: CaseMode): string => {
  if (mode === 'upper') return ch.toUpperCase();
  if (mode === 'lower') return ch.toLowerCase();
  return toggleCharCase(ch);
};

const transformSlice = (text: string, mode: CaseMode): string =>
  text.split('').map((c) => transformChar(c, mode)).join('');

/** Apply case transform to inclusive buffer range [start..end]. */
export const applyCaseRange = (
  buffer: string[],
  start: Cursor,
  end: Cursor,
  mode: CaseMode,
): string[] => {
  const result = [...buffer];
  if (start.line === end.line) {
    const line = result[start.line] ?? '';
    const before = line.slice(0, start.col);
    const target = line.slice(start.col, end.col + 1);
    const after = line.slice(end.col + 1);
    result[start.line] = before + transformSlice(target, mode) + after;
    return result;
  }
  const startLine = result[start.line] ?? '';
  result[start.line] = startLine.slice(0, start.col) + transformSlice(startLine.slice(start.col), mode);
  for (let i = start.line + 1; i < end.line; i++) {
    result[i] = transformSlice(result[i] ?? '', mode);
  }
  const endLine = result[end.line] ?? '';
  result[end.line] = transformSlice(endLine.slice(0, end.col + 1), mode) + endLine.slice(end.col + 1);
  return result;
};

export const opToCaseMode = (op: 'gu' | 'gU' | 'g~'): CaseMode =>
  op === 'gu' ? 'lower' : op === 'gU' ? 'upper' : 'toggle';

const cmpCursor = (a: Cursor, b: Cursor): number => {
  if (a.line !== b.line) return a.line - b.line;
  return a.col - b.col;
};

const sortCursors = (a: Cursor, b: Cursor): [Cursor, Cursor] =>
  cmpCursor(a, b) <= 0 ? [a, b] : [b, a];

// motion → inclusive-end normalization helper:
// `$` already lands on EOL, treat as inclusive. word-forward motions land on the
// start of next word (exclusive). For our purposes we shrink them by one column.
const EXCLUSIVE_FORWARD: Set<string> = new Set(['w', 'W', 'b', 'B']);

export const applyCaseOperatorWithMotion = (
  state: VimState,
  motion: string,
  op: 'gu' | 'gU' | 'g~',
): VimState => {
  const startCursor = state.cursor;
  const targetCursor = getMotionTarget(state, motion as Parameters<typeof getMotionTarget>[1], true);
  const [start, endRaw] = sortCursors(startCursor, targetCursor);

  let end = endRaw;
  // Shrink exclusive forward motions (w/W/b/B) by one column.
  if (EXCLUSIVE_FORWARD.has(motion) && cmpCursor(end, start) > 0) {
    if (end.col > 0) {
      end = { line: end.line, col: end.col - 1 };
    } else if (end.line > start.line) {
      // Motion crossed into next line at col 0 → shrink to EOL of previous line
      const prevLine = state.buffer[end.line - 1] ?? '';
      end = { line: end.line - 1, col: Math.max(0, prevLine.length - 1) };
    }
  }
  if (cmpCursor(end, start) < 0) {
    return { ...state, pendingOperator: null, count: '' };
  }

  const newBuffer = applyCaseRange(state.buffer, start, end, opToCaseMode(op));
  const stateWithHistory = pushHistory(state);
  return {
    ...stateWithHistory,
    buffer: newBuffer,
    cursor: start,
    pendingOperator: null,
    count: '',
  };
};

export const applyCaseOperatorLinewise = (
  state: VimState,
  op: 'gu' | 'gU' | 'g~',
): VimState => {
  const lineText = state.buffer[state.cursor.line] ?? '';
  if (lineText.length === 0) {
    return { ...state, pendingOperator: null, count: '' };
  }
  const newBuffer = applyCaseRange(
    state.buffer,
    { line: state.cursor.line, col: 0 },
    { line: state.cursor.line, col: lineText.length - 1 },
    opToCaseMode(op),
  );
  const stateWithHistory = pushHistory(state);
  // Linewise operators (guu/gUU/g~~) leave cursor on first non-blank, matching Neovim.
  const newCol = firstNonBlankCol(newBuffer[state.cursor.line] ?? '');
  return {
    ...stateWithHistory,
    buffer: newBuffer,
    cursor: { line: state.cursor.line, col: newCol },
    pendingOperator: null,
    count: '',
  };
};
