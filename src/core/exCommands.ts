import type { Command, VimState } from './types';
import { pushHistory } from './stateUtils';

type SubstituteSpec = {
  range: 'line' | 'buffer';
  oldText: string;
  newText: string;
  global: boolean;
};

const plural = (count: number, one: string, many: string) => count === 1 ? one : many;

const parseSubstitute = (command: string): SubstituteSpec | null => {
  const match = command.match(/^(%)?s\/([^/]+)\/([^/]*)\/(g)?$/);
  if (!match) return null;

  return {
    range: match[1] === '%' ? 'buffer' : 'line',
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
  const startLine = spec.range === 'buffer' ? 0 : state.cursor.line;
  const endLine = spec.range === 'buffer' ? state.buffer.length - 1 : state.cursor.line;
  const nextBuffer = [...state.buffer];
  let substitutionCount = 0;
  let changedLineCount = 0;

  for (let lineIndex = startLine; lineIndex <= endLine; lineIndex++) {
    const result = replaceLine(nextBuffer[lineIndex] ?? '', spec.oldText, spec.newText, spec.global);
    if (result.count > 0) {
      nextBuffer[lineIndex] = result.line;
      substitutionCount += result.count;
      changedLineCount += 1;
    }
  }

  const command: Command = {
    type: 'ex',
    command: `${spec.range === 'buffer' ? '%' : ''}s/${spec.oldText}/${spec.newText}/${spec.global ? 'g' : ''}`
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
  return {
    ...withHistory,
    buffer: nextBuffer,
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

  return {
    ...state,
    mode: 'normal',
    commandLine: '',
    commandStatus: `not an editor command: ${command}`,
    lastCommand: { type: 'ex', command }
  };
};
