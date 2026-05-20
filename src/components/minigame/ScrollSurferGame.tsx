import { useRef, useState } from 'react';
import { Keyboard, RotateCcw, Waves } from 'lucide-react';
import type { ScrollSurferGameConfig } from '@/core/types';
import { useTranslationSafe } from '@/hooks/useI18n';

type Target = {
  line: number;
  command: string;
};

const TARGETS: Target[] = [
  { line: 8, command: 'Ctrl-d' },
  { line: 18, command: 'Ctrl-f' },
  { line: 13, command: 'Ctrl-u' },
  { line: 3, command: 'Ctrl-b' },
  { line: 3, command: 'zt' },
  { line: 3, command: 'zz' },
  { line: 3, command: 'zb' }
];

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export const ScrollSurferGame = ({ config }: { config?: ScrollSurferGameConfig }) => {
  const { t } = useTranslationSafe('challenge');
  const inputRef = useRef<HTMLInputElement>(null);
  const targetScore = config?.targetScore ?? TARGETS.length;
  const [cursorLine, setCursorLine] = useState(3);
  const [viewportTop, setViewportTop] = useState(0);
  const [targetIndex, setTargetIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [pendingZ, setPendingZ] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const viewportHeight = 6;
  const lineCount = 24;
  const target = TARGETS[targetIndex % TARGETS.length];
  const isComplete = score >= targetScore;

  const reset = () => {
    setCursorLine(3);
    setViewportTop(0);
    setTargetIndex(0);
    setScore(0);
    setMisses(0);
    setPendingZ(false);
  };

  const checkTarget = (nextLine: number, nextViewportTop: number, command: string) => {
    const viewportMatches = target.command === command;
    const lineMatches = command.startsWith('Ctrl-') ? nextLine === target.line : nextViewportTop >= 0;
    if (viewportMatches && lineMatches) {
      setScore(prev => prev + 1);
      setTargetIndex(prev => prev + 1);
    } else {
      setMisses(prev => prev + 1);
    }
  };

  const handleCommand = (command: string) => {
    let nextLine = cursorLine;
    let nextTop = viewportTop;
    if (command === 'Ctrl-d') {
      nextLine = clamp(cursorLine + 5, 0, lineCount - 1);
      nextTop = clamp(viewportTop + 5, 0, lineCount - viewportHeight);
    } else if (command === 'Ctrl-u') {
      nextLine = clamp(cursorLine - 5, 0, lineCount - 1);
      nextTop = clamp(viewportTop - 5, 0, lineCount - viewportHeight);
    } else if (command === 'Ctrl-f') {
      nextLine = clamp(cursorLine + viewportHeight, 0, lineCount - 1);
      nextTop = clamp(viewportTop + viewportHeight, 0, lineCount - viewportHeight);
    } else if (command === 'Ctrl-b') {
      nextLine = clamp(cursorLine - viewportHeight, 0, lineCount - 1);
      nextTop = clamp(viewportTop - viewportHeight, 0, lineCount - viewportHeight);
    } else if (command === 'zt') {
      nextTop = clamp(cursorLine, 0, lineCount - viewportHeight);
    } else if (command === 'zz') {
      nextTop = clamp(cursorLine - Math.floor(viewportHeight / 2), 0, lineCount - viewportHeight);
    } else if (command === 'zb') {
      nextTop = clamp(cursorLine - viewportHeight + 1, 0, lineCount - viewportHeight);
    }

    setCursorLine(nextLine);
    setViewportTop(nextTop);
    checkTarget(nextLine, nextTop, command);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock'].includes(event.key)) return;
    event.preventDefault();

    if (isComplete) {
      if (event.key === 'r' || event.key === 'R') reset();
      return;
    }

    if (pendingZ) {
      setPendingZ(false);
      if (event.key === 'z' || event.key === 't' || event.key === 'b') {
        handleCommand(`z${event.key}`);
      } else {
        setMisses(prev => prev + 1);
      }
      return;
    }

    if (event.key === 'z') {
      setPendingZ(true);
      return;
    }

    if (event.ctrlKey && ['d', 'u', 'f', 'b'].includes(event.key)) {
      handleCommand(`Ctrl-${event.key}`);
      return;
    }

    setMisses(prev => prev + 1);
  };

  const visibleLines = Array.from({ length: viewportHeight }, (_, index) => viewportTop + index);

  return (
    <div
      className="my-12 bg-surface rounded-xl overflow-hidden border border-border shadow-2xl outline-none"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="bg-surface-2 border-b border-border p-3 flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 font-semibold text-foreground">
          <Waves size={16} />
          {t('scrollSurfer.title', 'Scroll Surfer')}
        </div>
        <div className="flex items-center gap-4 text-foreground-muted">
          <span>{t('scrollSurfer.score', 'Score')}: {score}/{targetScore}</span>
          <span>{t('scrollSurfer.misses', 'Misses')}: {misses}</span>
          <button
            onClick={(event) => {
              event.stopPropagation();
              reset();
            }}
            className="hover:text-foreground-strong transition-colors"
            title={t('scrollSurfer.restart', 'Restart')}
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
            {t('scrollSurfer.focus', 'Click to focus')}
          </div>
        )}

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-sm text-foreground-muted">
          <span>
            {isComplete
              ? t('scrollSurfer.complete', 'Target score reached. Press r to restart.')
              : t('scrollSurfer.prompt', 'Use {{command}} to hit line {{line}} or place the viewport.', {
                  command: target.command,
                  line: target.line + 1
                })}
          </span>
          <span className={`font-mono ${pendingZ ? 'text-warning' : 'text-foreground-faint'}`}>
            {pendingZ ? 'z …' : `top ${viewportTop + 1}`}
          </span>
        </div>

        <div className="vim-editor-root border border-border bg-surface-2 rounded-lg px-4 py-4">
          {visibleLines.map(line => (
            <div key={line} className="vim-editor-line px-0">
              <span className="vim-line-number">{line + 1}</span>
              <div className={`vim-line-content ${line === cursorLine ? 'text-primary font-bold' : ''}`}>
                {line === cursorLine ? '> ' : '  '}project line {line + 1}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
