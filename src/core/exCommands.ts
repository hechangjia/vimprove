import type { Command, Cursor, QuickfixItem, VimState, VimWindow } from './types';
import { pushHistory } from './stateUtils';
import { clampCursor } from './utils';

type SubstituteSpec = {
  startLine: number;
  endLine: number;
  command: string;
  oldText: string;
  newText: string;
  global: boolean;
  lineFilter?: string;
};

const plural = (count: number, one: string, many: string) => count === 1 ? one : many;

const defaultCursor: Cursor = { line: 0, col: 0 };

const normalizeProjectState = (state: VimState): VimState => {
  const buffers = state.buffers.length > 0
    ? state.buffers
    : [{ id: 1, name: '[No Name]', lines: state.buffer, cursor: state.cursor }];
  const currentBufferIndex = Math.max(0, Math.min(state.currentBufferIndex, buffers.length - 1));
  const windows = state.windows.length > 0
    ? state.windows
    : [{ id: 1, bufferIndex: currentBufferIndex, row: 0, col: 0 }];
  const currentWindowIndex = Math.max(0, Math.min(state.currentWindowIndex, windows.length - 1));

  return {
    ...state,
    buffers,
    currentBufferIndex,
    windows,
    currentWindowIndex
  };
};

const syncCurrentBuffer = (state: VimState): VimState => {
  const normalized = normalizeProjectState(state);
  const buffers = normalized.buffers.map((buffer, index) => index === normalized.currentBufferIndex
    ? {
        ...buffer,
        lines: [...normalized.buffer],
        cursor: { ...normalized.cursor }
      }
    : buffer);
  return { ...normalized, buffers };
};

const switchToBuffer = (state: VimState, targetIndex: number, command: string): VimState => {
  const synced = syncCurrentBuffer(state);
  if (targetIndex < 0 || targetIndex >= synced.buffers.length) {
    return {
      ...synced,
      mode: 'normal',
      commandLine: '',
      commandStatus: `buffer not found: ${targetIndex + 1}`,
      lastCommand: { type: 'ex', command }
    };
  }

  const target = synced.buffers[targetIndex];
  const buffer = [...target.lines];
  const cursor = clampCursor(target.cursor ?? defaultCursor, buffer);
  const windows = synced.windows.map((window, index) => index === synced.currentWindowIndex
    ? { ...window, bufferIndex: targetIndex }
    : window);

  return {
    ...synced,
    buffer,
    cursor,
    buffers: synced.buffers.map((bufferEntry, index) => index === targetIndex
      ? { ...bufferEntry, lines: buffer, cursor }
      : bufferEntry),
    currentBufferIndex: targetIndex,
    windows,
    mode: 'normal',
    commandLine: '',
    commandStatus: `buffer ${target.id}: ${target.name}`,
    lastCommand: { type: 'ex', command }
  };
};

const listBuffers = (state: VimState, command: string): VimState => {
  const synced = syncCurrentBuffer(state);
  const commandStatus = synced.buffers
    .map((buffer, index) => {
      const marker = index === synced.currentBufferIndex ? '%' : ' ';
      return `${buffer.id} ${marker} ${buffer.name}`;
    })
    .join('\n');

  return {
    ...synced,
    mode: 'normal',
    commandLine: '',
    commandStatus,
    lastCommand: { type: 'ex', command }
  };
};

const nextWindowId = (windows: VimWindow[]): number =>
  Math.max(0, ...windows.map(window => window.id)) + 1;

const openSplit = (state: VimState, vertical: boolean, command: string): VimState => {
  const synced = syncCurrentBuffer(state);
  const current = synced.windows[synced.currentWindowIndex];
  const nextWindow: VimWindow = {
    id: nextWindowId(synced.windows),
    bufferIndex: synced.currentBufferIndex,
    row: current.row + (vertical ? 0 : 1),
    col: current.col + (vertical ? 1 : 0)
  };
  const windows = [...synced.windows, nextWindow];

  return {
    ...synced,
    windows,
    currentWindowIndex: windows.length - 1,
    mode: 'normal',
    commandLine: '',
    commandStatus: vertical ? 'vertical split opened' : 'split opened',
    lastCommand: { type: 'ex', command }
  };
};

const closeWindow = (state: VimState, command: string): VimState => {
  const synced = syncCurrentBuffer(state);
  if (synced.windows.length <= 1) {
    return {
      ...synced,
      mode: 'normal',
      commandLine: '',
      commandStatus: 'cannot close last window',
      lastCommand: { type: 'ex', command }
    };
  }

  const windows = synced.windows.filter((_, index) => index !== synced.currentWindowIndex);
  return {
    ...synced,
    windows,
    currentWindowIndex: Math.min(synced.currentWindowIndex, windows.length - 1),
    mode: 'normal',
    commandLine: '',
    commandStatus: 'window closed',
    lastCommand: { type: 'ex', command }
  };
};

const chooseWindow = (windows: VimWindow[], currentIndex: number, direction: 'h' | 'j' | 'k' | 'l'): number => {
  const current = windows[currentIndex];
  const candidates = windows
    .map((window, index) => ({ window, index }))
    .filter(({ index }) => index !== currentIndex)
    .filter(({ window }) => {
      if (direction === 'h') return window.col < current.col;
      if (direction === 'l') return window.col > current.col;
      if (direction === 'k') return window.row < current.row;
      return window.row > current.row;
    });

  if (!candidates.length) return currentIndex;

  candidates.sort((a, b) => {
    const primaryA = direction === 'h' || direction === 'l'
      ? Math.abs(a.window.col - current.col)
      : Math.abs(a.window.row - current.row);
    const primaryB = direction === 'h' || direction === 'l'
      ? Math.abs(b.window.col - current.col)
      : Math.abs(b.window.row - current.row);
    if (primaryA !== primaryB) return primaryA - primaryB;
    const secondaryA = direction === 'h' || direction === 'l'
      ? Math.abs(a.window.row - current.row)
      : Math.abs(a.window.col - current.col);
    const secondaryB = direction === 'h' || direction === 'l'
      ? Math.abs(b.window.row - current.row)
      : Math.abs(b.window.col - current.col);
    return secondaryA - secondaryB;
  });

  return candidates[0].index;
};

const moveWindow = (state: VimState, direction: 'h' | 'j' | 'k' | 'l', command: string): VimState => {
  const synced = syncCurrentBuffer(state);
  const nextIndex = chooseWindow(synced.windows, synced.currentWindowIndex, direction);
  const nextWindow = synced.windows[nextIndex];
  const nextBuffer = synced.buffers[nextWindow.bufferIndex] ?? synced.buffers[synced.currentBufferIndex];
  const bufferLines = [...nextBuffer.lines];
  const cursor = clampCursor(nextBuffer.cursor ?? defaultCursor, bufferLines);

  return {
    ...synced,
    buffer: bufferLines,
    cursor,
    currentWindowIndex: nextIndex,
    currentBufferIndex: nextWindow.bufferIndex,
    mode: 'normal',
    commandLine: '',
    pendingCtrlW: false,
    commandStatus: `window ${nextWindow.id}`,
    lastCommand: { type: 'ex', command }
  };
};

const getBufferName = (state: VimState, bufferIndex: number): string =>
  state.buffers[bufferIndex]?.name ?? `buffer ${bufferIndex + 1}`;

const buildQuickfix = (state: VimState, pattern: string, command: string): VimState => {
  const synced = syncCurrentBuffer(state);
  const quickfixList: QuickfixItem[] = [];

  synced.buffers.forEach((buffer, bufferIndex) => {
    buffer.lines.forEach((lineText, line) => {
      const col = lineText.indexOf(pattern);
      if (col !== -1) {
        quickfixList.push({ bufferIndex, line, col, text: lineText });
      }
    });
  });

  return {
    ...synced,
    quickfixList,
    quickfixIndex: quickfixList.length ? 0 : -1,
    quickfixOpen: true,
    mode: 'normal',
    commandLine: '',
    commandStatus: quickfixList.length
      ? `${quickfixList.length} quickfix ${plural(quickfixList.length, 'match', 'matches')} for ${pattern}`
      : `no quickfix matches for ${pattern}`,
    lastCommand: { type: 'ex', command }
  };
};

const jumpToQuickfix = (state: VimState, direction: 1 | -1, command: string): VimState => {
  const synced = syncCurrentBuffer(state);
  if (!synced.quickfixList.length) {
    return {
      ...synced,
      mode: 'normal',
      commandLine: '',
      commandStatus: 'quickfix list is empty',
      lastCommand: { type: 'ex', command }
    };
  }

  const nextIndex = (synced.quickfixIndex + direction + synced.quickfixList.length) % synced.quickfixList.length;
  const item = synced.quickfixList[nextIndex];
  const switched = switchToBuffer(synced, item.bufferIndex, command);
  return {
    ...switched,
    cursor: { line: item.line, col: item.col },
    quickfixList: synced.quickfixList,
    quickfixIndex: nextIndex,
    quickfixOpen: true,
    commandStatus: `quickfix ${nextIndex + 1}/${synced.quickfixList.length}: ${getBufferName(synced, item.bufferIndex)}:${item.line + 1}`,
    lastCommand: { type: 'ex', command }
  };
};

const parseSubstitute = (command: string): SubstituteSpec | null => {
  const globalMatch = command.match(/^g\/([^/]+)\/s\/([^/]+)\/([^/]*)\/(g)?$/);
  if (globalMatch) {
    return {
      startLine: 0,
      endLine: Number.MAX_SAFE_INTEGER,
      command,
      lineFilter: globalMatch[1] ?? '',
      oldText: globalMatch[2] ?? '',
      newText: globalMatch[3] ?? '',
      global: globalMatch[4] === 'g'
    };
  }

  const rangeMatch = command.match(/^(\d+),(\d+)s\/([^/]+)\/([^/]*)\/(g)?$/);
  if (rangeMatch) {
    return {
      startLine: Math.max(0, Number(rangeMatch[1]) - 1),
      endLine: Math.max(0, Number(rangeMatch[2]) - 1),
      command,
      oldText: rangeMatch[3] ?? '',
      newText: rangeMatch[4] ?? '',
      global: rangeMatch[5] === 'g'
    };
  }

  const match = command.match(/^(%)?s\/([^/]+)\/([^/]*)\/(g)?$/);
  if (!match) return null;

  return {
    startLine: match[1] === '%' ? 0 : -1,
    endLine: match[1] === '%' ? Number.MAX_SAFE_INTEGER : -1,
    command,
    oldText: match[2] ?? '',
    newText: match[3] ?? '',
    global: match[4] === 'g'
  };
};

const replaceLine = (
  line: string,
  oldText: string,
  newText: string,
  global: boolean
): { line: string; count: number } => {
  if (!oldText) return { line, count: 0 };

  if (!global) {
    const index = line.indexOf(oldText);
    if (index === -1) return { line, count: 0 };
    return {
      line: `${line.slice(0, index)}${newText}${line.slice(index + oldText.length)}`,
      count: 1
    };
  }

  const parts = line.split(oldText);
  return {
    line: parts.join(newText),
    count: parts.length - 1
  };
};

const applySubstitute = (state: VimState, spec: SubstituteSpec): VimState => {
  const startLine = spec.startLine === -1 ? state.cursor.line : Math.min(spec.startLine, state.buffer.length - 1);
  const endLine = spec.endLine === -1 ? state.cursor.line : Math.min(spec.endLine, state.buffer.length - 1);
  const nextBuffer = [...state.buffer];
  let substitutionCount = 0;
  let changedLineCount = 0;

  for (let lineIndex = startLine; lineIndex <= endLine; lineIndex++) {
    if (spec.lineFilter && !nextBuffer[lineIndex]?.includes(spec.lineFilter)) continue;
    const result = replaceLine(nextBuffer[lineIndex] ?? '', spec.oldText, spec.newText, spec.global);
    if (result.count > 0) {
      nextBuffer[lineIndex] = result.line;
      substitutionCount += result.count;
      changedLineCount += 1;
    }
  }

  const command: Command = {
    type: 'ex',
    command: spec.command
  };

  if (substitutionCount === 0) {
    return {
      ...state,
      mode: 'normal',
      commandLine: '',
      commandStatus: 'pattern not found',
      lastCommand: command
    };
  }

  const withHistory = pushHistory(state);
  const buffers = withHistory.buffers.map((buffer, index) => index === withHistory.currentBufferIndex
    ? { ...buffer, lines: nextBuffer, cursor: withHistory.cursor }
    : buffer);
  return {
    ...withHistory,
    buffer: nextBuffer,
    buffers,
    mode: 'normal',
    commandLine: '',
    commandStatus: `${substitutionCount} ${plural(substitutionCount, 'substitution', 'substitutions')} on ${changedLineCount} ${plural(changedLineCount, 'line', 'lines')}`,
    lastCommand: command
  };
};

export const executeExCommand = (state: VimState, rawCommand: string): VimState => {
  const command = rawCommand.trim();

  if (['q', 'q!', 'w', 'wq'].includes(command)) {
    const statusByCommand: Record<string, string> = {
      q: 'quit',
      'q!': 'quit without saving',
      w: 'written',
      wq: 'written and quit'
    };

    return {
      ...state,
      mode: 'normal',
      commandLine: '',
      commandStatus: statusByCommand[command],
      lastCommand: { type: 'ex', command }
    };
  }

  const substitute = parseSubstitute(command);
  if (substitute) {
    return applySubstitute(state, substitute);
  }

  const vimgrepMatch = command.match(/^vimgrep\s+\/([^/]+)\/$/);
  if (vimgrepMatch) {
    return buildQuickfix(state, vimgrepMatch[1] ?? '', command);
  }

  if (command === 'cnext' || command === 'cn') {
    return jumpToQuickfix(state, 1, command);
  }

  if (command === 'cprev' || command === 'cp') {
    return jumpToQuickfix(state, -1, command);
  }

  if (command === 'copen') {
    return {
      ...state,
      mode: 'normal',
      commandLine: '',
      quickfixOpen: true,
      commandStatus: 'quickfix opened',
      lastCommand: { type: 'ex', command }
    };
  }

  if (command === 'cclose') {
    return {
      ...state,
      mode: 'normal',
      commandLine: '',
      quickfixOpen: false,
      commandStatus: 'quickfix closed',
      lastCommand: { type: 'ex', command }
    };
  }

  if (command === 'ls' || command === 'buffers') {
    return listBuffers(state, command);
  }

  if (command === 'bnext' || command === 'bn') {
    const synced = syncCurrentBuffer(state);
    return switchToBuffer(synced, (synced.currentBufferIndex + 1) % synced.buffers.length, command);
  }

  if (command === 'bprevious' || command === 'bp') {
    const synced = syncCurrentBuffer(state);
    const targetIndex = (synced.currentBufferIndex - 1 + synced.buffers.length) % synced.buffers.length;
    return switchToBuffer(synced, targetIndex, command);
  }

  const bufferMatch = command.match(/^b(?:uffer)?\s+(\d+)$/);
  if (bufferMatch) {
    return switchToBuffer(state, Number(bufferMatch[1]) - 1, command);
  }

  if (command === 'split') {
    return openSplit(state, false, command);
  }

  if (command === 'vsplit') {
    return openSplit(state, true, command);
  }

  if (command === 'close') {
    return closeWindow(state, command);
  }

  const wincmdMatch = command.match(/^wincmd\s+([hjkl])$/);
  if (wincmdMatch) {
    return moveWindow(state, wincmdMatch[1] as 'h' | 'j' | 'k' | 'l', command);
  }

  return {
    ...state,
    mode: 'normal',
    commandLine: '',
    commandStatus: `not an editor command: ${command}`,
    lastCommand: { type: 'ex', command }
  };
};
