import type { Cursor, VimState } from './types';

const compareCursor = (a: Cursor, b: Cursor): number => {
  if (a.line !== b.line) return a.line - b.line;
  return a.col - b.col;
};

export const isInVisualSelection = (
  state: Pick<VimState, 'mode' | 'visualAnchor' | 'cursor'>,
  position: Cursor
): boolean => {
  if (
    state.mode !== 'visual' &&
    state.mode !== 'visual-line' &&
    state.mode !== 'visual-block'
  ) return false;
  if (!state.visualAnchor) return false;

  if (state.mode === 'visual-line') {
    const startLine = Math.min(state.visualAnchor.line, state.cursor.line);
    const endLine = Math.max(state.visualAnchor.line, state.cursor.line);
    return position.line >= startLine && position.line <= endLine;
  }

  if (state.mode === 'visual-block') {
    const startLine = Math.min(state.visualAnchor.line, state.cursor.line);
    const endLine = Math.max(state.visualAnchor.line, state.cursor.line);
    const startCol = Math.min(state.visualAnchor.col, state.cursor.col);
    const endCol = Math.max(state.visualAnchor.col, state.cursor.col);
    return position.line >= startLine &&
      position.line <= endLine &&
      position.col >= startCol &&
      position.col <= endCol;
  }

  const anchorFirst = compareCursor(state.visualAnchor, state.cursor) <= 0;
  const start = anchorFirst ? state.visualAnchor : state.cursor;
  const end = anchorFirst ? state.cursor : state.visualAnchor;

  return compareCursor(position, start) >= 0 && compareCursor(position, end) <= 0;
};
