import type { VimState, VimAction, Motion, KeyPress, Operator, OperatorMotion, TextObject, Cursor, RegisterName, LowercaseLetter, Command, SearchState } from './types';
import { getMotionTarget, findCharOnLine } from './motions';
import {
  applyOperatorWithMotion,
  applyOperatorWithFindMotion,
  applyOperatorWithTextObjectCount,
  buildRegisterText,
  deleteRange,
  isTextObjectMotion
} from './operators';
import { clampCursor, isWhitespace, isWordChar } from './utils';
import {
  clearPendingStates,
  finishRecording,
  getCount,
  pushHistory,
  recordKey,
  startRecording,
} from './stateUtils';
import {
  applyCaseOperatorLinewise,
  applyCaseOperatorWithMotion,
  applyCaseRange,
} from './caseOperators';
import { executeExCommand } from './exCommands';

const LOWERCASE_LETTERS = 'abcdefghijklmnopqrstuvwxyz';

const firstNonBlankCol = (lineText: string): number => {
  const idx = lineText.search(/\S/);
  return idx === -1 ? 0 : idx;
};

const isLowercaseLetter = (key: string): key is LowercaseLetter =>
  key.length === 1 && LOWERCASE_LETTERS.includes(key);

const isRegisterName = (key: string): key is RegisterName =>
  isLowercaseLetter(key) || key === '"' || key === '0' || key === '_' || key === '+' || key === '*';

const clearSelectedRegister = (state: VimState): VimState => ({
  ...state,
  pendingRegister: false,
  selectedRegister: null
});

const getReadableRegister = (state: VimState): string => {
  const name = state.selectedRegister;
  if (!name || name === '"') return state.register;
  if (name === '0') return state.yankRegister || state.registers['0'] || '';
  if (name === '_') return '';
  return state.registers[name] ?? '';
};

const applyRegisterWrite = (
  before: VimState,
  after: VimState,
  text: string,
  source: 'yank' | 'delete'
): VimState => {
  const name = before.selectedRegister;
  if (name === '_') {
    return {
      ...after,
      register: before.register,
      yankRegister: before.yankRegister,
      registers: { ...before.registers },
      pendingRegister: false,
      selectedRegister: null
    };
  }

  const registers = { ...after.registers };
  if (name && name !== '"' && name !== '0') {
    registers[name] = text;
  }
  if (source === 'yank') {
    registers['0'] = text;
  }

  return {
    ...after,
    register: text,
    yankRegister: source === 'yank' ? text : after.yankRegister,
    registers,
    pendingRegister: false,
    selectedRegister: null
  };
};

const pushJump = (state: VimState, from: Cursor, to: Cursor): VimState => {
  if (from.line === to.line && from.col === to.col) return { ...state, cursor: to };
  const trimmed = state.jumpList.slice(0, state.jumpIndex + 1);
  const last = trimmed[trimmed.length - 1];
  const nextList = last && last.line === from.line && last.col === from.col
    ? trimmed
    : [...trimmed, { ...from }];
  return {
    ...state,
    cursor: to,
    previousJumpCursor: { ...from },
    jumpList: [...nextList, { ...to }],
    jumpIndex: nextList.length
  };
};

const jumpToMark = (state: VimState, name: LowercaseLetter, linewise: boolean): VimState => {
  const mark = state.marks[name];
  if (!mark) return { ...state, pendingMarkJump: null };
  const target = linewise
    ? { line: mark.line, col: firstNonBlankCol(state.buffer[mark.line] ?? '') }
    : { ...mark };
  return {
    ...pushJump(state, state.cursor, target),
    pendingMarkJump: null,
    count: '',
    lastCommand: { type: 'move' }
  };
};

const pushChangePosition = (state: VimState, cursor: Cursor): VimState => {
  const trimmed = state.changeList.slice(0, state.changeIndex + 1);
  const last = trimmed[trimmed.length - 1];
  const nextList = last && last.line === cursor.line && last.col === cursor.col
    ? trimmed
    : [...trimmed, { ...cursor }];
  return {
    ...state,
    changeList: nextList,
    changeIndex: nextList.length - 1
  };
};

const moveChangelist = (state: VimState, direction: -1 | 1): VimState => {
  if (!state.changeList.length) return state;
  const nextIndex = Math.max(0, Math.min(state.changeList.length - 1, state.changeIndex + direction));
  return {
    ...state,
    cursor: { ...state.changeList[nextIndex] },
    changeIndex: nextIndex,
    count: '',
    pendingG: false,
    lastCommand: { type: 'move' }
  };
};

const buildTextObjectMotion = (prefix: 'i' | 'a', key: string): TextObject | null => {
  const mapping: Record<string, string> = {
    'w': 'w',
    'p': 'p',
    '(': '(',
    ')': '(',
    '{': '{',
    '}': '{',
    '[': '[',
    ']': '[',
    '"': '"',
    "'": "'",
    '`': '`'
  };
  const mapped = mapping[key];
  if (!mapped) return null;
  return `${prefix}${mapped}` as TextObject;
};

const findPatternFromCursor = (
  buffer: string[],
  pattern: string,
  cursor: { line: number; col: number },
  direction: 'forward' | 'backward'
): { line: number; col: number } | null => {
  if (!pattern) return null;

  if (direction === 'forward') {
    // Search from cursor to end of buffer
    for (let line = cursor.line; line < buffer.length; line++) {
      const lineText = buffer[line];
      const startCol = line === cursor.line ? cursor.col + 1 : 0;
      const idx = lineText.indexOf(pattern, startCol);
      if (idx !== -1) return { line, col: idx };
    }
    // Wrap around: search from start to cursor line
    for (let line = 0; line < cursor.line; line++) {
      const lineText = buffer[line];
      const idx = lineText.indexOf(pattern, 0);
      if (idx !== -1) return { line, col: idx };
    }
    // Check cursor line from start to cursor position
    const cursorLineText = buffer[cursor.line];
    const idx = cursorLineText.indexOf(pattern, 0);
    if (idx !== -1 && idx <= cursor.col) return { line: cursor.line, col: idx };
  } else {
    // Search from cursor to start of buffer
    for (let line = cursor.line; line >= 0; line--) {
      const lineText = buffer[line];
      const startCol = line === cursor.line ? Math.max(0, cursor.col - 1) : lineText.length - 1;
      if (startCol < 0) continue;
      const segment = lineText.slice(0, startCol + 1);
      const idx = segment.lastIndexOf(pattern);
      if (idx !== -1) return { line, col: idx };
    }
    // Wrap around: search from end to cursor line
    for (let line = buffer.length - 1; line > cursor.line; line--) {
      const lineText = buffer[line];
      const idx = lineText.lastIndexOf(pattern);
      if (idx !== -1) return { line, col: idx };
    }
    // Check cursor line from end to cursor position
    const cursorLineText = buffer[cursor.line];
    const idx = cursorLineText.lastIndexOf(pattern);
    if (idx !== -1 && idx >= cursor.col) return { line: cursor.line, col: idx };
  }

  return null;
};

const getWordUnderCursor = (buffer: string[], cursor: { line: number; col: number }): { word: string; startCol: number } | null => {
  const lineText = buffer[cursor.line] ?? '';
  if (!lineText.length) return null;
  const idx = Math.min(cursor.col, Math.max(0, lineText.length - 1));

  let targetIdx = idx;
  if (!isWordChar(lineText[targetIdx])) {
    let right = idx;
    while (right < lineText.length && !isWordChar(lineText[right])) {
      right++;
    }
    if (right < lineText.length && isWordChar(lineText[right])) {
      targetIdx = right;
    } else {
      let left = idx - 1;
      while (left >= 0 && !isWordChar(lineText[left])) {
        left--;
      }
      if (left >= 0 && isWordChar(lineText[left])) {
        targetIdx = left;
      } else {
        return null;
      }
    }
  }

  const targetIsWord = isWordChar(lineText[targetIdx]);
  let start = targetIdx;
  while (start > 0) {
    const char = lineText[start - 1];
    if (isWhitespace(char)) break;
    const charIsWord = isWordChar(char);
    if (charIsWord !== targetIsWord) break;
    start--;
  }

  let end = targetIdx;
  while (end < lineText.length) {
    const char = lineText[end];
    if (isWhitespace(char)) break;
    const charIsWord = isWordChar(char);
    if (charIsWord !== targetIsWord) break;
    end++;
  }

  const word = lineText.slice(start, end);
  if (!word.length) return null;
  return { word, startCol: start };
};

// Helper: find the start of the current word (or last non-whitespace run) from a column
const findWordStart = (line: string, col: number): number => {
  if (!line.length) return 0;
  let idx = Math.min(col, Math.max(0, line.length - 1));
  // If we're on whitespace, move left to the previous non-whitespace (if any)
  while (idx > 0 && isWhitespace(line[idx])) {
    idx--;
  }
  while (idx > 0 && !isWhitespace(line[idx - 1])) {
    idx--;
  }
  return idx;
};

const sliceText = (buffer: string[], start: Cursor, end: Cursor): string => {
  if (start.line > end.line || (start.line === end.line && start.col > end.col)) {
    return sliceText(buffer, end, start);
  }
  if (start.line === end.line) {
    return (buffer[start.line] ?? '').slice(start.col, end.col);
  }
  const parts: string[] = [];
  parts.push((buffer[start.line] ?? '').slice(start.col));
  for (let line = start.line + 1; line < end.line; line++) {
    parts.push(buffer[line] ?? '');
  }
  parts.push((buffer[end.line] ?? '').slice(0, end.col));
  return parts.join('\n');
};

const insertTextAt = (buffer: string[], pos: Cursor, text: string): { buffer: string[]; cursor: Cursor } => {
  const lines = text.split('\n');
  const currentLine = buffer[pos.line] ?? '';
  const before = currentLine.slice(0, pos.col);
  const after = currentLine.slice(pos.col);

  if (lines.length === 1) {
    const newLine = before + text + after;
    const newBuffer = [...buffer];
    newBuffer[pos.line] = newLine;
    return { buffer: newBuffer, cursor: { line: pos.line, col: pos.col + text.length } };
  }

  const firstLine = before + lines[0];
  const lastLine = lines[lines.length - 1] + after;
  const middle = lines.slice(1, -1);
  const replacement = [firstLine, ...middle, lastLine];
  const newBuffer = [...buffer];
  newBuffer.splice(pos.line, 1, ...replacement);
  const newLineIdx = pos.line + replacement.length - 1;
  const newCol = lines[lines.length - 1].length;
  return { buffer: newBuffer, cursor: { line: newLineIdx, col: newCol } };
};

const isSameContent = (a: VimState, b: VimState): boolean => {
  if (a.mode !== b.mode) return false;
  if (a.buffer.length !== b.buffer.length) return false;
  for (let i = 0; i < a.buffer.length; i++) {
    if (a.buffer[i] !== b.buffer[i]) return false;
  }
  return true;
};

const applyOperatorMotion = (state: VimState, operator: Operator, motion: OperatorMotion): VimState => {
  const count = getCount(state);

  if (motion === '$' && count > 1) {
    const targetLine = state.cursor.line + count - 1;
    if (targetLine >= state.buffer.length) {
      return {
        ...state,
        count: '',
        pendingOperator: null,
        pendingTextObject: null
      };
    }
    const targetCol = state.buffer[targetLine]?.length ?? 0;
    const range = {
      start: state.cursor,
      end: { line: targetLine, col: targetCol }
    };
    const registerText = buildRegisterText(state.buffer, range);

    if (operator === 'y') {
      const yankedState: VimState = {
        ...state,
        register: registerText,
        pendingOperator: null,
        pendingTextObject: null,
        count: '',
        lastCommand: { type: 'yank' },
        changeRecording: null,
        recordingCount: null
      };
      return applyRegisterWrite(state, yankedState, registerText, 'yank');
    }

    const stateWithHistory = pushHistory(state);
    const { buffer, cursor } = deleteRange(stateWithHistory.buffer, range);
    let nextState: VimState = {
      ...stateWithHistory,
      buffer,
      cursor,
      register: registerText,
      pendingOperator: null,
      pendingTextObject: null,
      mode: operator === 'c' ? 'insert' : 'normal',
      insertCol: operator === 'c' ? cursor.col : undefined,
      insertStart: operator === 'c' ? { ...cursor } : state.insertStart,
      count: '',
      recordingExitCursor: operator === 'd' ? cursor : stateWithHistory.recordingExitCursor,
      lastCommand: { type: 'delete-range', operator, motion: '$' }
    };

    if (operator === 'd') {
      nextState = finishRecording(nextState);
    }

    return applyRegisterWrite(state, nextState, registerText, 'delete');
  }

  if ((motion === 'w' || motion === 'W') && count > 1) {
    let tempCursor = state.cursor;
    let tempState = state;
    for (let i = 0; i < count; i++) {
      tempCursor = getMotionTarget(tempState, motion as Motion, true);
      tempState = { ...tempState, cursor: tempCursor };
    }

    let rangeStart = state.cursor;
    let rangeEnd = tempCursor;
    if (rangeStart.line > rangeEnd.line || (rangeStart.line === rangeEnd.line && rangeStart.col > rangeEnd.col)) {
      [rangeStart, rangeEnd] = [rangeEnd, rangeStart];
    }
    if (rangeStart.line !== rangeEnd.line && rangeStart.col === 0) {
      const targetLineText = state.buffer[rangeEnd.line] ?? '';
      const startsWithWhitespace = targetLineText.startsWith(' ') || targetLineText.startsWith('\t');
      if (startsWithWhitespace) {
        rangeEnd = { line: rangeEnd.line, col: 0 };
      }
    }

    const range = { start: rangeStart, end: rangeEnd };

    const registerText = buildRegisterText(state.buffer, range);
    if (operator === 'y') {
      const yankedState: VimState = {
        ...state,
        register: registerText,
        pendingOperator: null,
        pendingTextObject: null,
        count: '',
        lastCommand: { type: 'yank' },
        changeRecording: null,
        recordingCount: null
      };
      return applyRegisterWrite(state, yankedState, registerText, 'yank');
    }

    const stateWithHistory = pushHistory(state);
    const { buffer, cursor } = deleteRange(stateWithHistory.buffer, range);
    let nextState: VimState = {
      ...stateWithHistory,
      buffer,
      cursor,
      register: registerText,
      pendingOperator: null,
      pendingTextObject: null,
      mode: operator === 'c' ? 'insert' : 'normal',
      insertCol: operator === 'c' ? cursor.col : undefined,
      count: '',
      recordingExitCursor: operator === 'd' ? cursor : stateWithHistory.recordingExitCursor,
      lastCommand: { type: 'delete-range', operator, motion }
    };

    if (operator === 'd') {
      nextState = finishRecording(nextState);
    }

    return applyRegisterWrite(state, nextState, registerText, 'delete');
  }

  if (isTextObjectMotion(motion) && count > 1) {
    const combinedState = applyOperatorWithTextObjectCount(state, operator, motion as TextObject, count);
    return { ...combinedState, count: '', pendingTextObject: null };
  }

  let resultState = state;
  for (let i = 0; i < count; i++) {
    resultState = applyOperatorWithMotion(resultState, operator, motion);
    if (operator === 'y') break;
  }

  if (resultState.recordingExitCursor == null) {
    resultState = { ...resultState, recordingExitCursor: { ...resultState.cursor } };
  }

  if (operator === 'd') {
    resultState = finishRecording(resultState);
  } else if (operator === 'y') {
    resultState = { ...resultState, changeRecording: null, recordingCount: null };
  }

  resultState = { ...resultState, count: '', pendingTextObject: null };
  if (operator === 'y' || operator === 'd' || operator === 'c') {
    return applyRegisterWrite(state, resultState, resultState.register, operator === 'y' ? 'yank' : 'delete');
  }

  return resultState;
};

// Helper: replay keys for . command
const replayKeys = (state: VimState, keys: KeyPress[], countForChange: number): VimState => {
  let currentState = { ...state, count: countForChange > 1 ? String(countForChange) : '' };
  for (const keyPress of keys) {
    currentState = vimReducer(currentState, {
      type: 'KEYDOWN',
      payload: { key: keyPress.key, ctrlKey: keyPress.ctrlKey },
    });
    // Preserve the lastChange from before replay
    currentState = {
      ...currentState,
      lastChange: state.lastChange,
      lastChangeCount: state.lastChangeCount
    };
  }
  return currentState;
};

const replayMacro = (state: VimState, register: LowercaseLetter): VimState => {
  const keys = state.macros[register];
  if (!keys?.length) {
    return { ...state, pendingMacroReplay: false, count: '' };
  }

  const count = getCount(state);
  let currentState: VimState = {
    ...state,
    pendingMacroReplay: false,
    count: '',
    selectedRegister: null,
    pendingRegister: false,
    lastMacroRegister: register
  };

  for (let repeatIndex = 0; repeatIndex < count; repeatIndex++) {
    for (const keyPress of keys) {
      currentState = vimReducer(currentState, {
        type: 'KEYDOWN',
        payload: { key: keyPress.key, ctrlKey: keyPress.ctrlKey },
      });
      currentState = {
        ...currentState,
        pendingMacroReplay: false,
        lastMacroRegister: register
      };
    }
  }

  return currentState;
};

const handleCommandKey = (state: VimState, key: string): VimState => {
  if (key === 'Escape') {
    return {
      ...state,
      mode: 'normal',
      commandLine: '',
      lastCommand: { type: 'mode-switch', to: 'normal' }
    };
  }

  if (key === 'Enter') {
    return executeExCommand(state, state.commandLine);
  }

  if (key === 'Backspace') {
    return {
      ...state,
      commandLine: state.commandLine.slice(0, -1)
    };
  }

  if (key.length === 1) {
    return {
      ...state,
      commandLine: `${state.commandLine}${key}`
    };
  }

  return state;
};

const getViewportHeight = (state: VimState): number => Math.max(1, state.viewportHeight || 10);

const maxViewportTop = (state: VimState): number =>
  Math.max(0, state.buffer.length - getViewportHeight(state));

const clampViewportTop = (state: VimState, top: number): number =>
  Math.max(0, Math.min(maxViewportTop(state), top));

const cursorAtLine = (state: VimState, line: number): Cursor => {
  const targetLine = Math.max(0, Math.min(state.buffer.length - 1, line));
  return clampCursor(
    { line: targetLine, col: firstNonBlankCol(state.buffer[targetLine] ?? '') },
    state.buffer
  );
};

const applyScreenScroll = (state: VimState, direction: 1 | -1, amount: number): VimState => {
  const nextViewportTop = clampViewportTop(state, state.viewportTop + direction * amount);
  const nextLine = Math.max(0, Math.min(state.buffer.length - 1, state.cursor.line + direction * amount));
  return {
    ...state,
    cursor: clampCursor({ line: nextLine, col: state.cursor.col }, state.buffer),
    viewportTop: nextViewportTop,
    count: '',
    pendingZ: false,
    lastCommand: { type: 'move' }
  };
};

const applyViewportPlacement = (state: VimState, placement: 'top' | 'middle' | 'bottom'): VimState => {
  const height = getViewportHeight(state);
  const rawTop = placement === 'top'
    ? state.cursor.line
    : placement === 'bottom'
      ? state.cursor.line - height + 1
      : state.cursor.line - Math.floor(height / 2);
  return {
    ...state,
    viewportTop: clampViewportTop(state, rawTop),
    pendingZ: false,
    count: '',
    lastCommand: { type: 'move' }
  };
};

const applyScreenLineJump = (state: VimState, key: 'H' | 'M' | 'L'): VimState => {
  const height = getViewportHeight(state);
  const line = key === 'H'
    ? state.viewportTop
    : key === 'M'
      ? state.viewportTop + Math.floor(height / 2)
      : state.viewportTop + height - 1;
  const cursor = cursorAtLine(state, line);
  return {
    ...pushJump(state, state.cursor, cursor),
    count: '',
    lastCommand: { type: 'move' }
  };
};

const applyPaste = (state: VimState, before: boolean): VimState => {
  const registerText = getReadableRegister(state);
  if (!registerText) return { ...clearSelectedRegister(state), count: '' };

  const count = getCount(state);
  const register = registerText;
  const stateWithHistory = pushHistory(clearSelectedRegister(state));
  const stateWithRecording = startRecording(stateWithHistory, before ? 'P' : 'p', false);

  const pasteOnce = (
    currentBuffer: string[],
    currentCursor: { line: number; col: number },
    placeCursorAfter: boolean
  ): { buffer: string[]; cursor: { line: number; col: number } } => {
    const isLinewise = register.endsWith('\n');

    if (isLinewise) {
      const content = register.slice(0, -1);
      const lines = content.split('\n');
      const newBuffer = [...currentBuffer];
      const insertLine = before ? currentCursor.line : currentCursor.line + 1;
      newBuffer.splice(insertLine, 0, ...lines);
      const newCursorLine = Math.min(insertLine, newBuffer.length - 1);
      return { buffer: newBuffer, cursor: { line: newCursorLine, col: 0 } };
    }

    if (register.includes('\n')) {
      const parts = register.split('\n');
      const lineText = currentBuffer[currentCursor.line] ?? '';
      const insertCol = Math.min(before ? currentCursor.col : currentCursor.col + 1, lineText.length);
      const head = lineText.slice(0, insertCol) + (parts[0] ?? '');
      const tail = lineText.slice(insertCol);
      const mid = parts.slice(1, -1);
      const last = parts[parts.length - 1] ?? '';
      const newBuffer = [...currentBuffer];
      newBuffer[currentCursor.line] = head;
      newBuffer.splice(currentCursor.line + 1, 0, ...mid, last + tail);

      let cursorLine = currentCursor.line;
      let cursorText: string | undefined;
      if (parts[0] !== '') {
        cursorLine = currentCursor.line;
        cursorText = head;
      } else if (mid.length > 0) {
        cursorLine = currentCursor.line + 1;
        cursorText = mid[0];
      } else {
        cursorLine = currentCursor.line + 1;
        cursorText = last + tail;
      }
      let cursorCol;
      if (parts[0] !== '') {
        cursorCol = Math.max(0, insertCol + (parts[0]?.length ?? 0) - 1);
        if (before) {
          cursorCol = insertCol;
        }
      } else {
        const firstNonBlank = cursorText?.search(/\S/) ?? -1;
        cursorCol = firstNonBlank >= 0 ? firstNonBlank : Math.max(0, (cursorText?.length ?? 1) - 1);
      }
      return { buffer: newBuffer, cursor: { line: cursorLine, col: cursorCol } };
    }

    const lineText = currentBuffer[currentCursor.line] ?? '';
    const insertCol = before ? currentCursor.col : Math.min(currentCursor.col + 1, lineText.length);
    const newLine = lineText.slice(0, insertCol) + register + lineText.slice(insertCol);
    const newBuffer = [...currentBuffer];
    newBuffer[currentCursor.line] = newLine;
    const lastInsertedCol = insertCol + register.length - 1;
    const nextCol = placeCursorAfter
      ? Math.min(lastInsertedCol + 1, Math.max(0, newLine.length - 1))
      : lastInsertedCol;
    return {
      buffer: newBuffer,
      cursor: { ...currentCursor, col: nextCol }
    };
  };

  let workingBuffer = stateWithRecording.buffer;
  let workingCursor = stateWithRecording.cursor;
  const placeAfterFirst = count > 1;
  for (let i = 0; i < count; i++) {
    const result = pasteOnce(workingBuffer, workingCursor, placeAfterFirst && i === 0);
    workingBuffer = result.buffer;
    workingCursor = result.cursor;
  }

  const finished = finishRecording({
    ...stateWithRecording,
    buffer: workingBuffer,
    cursor: workingCursor
  });

  return {
    ...finished,
    count: '',
    lastCommand: { type: 'paste', before }
  };
};

const handleInsertKey = (state: VimState, key: string, ctrlKey: boolean): VimState => {
  const { buffer, cursor } = state;

  if (key === 'Escape') {
    const latestSnapshot = state.history[state.historyIndex];
    const hasBufferChanged = latestSnapshot
      ? latestSnapshot.buffer.length !== buffer.length || latestSnapshot.buffer.some((line, idx) => line !== buffer[idx])
      : true;
    const stateToFinish = hasBufferChanged && state.changeRecording
      ? recordKey(state, key, ctrlKey || false)
      : state;
    const repeatCount = state.recordingCount ?? 1;
    const firstRecordingKey = state.changeRecording?.[0]?.key;
    const startedWithOpen = firstRecordingKey === 'o' || firstRecordingKey === 'O';
    const startedWithPureInsert = firstRecordingKey === 'i' || firstRecordingKey === 'I' || firstRecordingKey === 'a' || firstRecordingKey === 'A' || startedWithOpen;
    const effectiveRepeat = startedWithPureInsert ? repeatCount : 1;
    const insertAnchor = state.insertStart ?? { line: cursor.line, col: state.insertCol ?? cursor.col };
    let workingBuffer = stateToFinish.buffer;
    let insertCursor = cursor;
    let insertCol = state.insertCol ?? cursor.col;

    if (hasBufferChanged && effectiveRepeat > 1) {
      const insertedText = sliceText(workingBuffer, insertAnchor, insertCursor);
      if (insertedText.length > 0) {
        if (startedWithOpen) {
          const baseLine = insertAnchor.line;
          for (let i = 1; i < effectiveRepeat; i++) {
            const targetLine = baseLine + i;
            if (targetLine < workingBuffer.length) {
              workingBuffer = [...workingBuffer];
              workingBuffer[targetLine] = insertedText;
            } else {
              const nextBuffer = [...workingBuffer];
              nextBuffer.splice(targetLine, 0, insertedText);
              workingBuffer = nextBuffer;
            }
          }
          insertCursor = { line: baseLine + effectiveRepeat - 1, col: insertedText.length };
          insertCol = insertedText.length;
        } else {
          for (let i = 1; i < effectiveRepeat; i++) {
            const result = insertTextAt(workingBuffer, insertCursor, insertedText);
            workingBuffer = result.buffer;
            insertCursor = result.cursor;
          }
          insertCol = insertCursor.col;
        }
      }
    }

    // In insert mode, cursor.col = insertCol (insertion point position)
    // When exiting, move cursor back to last character position
    const lineLen = workingBuffer[insertCursor.line].length;
    const exitCol = insertCol > 0 ? Math.min(insertCol - 1, lineLen - 1) : 0;
    const exitCursor = { ...insertCursor, col: Math.max(0, exitCol) };
    const stateWithCursors = {
      ...stateToFinish,
      buffer: workingBuffer,
      cursor: insertCursor,
      insertCol,
      recordingExitCursor: exitCursor,
      recordingInsertCursor: insertCursor
    };
    const stateAfterRecording = hasBufferChanged
      ? finishRecording({ ...stateWithCursors, mode: 'normal', cursor: exitCursor })
      : { ...state, changeRecording: null, recordingCount: null, recordingExitCursor: null, recordingInsertCursor: null };
    const lastCommand: Command = hasBufferChanged
      ? stateAfterRecording.lastCommand ?? { type: 'mode-switch', to: 'normal' }
      : { type: 'mode-switch', to: 'normal' };
    return {
      ...stateAfterRecording,
      mode: 'normal',
      cursor: exitCursor,
      insertCol: undefined,  // Clear insertCol when exiting Insert mode
      insertStart: null,
      lastCommand
    };
  }

  const stateAfterRecord = recordKey(state, key, ctrlKey || false);

  if (key === 'Backspace') {
    const lineText = stateAfterRecord.buffer[cursor.line];
    const insertCol = stateAfterRecord.insertCol ?? cursor.col;
    if (insertCol > 0) {
      const newLine = lineText.slice(0, insertCol - 1) + lineText.slice(insertCol);
      const newBuffer = [...stateAfterRecord.buffer];
      newBuffer[cursor.line] = newLine;
      const newInsertCol = insertCol - 1;
      return {
        ...stateAfterRecord,
        buffer: newBuffer,
        cursor: { ...cursor, col: newInsertCol },
        insertCol: newInsertCol
      };
    } else if (cursor.line > 0) {
      const prevLine = stateAfterRecord.buffer[cursor.line - 1];
      const newBuffer = [...stateAfterRecord.buffer];
      newBuffer[cursor.line - 1] = prevLine + lineText;
      newBuffer.splice(cursor.line, 1);
      const newInsertCol = prevLine.length;
      return {
        ...stateAfterRecord,
        buffer: newBuffer,
        cursor: { line: cursor.line - 1, col: newInsertCol },
        insertCol: newInsertCol
      };
    }
    return stateAfterRecord;
  }

  if (key === 'Enter') {
    const lineText = stateAfterRecord.buffer[cursor.line];
    const insertCol = stateAfterRecord.insertCol ?? cursor.col;
    const before = lineText.slice(0, insertCol);
    const after = lineText.slice(insertCol);
    const newBuffer = [...stateAfterRecord.buffer];
    newBuffer[cursor.line] = before;
    newBuffer.splice(cursor.line + 1, 0, after);
    return {
      ...stateAfterRecord,
      buffer: newBuffer,
      cursor: { line: cursor.line + 1, col: 0 },
      insertCol: 0
    };
  }

  if (key.length === 1 && !ctrlKey) {
    const lineText = stateAfterRecord.buffer[cursor.line];
    const insertCol = stateAfterRecord.insertCol ?? cursor.col;
    const newLine = lineText.slice(0, insertCol) + key + lineText.slice(insertCol);
    const newBuffer = [...stateAfterRecord.buffer];
    newBuffer[cursor.line] = newLine;
    const newInsertCol = insertCol + 1;
    return {
      ...stateAfterRecord,
      buffer: newBuffer,
      cursor: { ...cursor, col: newInsertCol },
      insertCol: newInsertCol
    };
  }

  return stateAfterRecord;
};

const handleNormalKey = (state: VimState, key: string, ctrlKey: boolean): VimState => {
  const { buffer, cursor, pendingOperator, pendingReplace } = state;

  if (key === 'Escape') {
    return clearPendingStates(state);
  }

  if (key === ':' && !pendingOperator && !pendingReplace && !ctrlKey) {
    return {
      ...clearPendingStates(state),
      mode: 'command',
      commandLine: '',
      commandStatus: null,
      lastCommand: { type: 'mode-switch', to: 'command' }
    };
  }

  if (state.pendingZ) {
    if (key === 'z') return applyViewportPlacement(state, 'middle');
    if (key === 't') return applyViewportPlacement(state, 'top');
    if (key === 'b') return applyViewportPlacement(state, 'bottom');
    return { ...state, pendingZ: false, count: '' };
  }

  if (key === 'z' && !ctrlKey && !pendingOperator && !pendingReplace) {
    return {
      ...clearPendingStates(state),
      pendingZ: true
    };
  }

  if ((key === 'd' || key === 'u' || key === 'f' || key === 'b') && ctrlKey) {
    const count = state.count ? getCount(state) : 0;
    const halfPage = Math.max(1, Math.floor(getViewportHeight(state) / 2));
    const fullPage = getViewportHeight(state);
    const amount = count || (key === 'd' || key === 'u' ? halfPage : fullPage);
    return applyScreenScroll(state, key === 'd' || key === 'f' ? 1 : -1, amount);
  }

  if ((key === 'H' || key === 'M' || key === 'L') && !ctrlKey && !pendingOperator && !pendingReplace) {
    return applyScreenLineJump(state, key);
  }

  if (state.pendingCtrlW) {
    if (key === 'h' || key === 'j' || key === 'k' || key === 'l') {
      return executeExCommand(state, `wincmd ${key}`);
    }
    if (key === 's') {
      return executeExCommand(state, 'split');
    }
    if (key === 'v') {
      return executeExCommand(state, 'vsplit');
    }
    if (key === 'c') {
      return executeExCommand(state, 'close');
    }
    return { ...state, pendingCtrlW: false };
  }

  if (key === 'w' && ctrlKey && !pendingOperator && !pendingReplace) {
    return {
      ...clearPendingStates(state),
      pendingCtrlW: true
    };
  }

  if (state.pendingRegister) {
    if (isRegisterName(key)) {
      return {
        ...state,
        pendingRegister: false,
        selectedRegister: key
      };
    }
    return {
      ...state,
      pendingRegister: false,
      selectedRegister: null
    };
  }

  if (state.pendingMacroRecord) {
    if (isLowercaseLetter(key)) {
      return {
        ...state,
        pendingMacroRecord: false,
        macroRecordingRegister: key,
        macroRecording: []
      };
    }
    return { ...state, pendingMacroRecord: false };
  }

  if (state.macroRecordingRegister && key === 'q' && !ctrlKey) {
    return {
      ...state,
      macros: {
        ...state.macros,
        [state.macroRecordingRegister]: state.macroRecording
      },
      lastMacroRegister: state.macroRecordingRegister,
      macroRecordingRegister: null,
      macroRecording: [],
      count: ''
    };
  }

  if (state.pendingMacroReplay) {
    if (key === '@' && state.lastMacroRegister) {
      return replayMacro(state, state.lastMacroRegister);
    }
    if (isLowercaseLetter(key)) {
      return replayMacro(state, key);
    }
    return { ...state, pendingMacroReplay: false, count: '' };
  }

  if (state.pendingMarkSet) {
    if (isLowercaseLetter(key)) {
      return {
        ...state,
        marks: {
          ...state.marks,
          [key]: { ...state.cursor }
        },
        pendingMarkSet: false,
        count: ''
      };
    }
    return { ...state, pendingMarkSet: false, count: '' };
  }

  if (state.pendingMarkJump) {
    if (key === state.pendingMarkJump && state.previousJumpCursor) {
      return {
        ...pushJump(state, state.cursor, state.previousJumpCursor),
        pendingMarkJump: null,
        count: '',
        lastCommand: { type: 'move' }
      };
    }
    if (isLowercaseLetter(key)) {
      return jumpToMark(state, key, state.pendingMarkJump === "'");
    }
    return { ...state, pendingMarkJump: null, count: '' };
  }

  if (state.pendingSearch) {
    if (key === 'Escape') {
      return { ...state, pendingSearch: null, count: '' };
    }

    if (key === 'Backspace') {
      const pattern = state.pendingSearch.pattern.slice(0, -1);
      return { ...state, pendingSearch: { ...state.pendingSearch, pattern } };
    }

    if (key === 'Enter') {
      const pattern = state.pendingSearch.pattern;
      const direction = state.pendingSearch.direction;
      const match = findPatternFromCursor(buffer, pattern, cursor, direction);
      const lastSearch = { pattern, direction };
      if (match) {
        return {
          ...state,
          cursor: match,
          pendingSearch: null,
          lastSearch,
          count: '',
          lastCommand: { type: 'move' }
        };
      }
      return { ...state, pendingSearch: null, lastSearch, count: '' };
    }

    if (key && key.length === 1 && !ctrlKey) {
      return { ...state, pendingSearch: { ...state.pendingSearch, pattern: state.pendingSearch.pattern + key } };
    }

    return state;
  }

  if (key === '.' && state.lastChange && state.lastChangeCount && !pendingOperator && !pendingReplace) {
    const hasOverrideCount = state.count.length > 0;
    const overrideCount = hasOverrideCount ? getCount(state) : null;
    const firstKey = state.lastChange[0]?.key;
    const insertCommands = new Set(['i', 'I', 'a', 'A', 'o', 'O', 's']);
    const changeCount = overrideCount ?? state.lastChangeCount;
    const secondKey = state.lastChange[1]?.key;

    let replayCursor = state.cursor;
    const lineText = state.buffer[replayCursor.line] ?? '';

    if (firstKey === 'c' && secondKey === '$' && lineText.length > 0) {
      if (replayCursor.col >= lineText.length) {
        replayCursor = { ...replayCursor, col: findWordStart(lineText, replayCursor.col) };
      }
    }

    if (firstKey === 'c' && secondKey === 'w') {
      const currentChar = lineText[replayCursor.col];
      if (isWhitespace(currentChar)) {
        let nextNonWhitespace = replayCursor.col;
        while (nextNonWhitespace < lineText.length && isWhitespace(lineText[nextNonWhitespace])) {
          nextNonWhitespace++;
        }
        if (nextNonWhitespace < lineText.length) {
          replayCursor = { ...replayCursor, col: nextNonWhitespace };
        }
      }
    }

    if (insertCommands.has(firstKey)) {
      if (replayCursor.col < lineText.length - 1 && isWhitespace(lineText[replayCursor.col])) {
        replayCursor = { ...replayCursor, col: replayCursor.col + 1 };
      }
    }

    let resultState = { ...state, cursor: replayCursor };

    resultState = replayKeys(resultState, state.lastChange, changeCount);
    const newLastChangeCount = overrideCount ?? state.lastChangeCount;
    resultState = { ...resultState, lastChangeCount: newLastChangeCount };

    return { ...resultState, count: '' };
  }

  if (state.pendingFind) {
    if (key.length === 1 && !ctrlKey) {
      const lineText = buffer[cursor.line];
      const newCol = findCharOnLine(lineText, cursor.col, key, state.pendingFind);

      if (newCol !== null) {
        // If there's a pending operator, apply it with the find motion
        if (pendingOperator) {
          const resultState = applyOperatorWithFindMotion(state, pendingOperator, newCol);
          return {
            ...resultState,
            lastFind: { type: state.pendingFind, char: key },
            count: ''
          };
        }

        // No operator, just move cursor
        return {
          ...state,
          cursor: { ...cursor, col: newCol },
          pendingFind: null,
          lastFind: { type: state.pendingFind, char: key },
          count: '',
          lastCommand: { type: 'move' }
        };
      }
    }
    return { ...state, pendingFind: null, pendingOperator: null, count: '' };
  }

  if (!pendingOperator && !pendingReplace && !state.pendingFind && /^[1-9]$/.test(key)) {
    return { ...state, count: state.count + key };
  }

  if (key === '"' && !state.pendingG && !pendingOperator && !pendingReplace) {
    return { ...state, pendingRegister: true };
  }

  if (key === 'q' && !ctrlKey && !state.pendingG && !pendingOperator && !pendingReplace) {
    return { ...state, pendingMacroRecord: true };
  }

  if (key === '@' && !ctrlKey && !state.pendingG && !pendingOperator && !pendingReplace) {
    return { ...state, pendingMacroReplay: true };
  }

  if (key === 'm' && !ctrlKey && !state.pendingG && !pendingOperator && !pendingReplace) {
    return { ...state, pendingMarkSet: true };
  }

  if ((key === '`' || key === "'") && !ctrlKey && !state.pendingG && !pendingOperator && !pendingReplace) {
    return { ...state, pendingMarkJump: key };
  }

  if (key === 'o' && ctrlKey) {
    if (state.jumpIndex <= 0) return { ...state, count: '' };
    const nextIndex = state.jumpIndex - 1;
    return {
      ...state,
      cursor: { ...state.jumpList[nextIndex] },
      jumpIndex: nextIndex,
      count: '',
      lastCommand: { type: 'move' }
    };
  }

  if (key === 'i' && ctrlKey) {
    if (state.jumpIndex >= state.jumpList.length - 1) return { ...state, count: '' };
    const nextIndex = state.jumpIndex + 1;
    return {
      ...state,
      cursor: { ...state.jumpList[nextIndex] },
      jumpIndex: nextIndex,
      count: '',
      lastCommand: { type: 'move' }
    };
  }

  // Handle find motion keys (can be used standalone or with operators)
  if (['f', 'F', 't', 'T'].includes(key)) {
    return { ...state, pendingFind: key as 'f' | 'F' | 't' | 'T' };
  }

  if (key === '/' || key === '?') {
    return {
      ...state,
      pendingSearch: { direction: key === '/' ? 'forward' : 'backward', pattern: '' },
      count: ''
    };
  }

  if ((key === '*' || key === '#') && !pendingOperator && !pendingReplace) {
    const wordInfo = getWordUnderCursor(buffer, cursor);
    if (!wordInfo) return state;
    const direction: SearchState['direction'] = key === '*' ? 'forward' : 'backward';
    const match = findPatternFromCursor(buffer, wordInfo.word, cursor, direction);
    const lastSearch: SearchState = { pattern: wordInfo.word, direction };
    if (match) {
      return { ...state, cursor: match, lastSearch, count: '', lastCommand: { type: 'move' } };
    }
    return { ...state, lastSearch, count: '' };
  }

  if ((key === 'n' || key === 'N') && state.lastSearch) {
    const direction = key === 'n'
      ? state.lastSearch.direction
      : state.lastSearch.direction === 'forward'
        ? 'backward'
        : 'forward';
    const match = findPatternFromCursor(buffer, state.lastSearch.pattern, cursor, direction);
    if (match) {
      return { ...state, cursor: match, count: '', lastCommand: { type: 'move' } };
    }
    return { ...state, count: '' };
  }

  if (key === 'u' && !ctrlKey && !pendingReplace && !state.pendingG && !pendingOperator) {
    if (state.historyIndex > 0) {
      const currentSnapshot = state.history[state.historyIndex];
      let targetIndex = state.historyIndex - 1;
      while (targetIndex > 0 && isSameContent(state.history[targetIndex], currentSnapshot)) {
        targetIndex--;
      }
      if (targetIndex < 0) return state;
      const targetState = state.history[targetIndex];
      const useChangeCursor = (state.lastCommand?.type === 'mode-switch')
        || state.lastCommand?.type === 'delete-char'
        || (state.lastCommand && 'operator' in state.lastCommand && state.lastCommand.operator === 'c');
      const undoCursor = useChangeCursor && state.lastChangeCursor ? { ...state.lastChangeCursor } : targetState.cursor;
      return {
        ...targetState,
        cursor: undoCursor,
        history: state.history,
        historyIndex: targetIndex,
        lastChange: state.lastChange,
        lastChangeCount: state.lastChangeCount,
        lastChangeCursor: state.lastChangeCursor,
        lastChangeInsertCursor: state.lastChangeInsertCursor,
        pendingOperator: null,
        pendingReplace: false,
        pendingFind: null,
        pendingTextObject: null,
        pendingSearch: null,
        pendingG: false,
        count: '',
      };
    }
    const resetCursor = { line: state.cursor.line, col: 0 };
    return {
      ...state,
      cursor: resetCursor,
      pendingOperator: null,
      pendingReplace: false,
      pendingFind: null,
      pendingTextObject: null,
      pendingSearch: null,
      pendingG: false,
      count: '',
      changeRecording: null,
      recordingCount: null,
      recordingExitCursor: null,
      recordingInsertCursor: null,
    };
  }

  if (key === 'r' && ctrlKey) {
    if (state.historyIndex < state.history.length - 1) {
      const currentSnapshot = state.history[state.historyIndex];
      let targetIndex = state.historyIndex + 1;
      while (targetIndex < state.history.length - 1 && isSameContent(state.history[targetIndex], currentSnapshot)) {
        targetIndex++;
      }
      const nextState = state.history[targetIndex];
      const cursorForRedo = state.lastChangeCursor
        ? { ...state.lastChangeCursor }
        : state.lastChange
          ? nextState.cursor
          : { line: nextState.cursor.line, col: 0 };
      return {
        ...nextState,
        cursor: cursorForRedo,
        history: state.history,
        historyIndex: targetIndex,
        lastChange: state.lastChange,
        lastChangeCount: state.lastChangeCount,
        lastChangeCursor: state.lastChangeCursor,
        lastChangeInsertCursor: state.lastChangeInsertCursor,
        pendingOperator: null,
        pendingReplace: false,
        pendingFind: null,
        pendingTextObject: null,
        pendingSearch: null,
        pendingG: false,
        count: '',
      };
    }
    return state;
  }

  if (pendingReplace) {
    if (key.length === 1 && !ctrlKey) {
      const lineText = buffer[cursor.line];
      if (cursor.col < lineText.length) {
        const replaceCount = Math.min(getCount(state), lineText.length - cursor.col);
        const stateWithHistory = pushHistory(state);
        const stateWithKey = recordKey(stateWithHistory, key, ctrlKey || false);
        const replaced = key.repeat(replaceCount);
        const newLine = lineText.slice(0, cursor.col) + replaced + lineText.slice(cursor.col + replaceCount);
        const newBuffer = [...buffer];
        newBuffer[cursor.line] = newLine;
        const newCursorCol = Math.max(0, cursor.col + replaceCount - 1);
        const stateFinished = finishRecording({
          ...stateWithKey,
          buffer: newBuffer
        });
        return {
          ...stateFinished,
          pendingReplace: false,
          count: '',
          cursor: { ...cursor, col: newCursorCol },
          lastCommand: { type: 'delete-char' }
        };
      }
    }
    return clearPendingStates(state);
  }

  if (pendingOperator) {
    const operator = pendingOperator;

    if ((pendingOperator === 'd' || pendingOperator === 'y') && key === pendingOperator) {
      const count = getCount(state);
      const startLine = cursor.line;
      const available = buffer.length - startLine;
      if (count > available) {
        return {
          ...state,
          pendingOperator: null,
          pendingTextObject: null,
          count: '',
          changeRecording: null,
          recordingCount: null,
          recordingExitCursor: null,
          recordingInsertCursor: null
        };
      }
      const endLine = startLine + count - 1;
      const linesToProcess = buffer.slice(startLine, endLine + 1);
      const yankedText = linesToProcess.join('\n') + '\n';

      if (pendingOperator === 'y') {
        const yankedState: VimState = {
          ...state,
          register: yankedText,
          pendingOperator: null,
          pendingTextObject: null,
          count: '',
          lastCommand: { type: 'yank' },
          changeRecording: null,
          recordingCount: null,
          recordingExitCursor: null,
          recordingInsertCursor: null
        };
        return applyRegisterWrite(state, yankedState, yankedText, 'yank');
      } else {
        const stateWithHistory = pushHistory(state);
        const stateWithKey = recordKey(stateWithHistory, key, ctrlKey || false);
        const newBuffer = [...buffer];
        newBuffer.splice(startLine, endLine - startLine + 1);
        if (newBuffer.length === 0) newBuffer.push('');
        let newLineIdx = startLine;
        if (newLineIdx >= newBuffer.length) newLineIdx = newBuffer.length - 1;
        const targetLineLen = newBuffer[newLineIdx]?.length ?? 0;
        const preservedCol = Math.min(cursor.col, Math.max(0, targetLineLen - 1));

        const stateFinished = finishRecording({
          ...stateWithKey,
          buffer: newBuffer,
          cursor: { line: newLineIdx, col: preservedCol },
          register: yankedText,
          recordingExitCursor: { ...cursor }
        });

        const deletedState: VimState = {
          ...stateFinished,
          pendingOperator: null,
          pendingTextObject: null,
          count: '',
          lastCommand: { type: 'delete-line' }
        };
        return applyRegisterWrite(state, deletedState, yankedText, 'delete');
      }
    }

    if (state.pendingTextObject) {
      const textObjectMotion = buildTextObjectMotion(state.pendingTextObject, key);
      if (textObjectMotion) {
        const recorded = recordKey(state, key, ctrlKey || false);
        const resultState = applyOperatorMotion(recorded, operator, textObjectMotion);
        return { ...resultState, pendingOperator: null };
      }
      return clearPendingStates(state);
    }

    if (key === 'i' || key === 'a') {
      const recorded = recordKey(state, key, ctrlKey || false);
      return { ...recorded, pendingTextObject: key as 'i' | 'a' };
    }

    if (operator === 'gu' || operator === 'gU' || operator === 'g~') {
      const op = operator;
      // Linewise: guu / gUU / g~~
      if ((op === 'gu' && key === 'u') || (op === 'gU' && key === 'U') || (op === 'g~' && key === '~')) {
        const recorded = recordKey(state, key, ctrlKey || false);
        const applied = applyCaseOperatorLinewise(recorded, op);
        return finishRecording(applied);
      }
      if (['h', 'j', 'k', 'l', 'w', 'b', 'e', 'W', 'B', 'E', '0', '$', '^', '_', '{', '}', '%'].includes(key)) {
        const recorded = recordKey(state, key, ctrlKey || false);
        const applied = applyCaseOperatorWithMotion(recorded, key, op);
        return finishRecording(applied);
      }
      // Unknown follow-up: cancel without recording a change
      return { ...state, pendingOperator: null, count: '', changeRecording: null, recordingCount: null };
    }

    if (['h', 'j', 'k', 'l', 'w', 'b', 'e', '0', '$', '^', '_', 'W', 'B', 'E', '{', '}', '%', 'G'].includes(key)) {
      const recorded = recordKey(state, key, ctrlKey || false);
      const resultState = applyOperatorMotion(recorded, operator, key as Motion);
      return { ...resultState, pendingOperator: null };
    }

    return clearPendingStates(state);
  }

  if (['h', 'j', 'k', 'l', 'w', 'b', 'e', '0', '$', '^', '_', 'W', 'B', 'E'].includes(key)) {
    const count = getCount(state);
    if (key === '$' && count > 1) {
      const targetLine = cursor.line + count - 1;
      if (targetLine >= buffer.length) {
        return {
          ...state,
          count: '',
          lastCommand: { type: 'move', motion: key as Motion }
        };
      }
      const targetLineText = buffer[targetLine] ?? '';
      const targetCol = Math.max(0, targetLineText.length - 1);
      return {
        ...state,
        cursor: { line: targetLine, col: targetCol },
        count: '',
        lastCommand: { type: 'move', motion: key as Motion }
      };
    }

    let newPos = state.cursor;
    let tempState = state;

    for (let i = 0; i < count; i++) {
      newPos = getMotionTarget(tempState, key as Motion);
      tempState = { ...tempState, cursor: newPos };
    }

    return { ...state, cursor: newPos, count: '', lastCommand: { type: 'move', motion: key as Motion } };
  }

  if (key === ';' && state.lastFind) {
    const lineText = buffer[cursor.line];
    const startCol = state.lastFind.type === 'f' || state.lastFind.type === 't'
      ? cursor.col + 1
      : cursor.col - 1;
    const newCol = findCharOnLine(lineText, startCol, state.lastFind.char, state.lastFind.type);

    if (newCol !== null) {
      return {
        ...state,
        cursor: { ...cursor, col: newCol },
        count: '',
        lastCommand: { type: 'move' }
      };
    }
    return state;
  }

  if (key === ',' && state.lastFind) {
    const lineText = buffer[cursor.line];
    const reverseType: Record<string, 'f' | 'F' | 't' | 'T'> = {
      'f': 'F',
      'F': 'f',
      't': 'T',
      'T': 't'
    };
    const reversedFindType = reverseType[state.lastFind.type];
    const startCol = reversedFindType === 'f' || reversedFindType === 't'
      ? cursor.col + 1
      : cursor.col - 1;
    const newCol = findCharOnLine(lineText, startCol, state.lastFind.char, reversedFindType);

    if (newCol !== null) {
      return {
        ...state,
        cursor: { ...cursor, col: newCol },
        count: '',
        lastCommand: { type: 'move' }
      };
    }
    return state;
  }

  // ----- g pending: 'g' awaits 'g'/'u'/'U'/'~' -----
  if (state.pendingG) {
    const clearedG: VimState = { ...state, pendingG: false };
    if (key === ';') {
      return moveChangelist(clearedG, -1);
    }
    if (key === ',') {
      return moveChangelist(clearedG, 1);
    }
    if (key === 'g') {
      const target = getMotionTarget(clearedG, 'gg');
      return {
        ...pushJump(clearedG, clearedG.cursor, target),
        count: '',
        lastCommand: { type: 'move', motion: 'gg' },
      };
    }
    if (key === 'u' || key === 'U' || key === '~') {
      const op: Operator = key === 'u' ? 'gu' : key === 'U' ? 'gU' : 'g~';
      // Begin recording the change so `.` can replay [g, u/U/~, motion...]
      const stateWithHistory = pushHistory(clearedG);
      const stateWithRec = startRecording(stateWithHistory, 'g', false);
      const stateWithKey = recordKey(stateWithRec, key, false);
      return { ...stateWithKey, pendingOperator: op };
    }
    return clearedG;
  }

  if (key === 'g') {
    return { ...state, pendingG: true };
  }

  if (key === 'G') {
    const target = getMotionTarget(state, 'G');
    return {
      ...pushJump(state, state.cursor, target),
      count: '',
      lastCommand: { type: 'move', motion: 'G' },
    };
  }

  if (key === '{' || key === '}' || key === '%') {
    const motion = key as Motion;
    const count = key === '%' ? 1 : getCount(state);
    let newPos = state.cursor;
    let tempState = state;
    for (let i = 0; i < count; i++) {
      newPos = getMotionTarget(tempState, motion);
      tempState = { ...tempState, cursor: newPos };
    }
    return {
      ...pushJump(state, state.cursor, newPos),
      count: '',
      lastCommand: { type: 'move', motion },
    };
  }

  if (key === 'd') {
    const stateWithRecording = startRecording(state, key, ctrlKey || false);
    return { ...stateWithRecording, pendingOperator: 'd', pendingTextObject: null };
  }
  if (key === 'c') {
    const stateWithRecording = startRecording(state, key, ctrlKey || false);
    return { ...stateWithRecording, pendingOperator: 'c', pendingTextObject: null };
  }
  if (key === 'y') return { ...state, pendingOperator: 'y', pendingTextObject: null };

  if (key === 'v' && ctrlKey) {
    return {
      ...clearPendingStates(state),
      mode: 'visual-block',
      visualAnchor: { ...cursor },
      lastCommand: { type: 'mode-switch', to: 'visual-block' }
    };
  }

  if (key === 'v') {
    return {
      ...clearPendingStates(state),
      mode: 'visual',
      visualAnchor: { ...cursor },
      lastCommand: { type: 'mode-switch', to: 'visual-line' }
    };
  }

  if (key === 'V') {
    const lineCursor = { line: cursor.line, col: 0 };
    return {
      ...clearPendingStates(state),
      mode: 'visual-line',
      cursor: lineCursor,
      visualAnchor: { ...lineCursor },
      lastCommand: { type: 'mode-switch', to: 'visual' }
    };
  }

  if (key === 'p') {
    return applyPaste(state, false);
  }

  if (key === 'P') {
    return applyPaste(state, true);
  }

  if (key === 'x') {
    const lineText = buffer[cursor.line];
    if (lineText.length > 0) {
      const count = getCount(state);
      const deleteCount = Math.min(count, lineText.length - cursor.col);
      const stateWithHistory = pushHistory(pushChangePosition(state, cursor));
      const stateWithRecording = startRecording(stateWithHistory, key, ctrlKey || false);

      const deletedText = lineText.slice(cursor.col, cursor.col + deleteCount);
      const newLine = lineText.slice(0, cursor.col) + lineText.slice(cursor.col + deleteCount);
      const newBuffer = [...buffer];
      newBuffer[cursor.line] = newLine;
      let newCol = cursor.col;
      if (newCol >= newLine.length) newCol = Math.max(0, newLine.length - 1);

      const finished = finishRecording({
        ...stateWithRecording,
        buffer: newBuffer,
        cursor: { ...cursor, col: newCol },
        register: deletedText
      });

      return applyRegisterWrite(state, {
        ...finished,
        count: '',
        lastCommand: { type: 'delete-char' }
      }, deletedText, 'delete');
    }
    return state;
  }

  if (key === 'X') {
    const lineText = buffer[cursor.line];
    if (lineText.length > 0 && cursor.col > 0) {
      const count = getCount(state);
      const deleteCount = Math.min(count, cursor.col);
      const startCol = cursor.col - deleteCount;
      const stateWithHistory = pushHistory(state);
      const stateWithRecording = startRecording(stateWithHistory, key, ctrlKey || false);

      const deletedText = lineText.slice(startCol, cursor.col);
      const newLine = lineText.slice(0, startCol) + lineText.slice(cursor.col);
      const newBuffer = [...buffer];
      newBuffer[cursor.line] = newLine;
      const newCol = Math.max(0, Math.min(startCol, Math.max(0, newLine.length - 1)));

      const finished = finishRecording({
        ...stateWithRecording,
        buffer: newBuffer,
        cursor: { ...cursor, col: newCol },
        register: deletedText
      });

      return {
        ...finished,
        count: '',
        lastCommand: { type: 'delete-char' }
      };
    }
    return { ...state, count: '' };
  }

  // ~ — toggle case of N chars under cursor and move right
  if (key === '~') {
    const lineText = buffer[cursor.line] ?? '';
    if (cursor.col >= lineText.length) return { ...state, count: '' };
    const count = getCount(state);
    const endCol = Math.min(lineText.length - 1, cursor.col + count - 1);
    const newBuffer = applyCaseRange(
      buffer,
      cursor,
      { line: cursor.line, col: endCol },
      'toggle',
    );
    const newCol = Math.min(endCol + 1, Math.max(0, (newBuffer[cursor.line]?.length ?? 0) - 1));
    const finalCursor = { line: cursor.line, col: Math.max(0, newCol) };

    // No-op (non-letter): move cursor only, skip history + recording to avoid breaking undo
    if (newBuffer[cursor.line] === lineText) {
      return {
        ...state,
        cursor: finalCursor,
        count: '',
        lastCommand: { type: 'move' },
      };
    }

    const stateWithHistory = pushHistory(state);
    const stateWithRecording = startRecording(stateWithHistory, key, ctrlKey || false);
    const finished = finishRecording({
      ...stateWithRecording,
      buffer: newBuffer,
      cursor: finalCursor,
    });
    return {
      ...finished,
      count: '',
      // Use 'move' so undo restores to the snapshot cursor (Neovim parity for ~).
      lastCommand: { type: 'move' },
    };
  }

  // ----- Uppercase shortcuts: D = d$, C = c$, Y = yy -----
  if (key === 'D' || key === 'C' || key === 'Y') {
    const mapping: Record<string, [string, string]> = {
      D: ['d', '$'],
      C: ['c', '$'],
      Y: ['y', 'y'],
    };
    const [first, second] = mapping[key];
    const afterFirst = vimReducer(state, { type: 'KEYDOWN', payload: { key: first, ctrlKey } });
    return vimReducer(afterFirst, { type: 'KEYDOWN', payload: { key: second, ctrlKey } });
  }

  // S = substitute line: clear current line, enter insert mode at col 0
  if (key === 'S') {
    const stateWithHistory = pushHistory(state);
    const stateWithRecording = startRecording(stateWithHistory, key, ctrlKey || false);
    const newBuffer = [...buffer];
    const lineText = buffer[cursor.line] ?? '';
    newBuffer[cursor.line] = '';
    return {
      ...stateWithRecording,
      buffer: newBuffer,
      cursor: { line: cursor.line, col: 0 },
      mode: 'insert',
      insertStart: { line: cursor.line, col: 0 },
      insertCol: 0,
      register: lineText + '\n',
      count: '',
      lastCommand: { type: 'enter-insert' },
    };
  }

  if (key === 's') {
    const stateWithHistory = pushHistory(state);
    const stateWithRecording = startRecording(stateWithHistory, key, ctrlKey || false);
    const lineText = buffer[cursor.line];
    if (lineText.length > 0) {
      const deleteCol = cursor.col;
      const deletedChar = lineText[deleteCol] ?? '';
      const newLine = lineText.slice(0, deleteCol) + lineText.slice(deleteCol + 1);
      const newBuffer = [...buffer];
      newBuffer[cursor.line] = newLine;
      const insertCol = deleteCol;
      // Cursor should be on the character before insertion point (if exists)
      const newCursorCol = deleteCol > 0 ? Math.min(deleteCol - 1, Math.max(0, newLine.length - 1)) : 0;
      return {
        ...stateWithRecording,
        mode: 'insert',
        buffer: newBuffer,
        cursor: { ...cursor, col: newCursorCol },
        insertCol,
        insertStart: { line: cursor.line, col: insertCol },
        register: deletedChar,
        lastCommand: { type: 'delete-char' }
      };
    }
    return {
      ...stateWithRecording,
      mode: 'insert',
      cursor: { ...cursor, col: 0 },
      insertCol: 0,
      insertStart: { line: cursor.line, col: 0 },
      register: '',
      lastCommand: { type: 'delete-char' }
    };
  }

  if (key === 'r') {
    const stateWithRecording = startRecording(state, key, ctrlKey || false);
    return { ...stateWithRecording, pendingReplace: true };
  }

  if (key === 'i') {
    const stateWithHistory = pushHistory(state);
    const stateWithRecording = startRecording(stateWithHistory, key, ctrlKey || false);
    return {
      ...stateWithRecording,
      mode: 'insert',
      insertCol: cursor.col,  // Insert before current character
      insertStart: { ...cursor },
      lastCommand: { type: 'enter-insert' }
    };
  }
  if (key === 'I') {
    const stateWithHistory = pushHistory(state);
    const stateWithRecording = startRecording(stateWithHistory, key, ctrlKey || false);
    const lineText = buffer[cursor.line];
    let col = lineText.search(/\S/);
    if (col === -1) col = lineText.length;
    return {
      ...stateWithRecording,
      mode: 'insert',
      cursor: { ...cursor, col },
      insertCol: col,  // Insert at first non-blank
      insertStart: { line: cursor.line, col },
      lastCommand: { type: 'enter-insert' }
    };
  }
  if (key === 'a') {
    const stateWithHistory = pushHistory(state);
    const stateWithRecording = startRecording(stateWithHistory, key, ctrlKey || false);
    const newCol = Math.min(buffer[cursor.line].length, cursor.col + 1);
    return {
      ...stateWithRecording,
      mode: 'insert',
      cursor: { ...cursor, col: newCol },
      insertCol: newCol,  // Insert after current character
      insertStart: { line: cursor.line, col: newCol },
      lastCommand: { type: 'enter-insert' }
    };
  }
  if (key === 'A') {
    const stateWithHistory = pushHistory(state);
    const stateWithRecording = startRecording(stateWithHistory, key, ctrlKey || false);
    const lineText = buffer[cursor.line];
    const lineLen = lineText.length;
    return {
      ...stateWithRecording,
      mode: 'insert',
      cursor: { ...cursor, col: lineLen },
      insertCol: lineLen,  // Insert at EOL
      insertStart: { line: cursor.line, col: lineLen },
      lastCommand: { type: 'enter-insert' }
    };
  }
  if (key === 'o') {
    const stateWithHistory = pushHistory(state);
    const stateWithRecording = startRecording(stateWithHistory, key, ctrlKey || false);
    const count = getCount(state);
    const indent = (buffer[cursor.line] ?? '').match(/^\s*/)?.[0] ?? '';
    const newLines = Array.from({ length: count }, () => indent);
    const insertLine = cursor.line + 1;
    const newBuffer = [...buffer];
    newBuffer.splice(insertLine, 0, ...newLines);
    return {
      ...stateWithRecording,
      mode: 'insert',
      buffer: newBuffer,
      cursor: { line: insertLine, col: indent.length },
      insertCol: indent.length,
      insertStart: { line: insertLine, col: indent.length },
      lastCommand: { type: 'open-line' }
    };
  }
  if (key === 'O') {
    const stateWithHistory = pushHistory(state);
    const stateWithRecording = startRecording(stateWithHistory, key, ctrlKey || false);
    const count = getCount(state);
    const indent = (buffer[cursor.line] ?? '').match(/^\s*/)?.[0] ?? '';
    const newLines = Array.from({ length: count }, () => indent);
    const insertLine = cursor.line;
    const newBuffer = [...buffer];
    newBuffer.splice(insertLine, 0, ...newLines);
    return {
      ...stateWithRecording,
      mode: 'insert',
      buffer: newBuffer,
      cursor: { line: insertLine, col: indent.length },
      insertCol: indent.length,
      insertStart: { line: insertLine, col: indent.length },
      lastCommand: { type: 'open-line-above' }
    };
  }

  return state;
};

const VISUAL_MOTION_KEYS = ['h', 'j', 'k', 'l', 'w', 'b', 'e', '0', '$', '^', '_', 'W', 'B', 'E'] as const;

const compareCursor = (a: Cursor, b: Cursor): number => {
  if (a.line !== b.line) return a.line - b.line;
  return a.col - b.col;
};

const getVisualRange = (state: VimState) => {
  const anchor = state.visualAnchor ?? state.cursor;
  if (state.mode === 'visual-line') {
    const startLine = Math.min(anchor.line, state.cursor.line);
    const endLine = Math.max(anchor.line, state.cursor.line);
    return {
      start: { line: startLine, col: 0 },
      end: { line: endLine, col: state.buffer[endLine]?.length ?? 0 },
      isLinewise: true
    };
  }

  const anchorFirst = compareCursor(anchor, state.cursor) <= 0;
  const start = anchorFirst ? anchor : state.cursor;
  const endInclusive = anchorFirst ? state.cursor : anchor;
  const endLineText = state.buffer[endInclusive.line] ?? '';
  const endCol = Math.min(endInclusive.col + 1, endLineText.length);

  return {
    start: { ...start },
    end: { line: endInclusive.line, col: endCol }
  };
};

const getVisualBlockBounds = (state: VimState) => {
  const anchor = state.visualAnchor ?? state.cursor;
  return {
    startLine: Math.min(anchor.line, state.cursor.line),
    endLine: Math.max(anchor.line, state.cursor.line),
    startCol: Math.min(anchor.col, state.cursor.col),
    endCol: Math.max(anchor.col, state.cursor.col)
  };
};

const buildVisualBlockText = (state: VimState): string => {
  const { startLine, endLine, startCol, endCol } = getVisualBlockBounds(state);
  const parts: string[] = [];
  for (let line = startLine; line <= endLine; line++) {
    parts.push((state.buffer[line] ?? '').slice(startCol, endCol + 1));
  }
  return parts.join('\n');
};

const deleteVisualBlock = (buffer: string[], state: VimState): string[] => {
  const { startLine, endLine, startCol, endCol } = getVisualBlockBounds(state);
  const nextBuffer = [...buffer];
  for (let line = startLine; line <= endLine; line++) {
    const lineText = nextBuffer[line] ?? '';
    if (startCol >= lineText.length) continue;
    nextBuffer[line] = lineText.slice(0, startCol) + lineText.slice(Math.min(endCol + 1, lineText.length));
  }
  return nextBuffer;
};

const moveVisualCursor = (state: VimState, motion: Motion): VimState => {
  const count = motion === '%' ? 1 : getCount(state);

  if (motion === '$' && count > 1) {
    const targetLine = state.cursor.line + count - 1;
    if (targetLine >= state.buffer.length) {
      return { ...state, count: '', lastCommand: { type: 'move', motion } };
    }
    const targetLineText = state.buffer[targetLine] ?? '';
    return {
      ...state,
      cursor: { line: targetLine, col: Math.max(0, targetLineText.length - 1) },
      count: '',
      lastCommand: { type: 'move', motion }
    };
  }

  let newPos = state.cursor;
  let tempState = state;
  for (let i = 0; i < count; i++) {
    newPos = getMotionTarget(tempState, motion);
    if (state.mode === 'visual-line') {
      newPos = { line: newPos.line, col: 0 };
    }
    tempState = { ...tempState, cursor: newPos };
  }

  return {
    ...state,
    cursor: newPos,
    count: '',
    lastCommand: { type: 'move', motion }
  };
};

const applyVisualOperator = (state: VimState, operator: 'd' | 'y' | 'c'): VimState => {
  if (state.mode === 'visual-block') {
    const { startLine, startCol } = getVisualBlockBounds(state);
    const cursor = { line: startLine, col: startCol };
    const registerText = buildVisualBlockText(state);

    if (operator === 'y') {
      return {
        ...clearPendingStates(state),
        mode: 'normal',
        cursor,
        register: registerText,
        lastCommand: { type: 'yank' }
      };
    }

    const stateWithHistory = pushHistory({
      ...state,
      mode: 'normal',
      visualAnchor: null,
      cursor
    }, true);
    const stateWithRecording = startRecording(stateWithHistory, operator, false);
    const buffer = deleteVisualBlock(stateWithRecording.buffer, state);

    if (operator === 'c') {
      return {
        ...stateWithRecording,
        buffer,
        cursor,
        mode: 'insert',
        visualAnchor: null,
        count: '',
        register: registerText,
        insertCol: cursor.col,
        insertStart: { ...cursor },
        lastCommand: { type: 'delete-range', operator }
      };
    }

    const finished = finishRecording({
      ...stateWithRecording,
      buffer,
      cursor,
      mode: 'normal',
      visualAnchor: null,
      count: '',
      register: registerText,
      recordingExitCursor: cursor,
      lastCommand: { type: 'delete-range', operator }
    });

    return { ...finished, visualAnchor: null };
  }

  const range = getVisualRange(state);
  const registerText = buildRegisterText(state.buffer, range);

  if (operator === 'y') {
    return {
      ...clearPendingStates(state),
      mode: 'normal',
      cursor: range.start,
      register: registerText,
      lastCommand: { type: 'yank' }
    };
  }

  const stateWithHistory = pushHistory({
    ...state,
    mode: 'normal',
    visualAnchor: null,
    cursor: range.start
  }, true);
  const stateWithRecording = startRecording(stateWithHistory, operator, false);
  const changed = operator === 'c' && range.isLinewise
    ? (() => {
        const newBuffer = [...stateWithRecording.buffer];
        newBuffer.splice(range.start.line, range.end.line - range.start.line + 1, '');
        return { buffer: newBuffer, cursor: { line: range.start.line, col: 0 } };
      })()
    : deleteRange(stateWithRecording.buffer, range);
  const { buffer, cursor } = changed;

  if (operator === 'c') {
    return {
      ...stateWithRecording,
      buffer,
      cursor,
      mode: 'insert',
      visualAnchor: null,
      pendingOperator: null,
      pendingTextObject: null,
      count: '',
      register: registerText,
      insertCol: cursor.col,
      insertStart: { ...cursor },
      lastCommand: { type: 'delete-range', operator }
    };
  }

  const finished = finishRecording({
    ...stateWithRecording,
    buffer,
    cursor,
    mode: 'normal',
    visualAnchor: null,
    pendingOperator: null,
    pendingTextObject: null,
    count: '',
    register: registerText,
    recordingExitCursor: cursor,
    lastCommand: { type: 'delete-range', operator }
  });

  return {
    ...finished,
    visualAnchor: null
  };
};

const handleVisualKey = (state: VimState, key: string, ctrlKey: boolean): VimState => {
  if (
    key === 'Escape' ||
    (state.mode === 'visual' && key === 'v' && !ctrlKey) ||
    (state.mode === 'visual-line' && key === 'V') ||
    (state.mode === 'visual-block' && key === 'v' && ctrlKey)
  ) {
    return {
      ...clearPendingStates(state),
      mode: 'normal',
      visualAnchor: null,
      lastCommand: { type: 'mode-switch', to: 'normal' }
    };
  }

  if (/^[1-9]$/.test(key)) {
    return { ...state, count: state.count + key };
  }

  if ((key === 'd' || key === 'y' || key === 'c') && !ctrlKey) {
    return applyVisualOperator(state, key);
  }

  if (state.pendingG) {
    const clearedG: VimState = { ...state, pendingG: false };
    if (key === 'g') {
      return moveVisualCursor(clearedG, 'gg');
    }
    return clearedG;
  }

  if (key === 'g') {
    return { ...state, pendingG: true };
  }

  if (key === 'G') {
    return moveVisualCursor(state, 'G');
  }

  if (key === '{' || key === '}' || key === '%') {
    return moveVisualCursor(state, key as Motion);
  }

  if ((VISUAL_MOTION_KEYS as readonly string[]).includes(key)) {
    return moveVisualCursor(state, key as Motion);
  }

  return ctrlKey ? state : state;
};

export const INITIAL_VIM_STATE: VimState = {
  buffer: [''],
  cursor: { line: 0, col: 0 },
  mode: 'normal',
  visualAnchor: null,
  commandLine: '',
  commandStatus: null,
  viewportTop: 0,
  viewportHeight: 10,
  pendingOperator: null,
  pendingReplace: false,
  pendingFind: null,
  pendingTextObject: null,
  pendingSearch: null,
  pendingG: false,
  pendingZ: false,
  pendingCtrlW: false,
  lastSearch: null,
  lastCommand: null,
  buffers: [
    { id: 1, name: '[No Name]', lines: [''], cursor: { line: 0, col: 0 } }
  ],
  currentBufferIndex: 0,
  windows: [
    { id: 1, bufferIndex: 0, row: 0, col: 0 }
  ],
  currentWindowIndex: 0,
  quickfixList: [],
  quickfixIndex: -1,
  quickfixOpen: false,
  history: [],
  historyIndex: -1,
  register: '',
  yankRegister: '',
  registers: {},
  pendingRegister: false,
  selectedRegister: null,
  count: '',
  lastFind: null,
  lastChange: null,
  changeRecording: null,
  lastChangeCount: null,
  recordingCount: null,
  lastChangeCursor: null,
  lastChangeInsertCursor: null,
  lastChangeInsertStart: null,
  recordingExitCursor: null,
  recordingInsertCursor: null,
  insertStart: null,
  pendingMacroRecord: false,
  pendingMacroReplay: false,
  macroRecordingRegister: null,
  macroRecording: [],
  macros: {},
  lastMacroRegister: null,
  marks: {},
  pendingMarkSet: false,
  pendingMarkJump: null,
  previousJumpCursor: null,
  jumpList: [],
  jumpIndex: -1,
  changeList: [],
  changeIndex: -1,
};

export const vimReducer = (state: VimState, action: VimAction): VimState => {
  const { type, payload } = action;
  const { buffer } = state;

  if (!buffer.length) return { ...state, buffer: [''] };

  switch (type) {
    case 'RESET':
      return { ...INITIAL_VIM_STATE, ...payload };

    case 'KEYDOWN': {
      const key = payload?.key;
      if (!key) return state;
      const ctrlKey = payload?.ctrlKey || false;
      const keyPress = { key, ctrlKey };
      const shouldRecordMacroKey =
        state.macroRecordingRegister !== null &&
        !(state.mode === 'normal' && key === 'q' && !ctrlKey);
      const inputState = shouldRecordMacroKey
        ? { ...state, macroRecording: [...state.macroRecording, keyPress] }
        : state;
      const inputMode = inputState.mode;

      if (inputMode === 'insert') {
        return handleInsertKey(inputState, key, ctrlKey);
      }

      if (inputMode === 'command') {
        return handleCommandKey(inputState, key);
      }

      if (inputMode === 'normal') {
        return handleNormalKey(inputState, key, ctrlKey);
      }

      if (inputMode === 'visual') {
        return handleVisualKey(inputState, key, ctrlKey);
      }

      if (inputMode === 'visual-line') {
        return handleVisualKey(inputState, key, ctrlKey);
      }

      if (inputMode === 'visual-block') {
        return handleVisualKey(inputState, key, ctrlKey);
      }

      return state;
    }

    default:
      return state;
  }
};
