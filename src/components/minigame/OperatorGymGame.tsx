import { useRef, useState } from 'react';
import { Dumbbell, Keyboard, RotateCcw } from 'lucide-react';
import type { OperatorGymGameConfig } from '@/core/types';
import { useTranslationSafe } from '@/hooks/useI18n';

const DEFAULT_ROUNDS = [
  { prompt: 'Delete inside the current double-quoted string', command: 'di"', hint: 'operator + inside + quote' },
  { prompt: 'Change the current word', command: 'ciw', hint: 'change + inner word' },
  { prompt: 'Delete inside the current parentheses', command: 'di(', hint: 'delete + inside + paren' },
  { prompt: 'Delete around the current word, including spaces', command: 'daw', hint: 'delete + around word' },
  { prompt: 'Change inside the current braces', command: 'ci{', hint: 'change + inside + brace' }
] satisfies NonNullable<OperatorGymGameConfig['rounds']>;

export const OperatorGymGame = ({ config }: { config?: OperatorGymGameConfig }) => {
  const { t } = useTranslationSafe('challenge');
  const rounds = config?.rounds?.length ? config.rounds : DEFAULT_ROUNDS;
  const targetScore = config?.targetScore ?? rounds.length;
  const inputRef = useRef<HTMLInputElement>(null);
  const [roundIndex, setRoundIndex] = useState(0);
  const [typed, setTyped] = useState('');
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [isFocused, setIsFocused] = useState(false);

  const round = rounds[roundIndex % rounds.length];
  const isComplete = score >= targetScore;

  const reset = () => {
    setRoundIndex(0);
    setTyped('');
    setScore(0);
    setMisses(0);
  };

  const advance = () => {
    setScore(prev => prev + 1);
    setRoundIndex(prev => prev + 1);
    setTyped('');
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock'].includes(event.key)) return;
    event.preventDefault();

    if (isComplete) {
      if (event.key === 'r' || event.key === 'R') reset();
      return;
    }

    if (event.key === 'Backspace') {
      setTyped(prev => prev.slice(0, -1));
      return;
    }

    if (event.key === 'Escape') {
      setTyped('');
      return;
    }

    if (event.key.length !== 1) return;

    const nextTyped = `${typed}${event.key}`;
    if (nextTyped === round.command) {
      advance();
      return;
    }

    if (!round.command.startsWith(nextTyped)) {
      setMisses(prev => prev + 1);
      setTyped('');
      return;
    }

    setTyped(nextTyped);
  };

  return (
    <div
      className="my-12 bg-surface rounded-xl overflow-hidden border border-border shadow-2xl outline-none"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="bg-surface-2 border-b border-border p-3 flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 font-semibold text-foreground">
          <Dumbbell size={16} />
          {t('operatorGym.title', 'Operator Gym')}
        </div>
        <div className="flex items-center gap-4 text-foreground-muted">
          <span>{t('operatorGym.score', 'Score')}: {score}/{targetScore}</span>
          <span>{t('operatorGym.misses', 'Misses')}: {misses}</span>
          <button
            onClick={(event) => {
              event.stopPropagation();
              reset();
            }}
            className="hover:text-foreground-strong transition-colors"
            title={t('operatorGym.restart', 'Restart')}
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
            {t('operatorGym.focus', 'Click to focus')}
          </div>
        )}

        <div className="mb-4 text-sm text-foreground-muted">
          {isComplete
            ? t('operatorGym.complete', 'Target score reached. Press r to restart.')
            : t('operatorGym.prompt', 'Type the Vim command for the target edit.')}
        </div>

        <div className="border border-border bg-surface-2 rounded-lg p-5">
          <div className="text-xs uppercase tracking-widest text-foreground-faint mb-2">
            {t('operatorGym.target', 'Target')}
          </div>
          <div className="text-lg font-semibold text-foreground-strong mb-4">
            {round.prompt}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <code className="min-w-24 bg-surface-4 border border-border rounded px-3 py-2 text-primary font-mono">
              {typed || t('operatorGym.emptyInput', 'type...')}
            </code>
            <span className="text-sm text-foreground-faint">{round.hint}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
