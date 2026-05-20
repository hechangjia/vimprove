import type { KeyPress, VimState } from './types';

// Count helper used by motions and recordings
const MAX_HISTORY = 100;

export const getCount = (state: VimState): number => {
  const count = parseInt(state.count) || 1;
  return Math.max(1, Math.min(count, 999));
};

const isSameSnapshot = (a: VimState, b: VimState): boolean => {
  if (a.mode !== b.mode) return false;
  if (a.buffer.length !== b.buffer.length) return false;
  for (let i = 0; i < a.buffer.length; i++) {
    if (a.buffer[i] !== b.buffer[i]) return false;
  }
  return true;
};

export const createSnapshot = (state: VimState): VimState => ({
  buffer: [...state.buffer],
  cursor: { ...state.cursor },
  mode: state.mode,
  visualAnchor: state.visualAnchor ? { ...state.visualAnchor } : null,
  commandLine: state.commandLine,
  commandStatus: state.commandStatus,
  pendingOperator: state.pendingOperator,
  pendingReplace: state.pendingReplace,
  pendingFind: state.pendingFind,
  pendingTextObject: state.pendingTextObject,
  pendingSearch: state.pendingSearch,
  pendingG: state.pendingG,
  lastSearch: state.lastSearch,
  lastCommand: state.lastCommand,
  history: [],
  historyIndex: -1,
  register: state.register,
  yankRegister: state.yankRegister,
  registers: { ...state.registers },
  pendingRegister: state.pendingRegister,
  selectedRegister: state.selectedRegister,
  count: state.count,
  lastFind: state.lastFind,
  lastChange: state.lastChange ? [...state.lastChange] : null,
  changeRecording: state.changeRecording ? [...state.changeRecording] : null,
  lastChangeCount: state.lastChangeCount,
  recordingCount: state.recordingCount,
  insertStart: state.insertStart ? { ...state.insertStart } : null,
  lastChangeCursor: state.lastChangeCursor ? { ...state.lastChangeCursor } : null,
  lastChangeInsertCursor: state.lastChangeInsertCursor ? { ...state.lastChangeInsertCursor } : null,
  lastChangeInsertStart: state.lastChangeInsertStart ? { ...state.lastChangeInsertStart } : null,
  recordingExitCursor: state.recordingExitCursor ? { ...state.recordingExitCursor } : null,
  recordingInsertCursor: state.recordingInsertCursor ? { ...state.recordingInsertCursor } : null,
  pendingMacroRecord: state.pendingMacroRecord,
  pendingMacroReplay: state.pendingMacroReplay,
  macroRecordingRegister: state.macroRecordingRegister,
  macroRecording: state.macroRecording ? [...state.macroRecording] : [],
  macros: Object.fromEntries(
    Object.entries(state.macros).map(([name, keys]) => [name, keys ? [...keys] : keys])
  ),
  lastMacroRegister: state.lastMacroRegister,
  marks: Object.fromEntries(
    Object.entries(state.marks).map(([name, cursor]) => [name, cursor ? { ...cursor } : cursor])
  ),
  pendingMarkSet: state.pendingMarkSet,
  pendingMarkJump: state.pendingMarkJump,
  previousJumpCursor: state.previousJumpCursor ? { ...state.previousJumpCursor } : null,
  jumpList: state.jumpList.map(cursor => ({ ...cursor })),
  jumpIndex: state.jumpIndex,
  changeList: state.changeList.map(cursor => ({ ...cursor })),
  changeIndex: state.changeIndex,
});

const appendSnapshot = (
  state: VimState,
  snapshot: VimState,
  force = false
): { history: VimState[]; historyIndex: number } => {
  const newHistory = state.history.slice(0, state.historyIndex + 1);
  const last = newHistory[newHistory.length - 1];
  if (!force && last && isSameSnapshot(last, snapshot)) {
    return { history: newHistory, historyIndex: newHistory.length - 1 };
  }
  newHistory.push(snapshot);

  if (newHistory.length > MAX_HISTORY) {
    newHistory.shift();
  }

  return { history: newHistory, historyIndex: newHistory.length - 1 };
};

export const pushHistory = (state: VimState, force = false): VimState => {
  const snapshot = createSnapshot(state);
  const latest = state.history[state.historyIndex];
  if (!force && latest && isSameSnapshot(latest, snapshot)) {
    return state;
  }
  const { history, historyIndex } = appendSnapshot(state, snapshot, force);
  return { ...state, history, historyIndex };
};

export const clearPendingStates = (state: VimState): VimState => ({
  ...state,
  pendingOperator: null,
  pendingReplace: false,
  pendingFind: null,
  pendingTextObject: null,
  pendingSearch: null,
  pendingG: false,
  visualAnchor: null,
  commandLine: '',
  pendingRegister: false,
  selectedRegister: null,
  pendingMacroRecord: false,
  pendingMacroReplay: false,
  pendingMarkSet: false,
  pendingMarkJump: null,
  count: '',
  changeRecording: null,
  recordingCount: null,
  recordingExitCursor: null,
  recordingInsertCursor: null,
});

export const startRecording = (state: VimState, key: string, ctrlKey: boolean): VimState => {
  const recording: KeyPress[] = [{ key, ctrlKey }];
  return {
    ...state,
    changeRecording: recording,
    recordingCount: getCount(state),
    recordingExitCursor: null,
    recordingInsertCursor: null,
  };
};

export const recordKey = (state: VimState, key: string, ctrlKey: boolean): VimState => {
  if (!state.changeRecording) return state;
  return {
    ...state,
    changeRecording: [...state.changeRecording, { key, ctrlKey }],
  };
};

export const finishRecording = (state: VimState): VimState => {
  if (!state.changeRecording) return state;
  const exitCursor = state.recordingExitCursor ?? state.cursor;
  const insertCursor = state.recordingInsertCursor ?? state.cursor;
  const finalizedState = {
    ...state,
    lastChange: state.changeRecording,
    lastChangeCount: state.recordingCount ?? 1,
    changeRecording: null,
    recordingCount: null,
    lastChangeCursor: exitCursor,
    lastChangeInsertCursor: insertCursor,
    lastChangeInsertStart: state.insertStart ? { ...state.insertStart } : null,
    recordingExitCursor: null,
    recordingInsertCursor: null,
  };

  const snapshot = createSnapshot(finalizedState);
  const { history, historyIndex } = appendSnapshot(finalizedState, snapshot);

  return { ...finalizedState, history, historyIndex };
};
