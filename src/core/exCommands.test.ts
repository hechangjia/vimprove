import { describe, expect, it } from 'vitest';
import { executeExCommand } from './exCommands';
import { INITIAL_VIM_STATE, vimReducer } from './vimReducer';
import type { VimState } from './types';

const keydown = (state: VimState, key: string): VimState =>
  vimReducer(state, { type: 'KEYDOWN', payload: { key } });

const typeCommand = (state: VimState, command: string): VimState => {
  let current = keydown(state, ':');
  for (const char of command) {
    current = keydown(current, char);
  }
  return keydown(current, 'Enter');
};

const seed = (lines: string[], line = 0, col = 0): VimState => ({
  ...INITIAL_VIM_STATE,
  buffer: lines,
  cursor: { line, col }
});

describe('Ex command execution', () => {
  it('substitutes the first match on the current line', () => {
    const result = executeExCommand(seed(['foo foo', 'foo'], 0, 0), 's/foo/bar/');

    expect(result.buffer).toEqual(['bar foo', 'foo']);
    expect(result.commandStatus).toBe('1 substitution on 1 line');
  });

  it('substitutes all matches on the current line with g', () => {
    const result = executeExCommand(seed(['foo foo', 'foo'], 0, 0), 's/foo/bar/g');

    expect(result.buffer).toEqual(['bar bar', 'foo']);
    expect(result.commandStatus).toBe('2 substitutions on 1 line');
  });

  it('substitutes all matches in the whole buffer with %s and g', () => {
    const result = executeExCommand(seed(['foo foo', 'foo'], 0, 0), '%s/foo/bar/g');

    expect(result.buffer).toEqual(['bar bar', 'bar']);
    expect(result.commandStatus).toBe('3 substitutions on 2 lines');
  });

  it('substitutes within a numeric line range', () => {
    const result = executeExCommand(seed(['foo', 'foo foo', 'foo'], 0, 0), '1,2s/foo/bar/g');

    expect(result.buffer).toEqual(['bar', 'bar bar', 'foo']);
    expect(result.commandStatus).toBe('3 substitutions on 2 lines');
    expect(result.lastCommand).toEqual({ type: 'ex', command: '1,2s/foo/bar/g' });
  });

  it('substitutes only matching lines with a global command', () => {
    const result = executeExCommand(
      seed(['debug foo', 'info foo', 'debug foo foo'], 0, 0),
      'g/debug/s/foo/bar/g'
    );

    expect(result.buffer).toEqual(['debug bar', 'info foo', 'debug bar bar']);
    expect(result.commandStatus).toBe('3 substitutions on 2 lines');
    expect(result.lastCommand).toEqual({ type: 'ex', command: 'g/debug/s/foo/bar/g' });
  });
});

describe('Command-line mode reducer integration', () => {
  it('enters command-line mode with colon and cancels with escape', () => {
    let state = keydown(INITIAL_VIM_STATE, ':');
    expect(state.mode).toBe('command');
    expect(state.commandLine).toBe('');

    state = keydown(state, 'w');
    expect(state.commandLine).toBe('w');

    state = keydown(state, 'Escape');
    expect(state.mode).toBe('normal');
    expect(state.commandLine).toBe('');
  });

  it('executes simulated file commands', () => {
    const state = typeCommand(seed(['hello']), 'wq');

    expect(state.mode).toBe('normal');
    expect(state.commandLine).toBe('');
    expect(state.commandStatus).toBe('written and quit');
    expect(state.lastCommand).toEqual({ type: 'ex', command: 'wq' });
  });

  it('executes substitute commands through command-line mode', () => {
    const state = typeCommand(seed(['foo foo', 'foo'], 0, 0), '%s/foo/bar/g');

    expect(state.mode).toBe('normal');
    expect(state.buffer).toEqual(['bar bar', 'bar']);
    expect(state.commandStatus).toBe('3 substitutions on 2 lines');
  });
});
