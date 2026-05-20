import type { Cursor } from './types';

export const clampCursor = (cursor: Cursor, buffer: string[]): Cursor => {
  let { line, col } = cursor;
  if (line < 0) line = 0;
  if (line >= buffer.length) line = Math.max(0, buffer.length - 1);

  const lineLen = buffer[line]?.length || 0;
  if (col < 0) col = 0;
  if (col > lineLen) col = lineLen;

  return { line, col };
};

export const isWhitespace = (char: string): boolean => /\s/.test(char);

export const isWordChar = (char: string): boolean => /[a-zA-Z0-9_]/.test(char);

export const isPunctuation = (char: string): boolean => {
  return !isWhitespace(char) && !isWordChar(char);
};

export const deleteWordBackward = (line: string, col: number): { newLine: string; newCol: number } => {
  if (col === 0) return { newLine: line, newCol: 0 };

  let pos = col - 1;
  // Skip trailing whitespace
  while (pos >= 0 && isWhitespace(line[pos])) pos--;
  if (pos < 0) {
    return { newLine: line.slice(col), newCol: 0 };
  }

  const targetIsWord = isWordChar(line[pos]);
  while (pos >= 0 && !isWhitespace(line[pos]) && isWordChar(line[pos]) === targetIsWord) pos--;

  const newLine = line.slice(0, pos + 1) + line.slice(col);
  return { newLine, newCol: pos + 1 };
};
