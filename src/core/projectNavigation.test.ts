import { describe, expect, it } from 'vitest';
import { executeExCommand } from './exCommands';
import { INITIAL_VIM_STATE, vimReducer } from './vimReducer';
import type { VimState } from './types';

const seedProjectState = (): VimState => ({
  ...INITIAL_VIM_STATE,
  buffer: ['const current = true;'],
  cursor: { line: 0, col: 6 },
  buffers: [
    { id: 1, name: 'src/main.ts', lines: ['const current = true;'], cursor: { line: 0, col: 6 } },
    { id: 2, name: 'src/app.tsx', lines: ['export function App() {}'], cursor: { line: 0, col: 7 } },
    { id: 3, name: 'README.md', lines: ['# Vimprove'], cursor: { line: 0, col: 0 } }
  ],
  currentBufferIndex: 0,
  windows: [
    { id: 1, bufferIndex: 0, row: 0, col: 0 },
    { id: 2, bufferIndex: 1, row: 0, col: 1 },
    { id: 3, bufferIndex: 2, row: 1, col: 1 }
  ],
  currentWindowIndex: 0
});

const pressKey = (state: VimState, key: string, ctrlKey = false): VimState =>
  vimReducer(state, { type: 'KEYDOWN', payload: { key, ctrlKey } });

describe('Project navigation Ex commands', () => {
  it('lists simulated buffers with current-buffer marker', () => {
    const result = executeExCommand(seedProjectState(), 'ls');

    expect(result.commandStatus).toContain('1 % src/main.ts');
    expect(result.commandStatus).toContain('2   src/app.tsx');
    expect(result.commandStatus).toContain('3   README.md');
    expect(result.currentBufferIndex).toBe(0);
  });

  it('switches to next and previous buffers while preserving edits', () => {
    const edited = {
      ...seedProjectState(),
      buffer: ['const current = false;'],
      cursor: { line: 0, col: 18 }
    };

    const next = executeExCommand(edited, 'bnext');
    expect(next.currentBufferIndex).toBe(1);
    expect(next.buffer).toEqual(['export function App() {}']);
    expect(next.cursor).toEqual({ line: 0, col: 7 });
    expect(next.buffers[0].lines).toEqual(['const current = false;']);
    expect(next.buffers[0].cursor).toEqual({ line: 0, col: 18 });
    expect(next.commandStatus).toBe('buffer 2: src/app.tsx');

    const previous = executeExCommand(next, 'bprevious');
    expect(previous.currentBufferIndex).toBe(0);
    expect(previous.buffer).toEqual(['const current = false;']);
    expect(previous.cursor).toEqual({ line: 0, col: 18 });
  });

  it('switches directly by buffer number', () => {
    const result = executeExCommand(seedProjectState(), 'buffer 3');

    expect(result.currentBufferIndex).toBe(2);
    expect(result.buffer).toEqual(['# Vimprove']);
    expect(result.commandStatus).toBe('buffer 3: README.md');
  });

  it('opens and closes simulated splits', () => {
    const split = executeExCommand(seedProjectState(), 'split');
    expect(split.windows).toHaveLength(4);
    expect(split.currentWindowIndex).toBe(3);
    expect(split.windows[3]).toMatchObject({ bufferIndex: 0, row: 1, col: 0 });
    expect(split.commandStatus).toBe('split opened');

    const vertical = executeExCommand(split, 'vsplit');
    expect(vertical.windows).toHaveLength(5);
    expect(vertical.currentWindowIndex).toBe(4);
    expect(vertical.windows[4]).toMatchObject({ bufferIndex: 0, row: 1, col: 1 });
    expect(vertical.commandStatus).toBe('vertical split opened');

    const closed = executeExCommand(vertical, 'close');
    expect(closed.windows).toHaveLength(4);
    expect(closed.currentWindowIndex).toBe(3);
    expect(closed.commandStatus).toBe('window closed');
  });
});

describe('Ctrl-w window navigation', () => {
  it('moves window focus with Ctrl-w h/j/k/l', () => {
    let state = seedProjectState();

    state = pressKey(state, 'w', true);
    expect(state.pendingCtrlW).toBe(true);

    state = pressKey(state, 'l');
    expect(state.pendingCtrlW).toBe(false);
    expect(state.currentWindowIndex).toBe(1);
    expect(state.commandStatus).toBe('window 2');

    state = pressKey(state, 'w', true);
    state = pressKey(state, 'j');
    expect(state.currentWindowIndex).toBe(2);
    expect(state.commandStatus).toBe('window 3');

    state = pressKey(state, 'w', true);
    state = pressKey(state, 'h');
    expect(state.currentWindowIndex).toBe(0);
    expect(state.commandStatus).toBe('window 1');
  });

  it('clears pending Ctrl-w on Escape', () => {
    const pending = pressKey(seedProjectState(), 'w', true);
    const result = pressKey(pending, 'Escape');

    expect(result.pendingCtrlW).toBe(false);
    expect(result.mode).toBe('normal');
  });
});
