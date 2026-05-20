import { describe, expect, it } from 'vitest';
import { executeExCommand } from './exCommands';
import { INITIAL_VIM_STATE } from './vimReducer';
import type { VimState } from './types';

const seedProject = (): VimState => ({
  ...INITIAL_VIM_STATE,
  buffer: ['debugLog("boot");'],
  cursor: { line: 0, col: 0 },
  buffers: [
    { id: 1, name: 'src/main.ts', lines: ['debugLog("boot");', 'startApp();'], cursor: { line: 0, col: 0 } },
    { id: 2, name: 'src/logger.ts', lines: ['export const debugLog = console.log;', 'export const trace = console.info;'], cursor: { line: 0, col: 13 } },
    { id: 3, name: 'README.md', lines: ['# App', 'No debug here.'], cursor: { line: 0, col: 0 } }
  ],
  currentBufferIndex: 0,
  windows: [{ id: 1, bufferIndex: 0, row: 0, col: 0 }],
  currentWindowIndex: 0
});

describe('project workspace quickfix commands', () => {
  it('builds a quickfix list with literal :vimgrep across simulated buffers', () => {
    const result = executeExCommand(seedProject(), 'vimgrep /debug/');

    expect(result.quickfixOpen).toBe(true);
    expect(result.quickfixIndex).toBe(0);
    expect(result.quickfixList).toEqual([
      { bufferIndex: 0, line: 0, col: 0, text: 'debugLog("boot");' },
      { bufferIndex: 1, line: 0, col: 13, text: 'export const debugLog = console.log;' },
      { bufferIndex: 2, line: 1, col: 3, text: 'No debug here.' }
    ]);
    expect(result.commandStatus).toBe('3 quickfix matches for debug');
  });

  it('moves forward and backward through quickfix entries', () => {
    const searched = executeExCommand(seedProject(), 'vimgrep /debug/');
    const next = executeExCommand(searched, 'cnext');

    expect(next.quickfixIndex).toBe(1);
    expect(next.currentBufferIndex).toBe(1);
    expect(next.buffer).toEqual(['export const debugLog = console.log;', 'export const trace = console.info;']);
    expect(next.cursor).toEqual({ line: 0, col: 13 });
    expect(next.commandStatus).toBe('quickfix 2/3: src/logger.ts:1');

    const previous = executeExCommand(next, 'cprev');
    expect(previous.quickfixIndex).toBe(0);
    expect(previous.currentBufferIndex).toBe(0);
    expect(previous.cursor).toEqual({ line: 0, col: 0 });
  });

  it('opens and closes the quickfix panel', () => {
    const searched = executeExCommand(seedProject(), 'vimgrep /debug/');
    const closed = executeExCommand(searched, 'cclose');
    expect(closed.quickfixOpen).toBe(false);

    const opened = executeExCommand(closed, 'copen');
    expect(opened.quickfixOpen).toBe(true);
    expect(opened.commandStatus).toBe('quickfix opened');
  });
});
