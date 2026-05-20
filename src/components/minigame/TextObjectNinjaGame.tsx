import { useRef, useState } from 'react';
import { Target, Keyboard, RotateCcw, Trophy } from 'lucide-react';
import type { TextObjectNinjaGameConfig } from '@/core/types';
import { useTranslationSafe } from '@/hooks/useI18n';
import { vimReducer, INITIAL_VIM_STATE } from '@/core/vimReducer';
import type { VimState } from '@/core/types';

interface Challenge {
  code: string[];
  initialCursor?: { line: number; col: number };
  target: { start: { line: number; col: number }; end: { line: number; col: number } };
  optimalCommand: string;
  hint: string;
  description: string;
}

const DEFAULT_CHALLENGES: Challenge[] = [
  // Level 1: Words
  {
    code: ['const foo = "bar";'],
    initialCursor: { line: 0, col: 6 },
    target: { start: { line: 0, col: 6 }, end: { line: 0, col: 9 } },
    optimalCommand: 'viw',
    hint: 'visual + inner word',
    description: 'Select the word "foo"'
  },
  {
    code: ['hello world'],
    initialCursor: { line: 0, col: 0 },
    target: { start: { line: 0, col: 0 }, end: { line: 0, col: 6 } },
    optimalCommand: 'vaw',
    hint: 'visual + around word',
    description: 'Select "hello" with trailing space'
  },
  // Level 2: Brackets
  {
    code: ['foo(bar, baz)'],
    initialCursor: { line: 0, col: 5 },
    target: { start: { line: 0, col: 4 }, end: { line: 0, col: 12 } },
    optimalCommand: 'vi(',
    hint: 'visual + inside paren',
    description: 'Select inside parentheses'
  },
  {
    code: ['{ key: "value" }'],
    initialCursor: { line: 0, col: 4 },
    target: { start: { line: 0, col: 1 }, end: { line: 0, col: 15 } },
    optimalCommand: 'vi{',
    hint: 'visual + inside brace',
    description: 'Select inside braces'
  },
  // Level 3: Quotes
  {
    code: ['const str = "hello world";'],
    initialCursor: { line: 0, col: 14 },
    target: { start: { line: 0, col: 13 }, end: { line: 0, col: 24 } },
    optimalCommand: 'vi"',
    hint: 'visual + inside quote',
    description: 'Select inside double quotes'
  }
];

export const TextObjectNinjaGame = ({ config }: { config?: TextObjectNinjaGameConfig }) => {
  const { t } = useTranslationSafe('challenge');
  const challenges = config?.challenges?.length ? config.challenges : DEFAULT_CHALLENGES;
  const targetScore = config?.targetScore ?? challenges.length;

  const inputRef = useRef<HTMLInputElement>(null);
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [typed, setTyped] = useState('');
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [vimState, setVimState] = useState<VimState>(() => ({
    ...INITIAL_VIM_STATE,
    buffer: challenges[0].code,
    cursor: challenges[0].initialCursor ?? { line: 0, col: 0 }
  }));

  const challenge = challenges[challengeIndex % challenges.length];
  const isComplete = score >= targetScore;

  const reset = () => {
    setChallengeIndex(0);
    setTyped('');
    setScore(0);
    setMisses(0);
    setVimState({
      ...INITIAL_VIM_STATE,
      buffer: challenges[0].code,
      cursor: challenges[0].initialCursor ?? { line: 0, col: 0 }
    });
  };

  const advance = () => {
    const nextIndex = challengeIndex + 1;
    setScore(prev => prev + 1);
    setChallengeIndex(nextIndex);
    const nextChallenge = challenges[nextIndex % challenges.length];
    setVimState({
      ...INITIAL_VIM_STATE,
      buffer: nextChallenge.code,
      cursor: nextChallenge.initialCursor ?? { line: 0, col: 0 }
    });
    setTyped('');
  };

  const checkSelection = (state: VimState): boolean => {
    if (!state.visualAnchor) return false;

    const anchor = state.visualAnchor;
    const cursor = state.cursor;

    // Determine selection range
    const startLine = Math.min(anchor.line, cursor.line);
    const endLine = Math.max(anchor.line, cursor.line);
    const startCol = anchor.line === cursor.line
      ? Math.min(anchor.col, cursor.col)
      : anchor.line < cursor.line ? anchor.col : cursor.col;
    const endCol = anchor.line === cursor.line
      ? Math.max(anchor.col, cursor.col) + 1
      : (anchor.line > cursor.line ? anchor.col : cursor.col) + 1;

    // Check if selection matches target
    return startLine === challenge.target.start.line &&
           endLine === challenge.target.end.line &&
           startCol === challenge.target.start.col &&
           endCol === challenge.target.end.col;
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
      // Reset Vim state
      setVimState({
        ...INITIAL_VIM_STATE,
        buffer: challenge.code,
        cursor: challenge.initialCursor ?? { line: 0, col: 0 }
      });
      return;
    }

    if (event.key === 'Escape') {
      setTyped('');
      setVimState({
        ...INITIAL_VIM_STATE,
        buffer: challenge.code,
        cursor: challenge.initialCursor ?? { line: 0, col: 0 }
      });
      return;
    }

    if (event.key.length !== 1) return;

    const nextTyped = `${typed}${event.key}`;

    // Update Vim state
    const nextState = vimReducer(vimState, {
      type: 'KEYDOWN',
      payload: { key: event.key, ctrlKey: event.ctrlKey || false }
    });
    setVimState(nextState);
    setTyped(nextTyped);

    // Check if selection is correct
    if (checkSelection(nextState)) {
      advance();
      return;
    }

    // Check if command is still valid prefix
    if (!challenge.optimalCommand.startsWith(nextTyped)) {
      setMisses(prev => prev + 1);
      setTyped('');
      setVimState({
        ...INITIAL_VIM_STATE,
        buffer: challenge.code,
        cursor: challenge.initialCursor ?? { line: 0, col: 0 }
      });
    }
  };

  const renderHighlight = () => {
    const { start, end } = challenge.target;
    if (start.line !== end.line) return null; // Only single-line for now

    const line = challenge.code[start.line];
    const before = line.slice(0, start.col);
    const target = line.slice(start.col, end.col);
    const after = line.slice(end.col);

    return (
      <div className="font-mono text-base leading-relaxed">
        <span className="text-foreground">{before}</span>
        <span className="bg-yellow-500/30 border-2 border-yellow-500 rounded px-1">
          {target}
        </span>
        <span className="text-foreground">{after}</span>
      </div>
    );
  };

  const stars = score >= targetScore ? 5 : score >= targetScore * 0.8 ? 4 : score >= targetScore * 0.6 ? 3 : score >= targetScore * 0.4 ? 2 : 1;

  return (
    <div
      className="my-12 bg-surface rounded-xl overflow-hidden border border-border shadow-2xl outline-none"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="bg-surface-2 border-b border-border p-3 flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 font-semibold text-foreground">
          <Target size={16} />
          {t('textObjectNinja.title', 'Text Object Ninja')}
        </div>
        <div className="flex items-center gap-4 text-foreground-muted">
          <span>{t('textObjectNinja.score', 'Score')}: {score}/{targetScore}</span>
          <span>{t('textObjectNinja.misses', 'Misses')}: {misses}</span>
          {isComplete && (
            <div className="flex items-center gap-1 text-yellow-500">
              <Trophy size={14} />
              {'★'.repeat(stars)}
            </div>
          )}
          <button
            onClick={(event) => {
              event.stopPropagation();
              reset();
            }}
            className="hover:text-foreground-strong transition-colors"
            title={t('textObjectNinja.restart', 'Restart')}
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
            {t('textObjectNinja.focus', 'Click to focus')}
          </div>
        )}

        <div className="mb-4 text-sm text-foreground-muted">
          {isComplete
            ? t('textObjectNinja.complete', 'Perfect! Press r to restart.')
            : t('textObjectNinja.prompt', 'Type the Vim command to select the highlighted text.')}
        </div>

        <div className="border border-border bg-surface-2 rounded-lg p-5">
          <div className="text-xs uppercase tracking-widest text-foreground-faint mb-2">
            {t('textObjectNinja.target', 'Target')}
          </div>
          <div className="text-sm text-foreground-strong mb-4">
            {challenge.description}
          </div>

          <div className="bg-surface-4 border border-border rounded p-4 mb-4">
            {renderHighlight()}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <code className="min-w-24 bg-surface-4 border border-border rounded px-3 py-2 text-primary font-mono">
              {typed || t('textObjectNinja.emptyInput', 'type...')}
            </code>
            <span className="text-sm text-foreground-faint">{challenge.hint}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
