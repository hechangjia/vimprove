import { useMemo, useRef, useState } from 'react';
import { Crosshair, Keyboard, RotateCcw } from 'lucide-react';
import type { FindTargetGameConfig, VimState } from '@/core/types';
import { INITIAL_VIM_STATE, vimReducer } from '@/core/vimReducer';
import { usesBlockCursor } from '@/core/modeUtils';
import { useTranslationSafe } from '@/hooks/useI18n';

const DEFAULT_ROUNDS = [
  { line: 'const result = parseUserInput(rawValue);', cursorCol: 0, targetCol: 15 },
  { line: 'logger.info("upload finished", requestId);', cursorCol: 0, targetCol: 12 },
  { line: 'return users.filter(user => user.active);', cursorCol: 0, targetCol: 19 },
  { line: 'theme.colors.primary = palette.green;', cursorCol: 31, targetCol: 13 },
  { line: 'if (cache.has(key)) return cache.get(key);', cursorCol: 4, targetCol: 33 }
] satisfies NonNullable<FindTargetGameConfig['rounds']>;

const buildState = (round: NonNullable<FindTargetGameConfig['rounds']>[number]): VimState => ({
  ...INITIAL_VIM_STATE,
  buffer: [round.line],
  cursor: { line: 0, col: round.cursorCol }
});

export const FindTargetGame = ({ config }: { config?: FindTargetGameConfig }) => {
  const { t } = useTranslationSafe('challenge');
  const rounds = config?.rounds?.length ? config.rounds : DEFAULT_ROUNDS;
  const targetScore = config?.targetScore ?? rounds.length;
  const [roundIndex, setRoundIndex] = useState(0);
  const [state, setState] = useState<VimState>(() => buildState(rounds[0]));
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const round = rounds[roundIndex];
  const targetChar = round.line[round.targetCol] ?? '';
  const isComplete = score >= targetScore;

  const reset = () => {
    setRoundIndex(0);
    setState(buildState(rounds[0]));
    setScore(0);
    setMisses(0);
  };

  const advanceRound = (nextScore: number) => {
    const nextIndex = (roundIndex + 1) % rounds.length;
    setScore(nextScore);
    setRoundIndex(nextIndex);
    setState(buildState(rounds[nextIndex]));
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock'].includes(event.key)) return;
    event.preventDefault();
    if (isComplete) {
      if (event.key === 'r' || event.key === 'R') reset();
      return;
    }

    const nextState = vimReducer(state, {
      type: 'KEYDOWN',
      payload: { key: event.key, ctrlKey: event.ctrlKey }
    });

    const usedPrecisionKey =
      ['f', 'F', 't', 'T', ';', ','].includes(event.key)
      || state.pendingFind != null;

    if (nextState.cursor.col === round.targetCol) {
      advanceRound(score + (usedPrecisionKey ? 1 : 0));
      if (!usedPrecisionKey) setMisses(prev => prev + 1);
      return;
    }

    if (['h', 'l'].includes(event.key)) {
      setMisses(prev => prev + 1);
    }
    setState(nextState);
  };

  const renderedChars = useMemo(() => {
    const line = state.buffer[0] ?? '';
    return line.split('').map((char, index) => {
      const isCursor = state.cursor.col === index;
      const isTarget = round.targetCol === index;
      const cursorClass = isCursor
        ? usesBlockCursor(state.mode)
          ? 'vim-cursor-text'
          : 'relative z-10'
        : '';

      return (
        <span key={`${roundIndex}-${index}`} className={`relative ${isTarget ? 'bg-warning/30 text-warning' : ''}`}>
          {isCursor && <span className={usesBlockCursor(state.mode) ? 'vim-cursor-block' : 'vim-cursor-bar'} />}
          <span className={cursorClass}>{char}</span>
        </span>
      );
    });
  }, [round.targetCol, roundIndex, state]);

  return (
    <div
      className="my-12 bg-surface rounded-xl overflow-hidden border border-border shadow-2xl outline-none"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="bg-surface-2 border-b border-border p-3 flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 font-semibold text-foreground">
          <Crosshair size={16} />
          {t('findTarget.title', 'Find Target')}
        </div>
        <div className="flex items-center gap-4 text-foreground-muted">
          <span>{t('findTarget.score', 'Score')}: {score}/{targetScore}</span>
          <span>{t('findTarget.misses', 'Misses')}: {misses}</span>
          <button
            onClick={(event) => {
              event.stopPropagation();
              reset();
            }}
            className="hover:text-foreground-strong transition-colors"
            title={t('findTarget.restart', 'Restart')}
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      <div className="relative p-6 cursor-text">
        <input
          ref={inputRef}
          type="text"
          className="opacity-0 absolute top-0 left-0 h-0 w-0"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
        />

        {!isFocused && (
          <div className="absolute inset-0 z-10 bg-surface/80 backdrop-blur-[1px] flex items-center justify-center text-foreground-subtle gap-2">
            <Keyboard size={20} />
            {t('findTarget.focus', 'Click to focus')}
          </div>
        )}

        <div className="mb-4 text-sm text-foreground-muted">
          {isComplete
            ? t('findTarget.complete', 'Target score reached. Press r to restart.')
            : t('findTarget.prompt', 'Reach the highlighted {{char}} with f/F/t/T, then repeat with ; or ,.', { char: targetChar })}
        </div>

        <div className="vim-editor-root border border-border bg-surface-2 rounded-lg px-4 py-5 overflow-x-auto">
          <div className="vim-editor-line px-0">
            <div className="vim-line-content">{renderedChars}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
