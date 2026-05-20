import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, SkipForward, SkipBack } from 'lucide-react';
import type { RunExampleConfig, VimState } from '@/core/types';
import { vimReducer, INITIAL_VIM_STATE } from '@/core/vimReducer';
import { tokenizeLine, getTokenClassName } from '@/core/syntaxHighlight';
import { getLigatureRange } from '@/core/ligatures';
import { usesBlockCursor } from '@/core/modeUtils';
import { useTranslationSafe } from '@/hooks/useI18n';
import { useKeyHistory } from '@/hooks/useKeyHistory';
import { KeyHistoryPanel } from '@/components/common/KeyHistoryPanel';

// 多 track 颜色轮转池：原实现 idx>=3 全部 fallback 到同一个绿色。
// 使用 tailwind.config.js / theme.css 中已定义的 track-* 颜色。
const TRACK_COLOR_PALETTE = ['bg-track-blue', 'bg-track-green', 'bg-track-red'];
const resolveTrackBg = (idx: number, override?: string): string => {
  if (idx === 0) return 'bg-caret';
  if (override) return override;
  return TRACK_COLOR_PALETTE[(idx - 1) % TRACK_COLOR_PALETTE.length];
};

type RunExamplePlayerProps = {
  config: RunExampleConfig;
  lessonSlug?: string;
  i18nBaseKey?: string;
  disableI18n?: boolean;
};

export const RunExamplePlayer = ({
  config,
  lessonSlug,
  i18nBaseKey,
  disableI18n
}: RunExamplePlayerProps) => {
  const [currentStep, setCurrentStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [states, setStates] = useState<VimState[]>([]);
  // statesRef 镜像 states 当前值，供 executeStep / handlers 同步读取，
  // 避免把 states 放入 useCallback deps 导致自动播放 timer 反复 cleanup 重建。
  const statesRef = useRef<VimState[]>([]);
  const autoPlayInterval = useRef<NodeJS.Timeout | null>(null);
  // pendingPlayRef：从末尾点击 ▶ 时先 reset，等 currentStep 回到 -1 再启动自动播放，
  // 避免 setTimeout(100) 在慢设备上时序不可靠。
  const pendingPlayRef = useRef(false);
  const { t } = useTranslationSafe(['example', 'lessons']);
  const { recordKey, getHistory, clearHistory } = useKeyHistory();

  const buildInitialStates = useCallback(
    (): VimState[] =>
      config.tracks.map(() => ({
        ...INITIAL_VIM_STATE,
        buffer: config.initialBuffer,
        cursor: config.initialCursor
      })),
    [config.tracks, config.initialBuffer, config.initialCursor]
  );

  useEffect(() => {
    const initialStates = buildInitialStates();
    statesRef.current = initialStates;
    setStates(initialStates);
    setCurrentStep(-1);
    setIsPlaying(false);
    pendingPlayRef.current = false;
    clearHistory();
  }, [config, buildInitialStates, clearHistory]);

  const executeStep = useCallback(
    (stepIndex: number) => {
      if (stepIndex < 0 || stepIndex >= config.steps.length) return;

      const step = config.steps[stepIndex];
      const cursorIdx = step.cursorIndex ?? 0;

      // 从 ref 读取最新 state，避免闭包旧值。
      const prevState = statesRef.current[cursorIdx];
      if (!prevState) return;
      const nextState = vimReducer(prevState, {
        type: 'KEYDOWN',
        payload: { key: step.key, ctrlKey: step.ctrlKey ?? false }
      });

      recordKey(step.key, step.ctrlKey ?? false, prevState, nextState);

      const newStates = [...statesRef.current];
      newStates[cursorIdx] = nextState;
      statesRef.current = newStates;
      setStates(newStates);

      setCurrentStep(stepIndex);
    },
    [config.steps, recordKey]
  );

  const handleNext = useCallback(() => {
    if (currentStep < config.steps.length - 1) {
      executeStep(currentStep + 1);
    }
  }, [currentStep, config.steps.length, executeStep]);

  useEffect(() => {
    if (isPlaying && currentStep < config.steps.length - 1) {
      autoPlayInterval.current = setTimeout(() => {
        handleNext();
      }, config.autoPlaySpeed || 1000);
    } else if (currentStep >= config.steps.length - 1) {
      setIsPlaying(false);
    }

    return () => {
      if (autoPlayInterval.current) {
        clearTimeout(autoPlayInterval.current);
      }
    };
  }, [isPlaying, currentStep, config.steps.length, config.autoPlaySpeed, handleNext]);

  const handleReset = useCallback(() => {
    setIsPlaying(false);
    const initialStates = buildInitialStates();
    statesRef.current = initialStates;
    setStates(initialStates);
    setCurrentStep(-1);
    clearHistory();
  }, [buildInitialStates, clearHistory]);

  // currentStep 回到 -1 且有 pendingPlay 时，自动启动播放（替代 setTimeout 时序 hack）。
  useEffect(() => {
    if (currentStep === -1 && pendingPlayRef.current) {
      pendingPlayRef.current = false;
      setIsPlaying(true);
    }
  }, [currentStep]);

  const handlePlay = useCallback(() => {
    if (currentStep >= config.steps.length - 1) {
      pendingPlayRef.current = true;
      handleReset();
    } else {
      setIsPlaying(true);
    }
  }, [currentStep, config.steps.length, handleReset]);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const handlePrev = useCallback(() => {
    if (currentStep <= 0) {
      handleReset();
      return;
    }

    setIsPlaying(false);
    clearHistory();

    const targetStep = currentStep - 1;

    let trackStates = buildInitialStates();

    for (let i = 0; i <= targetStep; i++) {
      const step = config.steps[i];
      const cursorIdx = step.cursorIndex ?? 0;

      const prevState = trackStates[cursorIdx];
      const nextState = vimReducer(prevState, {
        type: 'KEYDOWN',
        payload: { key: step.key, ctrlKey: step.ctrlKey ?? false }
      });

      recordKey(step.key, step.ctrlKey ?? false, prevState, nextState);

      trackStates = [...trackStates];
      trackStates[cursorIdx] = nextState;
    }

    statesRef.current = trackStates;
    setStates(trackStates);
    setCurrentStep(targetStep);
  }, [currentStep, config.steps, buildInitialStates, clearHistory, recordKey, handleReset]);

  const renderBuffer = () => {
    const displayState = states[0];
    if (!displayState) return null;

    const language = config.language || 'auto';

    return displayState.buffer.map((line, r) => {
      const tokens = tokenizeLine(line, language, displayState.buffer);
      const ligatureRanges = states
        .filter(s => s.cursor.line === r)
        .map(s => getLigatureRange(line, s.cursor.col))
        .filter((x): x is { start: number; end: number } => x != null);
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
                const cursorsAtPos = states
                  .map((s, idx) => ({ state: s, idx }))
                  .filter(({ state }) => state.cursor.line === r && state.cursor.col === c);
                const disableLigatures = ligatureRanges.some(range => c >= range.start && c <= range.end);

                const renderChar = cursorsAtPos.length > 0 ? (
                  <span
                    key={`${tokenIdx}-${localIdx}`}
                    className={`${tokenColor} relative`}
                  >
                    {cursorsAtPos.map(({ idx }) => {
                      const track = config.tracks[idx];
                      if (!track) return null;
                      const bgColor = resolveTrackBg(idx, track.color);
                      const isBlockCursorMode = usesBlockCursor(states[idx].mode);

                      return (
                        <span
                          key={idx}
                          className={`absolute ${idx === 0 ? '' : bgColor} ${
                            isBlockCursorMode
                              ? idx === 0
                                ? 'vim-cursor-block'
                                : 'inset-0 opacity-70'
                              : idx === 0
                                ? 'vim-cursor-bar'
                                : 'left-0 top-0 bottom-0 w-0.5 opacity-90'
                          }`}
                        />
                      );
                    })}
                    <span
                      className={`${cursorsAtPos.some(({ idx }) => usesBlockCursor(states[idx].mode)) ? 'vim-cursor-text' : 'relative z-10'} ${disableLigatures ? 'vim-no-ligatures' : ''}`.trim()}
                    >
                      {char}
                    </span>
                  </span>
                ) : (
                  <span key={`${tokenIdx}-${localIdx}`} className={tokenColor}>
                    {char}
                  </span>
                );

                return renderChar;
              });
            })}
            {states.some(s => s.cursor.line === r && s.cursor.col === line.length) && (
              <span className="inline-block">
                {states
                  .map((s, idx) => ({ state: s, idx }))
                  .filter(({ state }) => state.cursor.line === r && state.cursor.col === line.length)
                  .map(({ idx }) => {
                    const track = config.tracks[idx];
                    const bgColor = idx === 0 ? 'bg-caret' : (track.color || (idx === 1 ? 'bg-track-blue' : 'bg-track-green'));
                    const isBlockCursorMode = usesBlockCursor(states[idx].mode);

                    return (
                      idx === 0 ? (
                        <span key={idx} className={isBlockCursorMode ? 'vim-cursor-eol-block' : 'vim-cursor-eol-bar'}>
                          &nbsp;
                        </span>
                      ) : (
                        <span
                          key={idx}
                          className={`${bgColor} inline-block h-5 ${isBlockCursorMode ? 'w-2.5 opacity-70' : 'w-0.5 opacity-90'}`}
                        >
                          &nbsp;
                        </span>
                      )
                    );
                  })}
              </span>
            )}
          </div>
        </div>
      );
    });
  };

  const currentStepData = currentStep >= 0 ? config.steps[currentStep] : null;
  const resolveStepDesc = (index: number, fallback: string) => {
    if (disableI18n || !lessonSlug) return fallback;
    const key = i18nBaseKey
      ? `${i18nBaseKey}.steps.${index}`
      : `lessons.${lessonSlug}.runExample.steps.${index}`;
    return t(key, fallback, { ns: 'lessons' });
  };
  const keyedLabel = (key: string, fallback: string) => t(key, fallback, { ns: 'example' });

  return (
    <div className="bg-surface rounded-xl overflow-hidden border border-border shadow-2xl flex flex-row gap-0 h-[500px]">
      {/* Left: Player */}
      <div className="flex-1 flex flex-col min-w-0">
      {/* Header */}
      <div className="bg-surface-2 border-b border-border p-3 flex items-center justify-between text-sm font-mono">
        <div className="text-foreground-muted">{keyedLabel('title', 'Run Example')}</div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {config.tracks.map((track, idx) => {
              const bgColor = idx === 0 ? 'bg-caret' : (track.color || (idx === 1 ? 'bg-track-blue' : 'bg-track-green'));
              return (
                <div key={idx} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${bgColor}`} />
                  <span className="text-xs text-foreground-muted">
                    {disableI18n || !lessonSlug
                      ? track.label
                      : t(
                          i18nBaseKey
                            ? `${i18nBaseKey}.tracks.${idx}`
                            : `lessons.${lessonSlug}.runExample.tracks.${idx}`,
                          track.label,
                          { ns: 'lessons' }
                        )}
                  </span>
                </div>
              );
            })}
          </div>
          <button
            onClick={handleReset}
            className="hover:text-foreground-strong text-foreground-muted transition-colors"
            title={keyedLabel('reset', 'Reset')}
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Editor Area - flex-1 to push controls to bottom */}
      <div className="bg-surface flex-1 overflow-auto">
        <div className="vim-editor-root">{renderBuffer()}</div>
        {states[0] && (states[0].mode === 'command' || states[0].commandStatus) && (
          <div className="border-t border-border bg-surface-2 px-4 py-2 font-mono text-sm text-foreground-muted">
            {states[0].mode === 'command' ? `:${states[0].commandLine}` : states[0].commandStatus}
          </div>
        )}
      </div>

      {/* Current Step Display */}
      {currentStepData && (
        <div className="bg-surface-2 border-t border-border p-4">
          <div className="flex items-center gap-4">
            <div className="bg-surface-3 px-3 py-1 rounded font-mono text-lg font-bold text-foreground-strong">
              {currentStepData.key === ' '
                ? keyedLabel('space', 'Space')
                : currentStepData.key}
            </div>
            <div className="text-foreground-subtle text-sm flex-1">
              {resolveStepDesc(currentStep, currentStepData.description)}
            </div>
            <div className="text-xs text-foreground-disabled">
              {keyedLabel('step', 'Step')} {currentStep + 1} / {config.steps.length}
            </div>
          </div>
        </div>
      )}

      {/* Controls - at bottom */}
      <div className="bg-surface-2 border-t border-border p-4 flex items-center justify-center gap-3">
        <button
          onClick={handlePrev}
          disabled={currentStep <= 0}
          className="p-2 hover:bg-surface-3 rounded transition-colors text-foreground-subtle hover:text-foreground-strong disabled:opacity-30 disabled:cursor-not-allowed"
          title={keyedLabel('prev', 'Previous Step')}
        >
          <SkipBack size={18} />
        </button>
        {isPlaying ? (
          <button
            onClick={handlePause}
            className="p-3 bg-info hover:bg-info-hover rounded-lg transition-colors text-info-foreground"
            title={keyedLabel('pause', 'Pause')}
          >
            <Pause size={20} />
          </button>
        ) : (
          <button
            onClick={handlePlay}
            className="p-3 bg-primary hover:bg-primary-hover rounded-lg transition-colors text-primary-foreground"
            title={keyedLabel('play', 'Play')}
          >
            <Play size={20} />
          </button>
        )}
        <button
          onClick={handleNext}
          disabled={currentStep >= config.steps.length - 1}
          className="p-2 hover:bg-surface-3 rounded transition-colors text-foreground-subtle hover:text-foreground-strong disabled:opacity-30 disabled:cursor-not-allowed"
          title={keyedLabel('next', 'Next Step')}
        >
          <SkipForward size={18} />
        </button>
      </div>
      </div>

      {/* Right: Key History Panel */}
      <div className="w-64 border-l border-border bg-surface-2/50 flex-shrink-0 hidden lg:flex">
        <KeyHistoryPanel history={getHistory()} />
      </div>
    </div>
  );
};
