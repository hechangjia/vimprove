import { useState, useRef, useEffect } from 'react';
import { CheckCircle2, RotateCcw, Clock, Keyboard, Trophy } from 'lucide-react';
import type { ChallengeConfig } from '@/core/types';
import { useVimEngine } from '@/hooks/useVimEngine';
import { useChallenge } from '@/hooks/useChallenge';
import { vimReducer } from '@/core/vimReducer';
import { tokenizeLine, getTokenClassName } from '@/core/syntaxHighlight';
import { getLigatureRange } from '@/core/ligatures';
import { isInVisualSelection } from '@/core/visualSelection';
import { usesBlockCursor } from '@/core/modeUtils';
import { useTranslationSafe } from '@/hooks/useI18n';
import { useKeyHistory } from '@/hooks/useKeyHistory';
import { getCommandSuggestion } from '@/hooks/useCommandSuggester';
import { useKeyStats } from '@/hooks/useKeyStats';
import { KeyHistoryPanel } from '@/components/common/KeyHistoryPanel';

type VimChallengeProps = {
  config: ChallengeConfig;
  onComplete: (result: { next?: boolean; time: number }) => void;
  lessonSlug?: string;
  i18nBaseKey?: string;
  disableContentI18n?: boolean;
};

const buildInitialVimState = (config: ChallengeConfig) => ({
  buffer: config.initialBuffer,
  cursor: config.initialCursor,
  buffers: config.initialBuffers ?? [
    { id: 1, name: '[No Name]', lines: config.initialBuffer, cursor: config.initialCursor }
  ],
  currentBufferIndex: config.initialCurrentBufferIndex ?? 0,
  windows: config.initialWindows ?? [
    { id: 1, bufferIndex: config.initialCurrentBufferIndex ?? 0, row: 0, col: 0 }
  ],
  currentWindowIndex: config.initialCurrentWindowIndex ?? 0
});

export const VimChallenge = ({
  config,
  onComplete,
  lessonSlug,
  i18nBaseKey,
  disableContentI18n
}: VimChallengeProps) => {
  const { state, dispatch } = useVimEngine(buildInitialVimState(config));

  const { goalsStatus, elapsed, isComplete, restart, startTimer, completedCount } = useChallenge(
    config,
    state,
    onComplete
  );
  const { t } = useTranslationSafe(['challenge', 'lessons']);
  const { recordKey, getHistory, clearHistory } = useKeyHistory();
  const { recordKeyStat } = useKeyStats();

  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isComposingRef = useRef(false);
  const compositionDataRef = useRef('');

  const dispatchRef = useRef(dispatch);
  const clearHistoryRef = useRef(clearHistory);
  useEffect(() => {
    dispatchRef.current = dispatch;
    clearHistoryRef.current = clearHistory;
  });

  useEffect(() => {
    // Reset vim state when config changes (e.g., switching lessons).
    // 只依赖 config 引用变化，避免 dispatch/clearHistory 引用波动导致编辑器反复重置。
    dispatchRef.current({
      type: 'RESET',
      payload: buildInitialVimState(config)
    });
    clearHistoryRef.current();
    setIsFocused(false);
  }, [config]);

  // Handle Enter key to proceed to next lesson when challenge is complete
  useEffect(() => {
    if (!isComplete) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onComplete({ next: true, time: elapsed });
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isComplete, elapsed, onComplete]);

  const handleCompositionStart = () => {
    isComposingRef.current = true;
    compositionDataRef.current = '';
  };

  const handleCompositionUpdate = (e: React.CompositionEvent) => {
    compositionDataRef.current = e.data;
  };

  const handleCompositionEnd = (e: React.CompositionEvent) => {
    isComposingRef.current = false;
    const text = e.data;

    if (isComplete) return;
    if (!text) return;

    startTimer();

    // In Insert mode: insert Chinese characters normally
    if (state.mode === 'insert') {
      // 单路径：local reducer 推进 + dispatch 同步进行，确保 recordKey 的 prev/next
      // 与最终 reducer state 一致，避免双 loop 之间 React 重渲染导致错位。
      const chars = Array.from(text);
      let currentState = state;
      for (const char of chars) {
        const nextState = vimReducer(currentState, {
          type: 'KEYDOWN',
          payload: { key: char, ctrlKey: false }
        });
        recordKey(char, false, currentState, nextState);
        recordKeyStat(char, false);
        dispatch({
          type: 'KEYDOWN',
          payload: { key: char, ctrlKey: false }
        });
        currentState = nextState;
      }
    } else {
      // In Normal mode: record Chinese input but don't execute
      // Show Chinese characters in key history as ignored
      for (const char of text) {
        recordKey(char, false, state, state);
        recordKeyStat(char, false);
      }
    }

    compositionDataRef.current = '';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock'].includes(e.key)) return;

    // Ignore keydown during composition (IME input)
    if (isComposingRef.current || e.key === 'Process') {
      e.preventDefault();
      return;
    }

    e.preventDefault();

    if (isComplete) return;
    startTimer();

    // Calculate nextState and record immediately (no delay)
    const nextState = vimReducer(state, {
      type: 'KEYDOWN',
      payload: { key: e.key, ctrlKey: e.ctrlKey }
    });

    recordKey(e.key, e.ctrlKey, state, nextState);
    recordKeyStat(e.key, e.ctrlKey);

    dispatch({
      type: 'KEYDOWN',
      payload: { key: e.key, ctrlKey: e.ctrlKey }
    });
  };

  const handleRestart = () => {
    dispatch({
      type: 'RESET',
      payload: buildInitialVimState(config)
    });
    restart();
    clearHistory();
    setIsFocused(false);
  };

  const renderBuffer = () => {
    const language = config.language || 'auto';

    return state.buffer.map((line, r) => {
      const tokens = tokenizeLine(line, language, state.buffer);
      const ligatureRange = state.cursor.line === r ? getLigatureRange(line, state.cursor.col) : null;
      let charIndex = 0;

      return (
        <div key={r} className="vim-editor-line">
          <span className="vim-line-number">{r + 1}</span>
          <div className="vim-line-content">
            {tokens.map((token, tokenIdx) => {
              const tokenChars = token.content.split('');
              const tokenColor = getTokenClassName(token.type);

              return tokenChars.map((char, localIdx) => {
                const c = charIndex++;
                const isCursor = state.cursor.line === r && state.cursor.col === c;
                const isBlockCursorMode = usesBlockCursor(state.mode);
                const isSelected = isInVisualSelection(state, { line: r, col: c });
                const disableLigatures =
                  ligatureRange != null && c >= ligatureRange.start && c <= ligatureRange.end;
                const cursorTextClass = isCursor
                  ? isBlockCursorMode
                    ? 'vim-cursor-text'
                    : 'relative z-10'
                  : '';
                const selectionClass = isSelected ? 'vim-visual-selection' : '';

                return (
                  <span
                    key={`${tokenIdx}-${localIdx}`}
                    className={`${tokenColor} ${isCursor ? 'relative' : ''}`}
                  >
                    {isCursor && (
                      <span
                        className={isBlockCursorMode ? 'vim-cursor-block' : 'vim-cursor-bar'}
                      />
                    )}
                    <span className={`${selectionClass} ${cursorTextClass} ${disableLigatures ? 'vim-no-ligatures' : ''}`.trim()}>
                      {char}
                    </span>
                  </span>
                );
              });
            })}
            {state.cursor.line === r && state.cursor.col === line.length && (
              <span className={usesBlockCursor(state.mode) ? 'vim-cursor-eol-block' : 'vim-cursor-eol-bar'}>
                &nbsp;
              </span>
            )}
          </div>
        </div>
      );
    });
  };
  const suggestion = isComplete ? getCommandSuggestion(getHistory()) : null;
  const activeBufferName = state.buffers[state.currentBufferIndex]?.name;
  const showWorkspaceSignal = state.buffers.length > 1 && activeBufferName;

  return (
    <div className="bg-surface rounded-xl overflow-hidden border border-border shadow-2xl flex flex-row gap-0 h-[500px] md:h-[600px]">
      {/* Left: Editor */}
      <div className="flex-1 flex flex-col min-w-0">
      {/* Header / Status Bar */}
      <div className="bg-surface-2 border-b border-border p-3 flex items-center justify-between text-sm font-mono">
        <div className="flex items-center gap-4">
          <div
            className={`px-2 py-0.5 rounded text-xs font-bold ${
              state.mode === 'normal'
                ? 'bg-success-muted text-success-muted-foreground'
                : 'bg-info-muted text-info-muted-foreground'
            }`}
          >
            {t(`mode.${state.mode}`, state.mode.toUpperCase(), { ns: 'challenge' })}
          </div>
          <div className="text-foreground-muted flex items-center gap-2">
            <Clock size={14} />
            <span>
              {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, '0')}
            </span>
          </div>
          {showWorkspaceSignal && (
            <div className="hidden md:block text-foreground-faint">
              {activeBufferName}
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-foreground-muted">
              {t('goals.label', 'Goals:', { ns: 'challenge' })}
            </span>
            <span className="text-foreground-strong font-bold">
              {completedCount} / {config.goalsRequired}
            </span>
          </div>
          <button
            onClick={handleRestart}
            className="hover:text-foreground-strong text-foreground-muted transition-colors"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Editor Area */}
      <div
        className="flex-1 relative bg-surface overflow-y-auto cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        <input
          ref={inputRef}
          type="text"
          className="opacity-0 absolute top-0 left-0 h-full w-full cursor-none"
          onBlur={() => setIsFocused(false)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          onCompositionStart={handleCompositionStart}
          onCompositionUpdate={handleCompositionUpdate}
          onCompositionEnd={handleCompositionEnd}
          autoComplete="off"
        />

        {!isFocused && !isComplete && (
          <div className="absolute inset-0 z-10 bg-surface/80 backdrop-blur-[1px] flex items-center justify-center text-foreground-subtle gap-2">
            <Keyboard size={20} />
            {t('focus.resume', 'Click to resume focus', { ns: 'challenge' })}
          </div>
        )}

        {isComplete && (
          <div className="absolute inset-0 z-20 bg-surface-2/90 flex flex-col items-center justify-center animate-in fade-in duration-500">
            <div className="bg-surface px-12 py-10 rounded-2xl border border-success-muted/50 shadow-2xl text-center max-w-lg mx-4">
              <Trophy className="w-16 h-16 text-warning mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-foreground-strong mb-2">
                {t('complete.title', 'Lesson Complete!', { ns: 'challenge' })}
              </h3>
              <p className="text-foreground-subtle mb-6">
                {t('complete.subtitle', 'You finished in {{time}} seconds.', {
                  ns: 'challenge',
                  time: elapsed
                })}
              </p>
              {suggestion && (
                <p className="text-sm text-info-muted-foreground bg-info-muted/20 border border-info-muted/40 rounded-lg px-3 py-2 mb-4">
                  {t(suggestion.messageKey, suggestion.fallback, { ns: 'challenge' })}
                </p>
              )}
              <button
                onClick={() => onComplete({ next: true, time: elapsed })}
                className="bg-primary hover:bg-primary-hover text-primary-foreground px-6 py-2 rounded-lg font-bold w-full transition-all"
              >
                {t('complete.next', 'Next Lesson', { ns: 'challenge' })}
              </button>
              <p className="text-foreground-faint text-sm mt-4">
                {t('complete.hint', 'Press Enter to continue', { ns: 'challenge' })}
              </p>
            </div>
          </div>
        )}

        <div className="vim-editor-root">{renderBuffer()}</div>
        {state.quickfixOpen && state.quickfixList.length > 0 && (
          <div className="border-t border-border bg-surface-2 px-4 py-2 font-mono text-xs text-foreground-muted max-h-28 overflow-y-auto">
            <div className="mb-1 text-foreground-subtle">quickfix</div>
            {state.quickfixList.map((item, index) => (
              <div
                key={`${item.bufferIndex}-${item.line}-${item.col}-${index}`}
                className={index === state.quickfixIndex ? 'text-primary' : ''}
              >
                {index + 1}. {state.buffers[item.bufferIndex]?.name ?? `buffer ${item.bufferIndex + 1}`}:{item.line + 1}:{item.col + 1} {item.text}
              </div>
            ))}
          </div>
        )}
        {(state.mode === 'command' || state.commandStatus) && (
          <div className="sticky bottom-0 border-t border-border bg-surface-2 px-4 py-2 font-mono text-sm text-foreground-muted">
            {state.mode === 'command' ? `:${state.commandLine}` : state.commandStatus}
          </div>
        )}
      </div>

      {/* Goals List */}
      <div className="bg-surface-2 p-4 border-t border-border">
        <h4 className="text-xs uppercase tracking-widest text-foreground-faint font-bold mb-3">
          {t('goals.title', 'Mission Objectives', { ns: 'challenge' })}
        </h4>
        <div className="space-y-2">
          {config.goals.map(g => (
            <div
              key={g.id}
              className={`flex items-center gap-2 text-sm transition-colors ${
                goalsStatus[g.id] ? 'text-success-muted-foreground opacity-50' : 'text-foreground-muted'
              }`}
              >
                <CheckCircle2
                  size={16}
                  className={goalsStatus[g.id] ? 'fill-success-muted' : 'text-foreground-disabled'}
                />
              <span className={goalsStatus[g.id] ? 'line-through' : ''}>
                {disableContentI18n
                  ? g.description
                  : t(
                      i18nBaseKey && lessonSlug
                        ? `${i18nBaseKey}.goals.${g.id}`
                        : `lessons.${lessonSlug ?? 'unknown'}.goals.${g.id}`,
                      g.description,
                      { ns: 'lessons' }
                    )}
              </span>
            </div>
          ))}
        </div>
      </div>
      </div>

      {/* Right: Key History Panel */}
      <div className="w-64 border-l border-border bg-surface-2/50 flex-shrink-0 hidden lg:flex">
        <KeyHistoryPanel history={getHistory()} />
      </div>
    </div>
  );
};
