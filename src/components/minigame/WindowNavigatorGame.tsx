import { useRef, useState } from 'react';
import { Keyboard, PanelTopOpen, RotateCcw } from 'lucide-react';
import type { WindowNavigatorGameConfig } from '@/core/types';
import { useTranslationSafe } from '@/hooks/useI18n';

type Pane = {
  id: number;
  row: number;
  col: number;
  file: string;
};

const PANES: Pane[] = [
  { id: 1, row: 0, col: 0, file: 'src/main.ts' },
  { id: 2, row: 0, col: 1, file: 'src/App.tsx' },
  { id: 3, row: 1, col: 0, file: 'src/core/vimReducer.ts' },
  { id: 4, row: 1, col: 1, file: 'README.md' }
];

const TARGET_SEQUENCE = [2, 4, 3, 1, 3, 4, 2, 1, 4, 2];

const movePane = (activePaneId: number, direction: 'h' | 'j' | 'k' | 'l') => {
  const active = PANES.find(pane => pane.id === activePaneId) ?? PANES[0];
  const candidates = PANES.filter(pane => {
    if (direction === 'h') return pane.row === active.row && pane.col < active.col;
    if (direction === 'l') return pane.row === active.row && pane.col > active.col;
    if (direction === 'k') return pane.col === active.col && pane.row < active.row;
    return pane.col === active.col && pane.row > active.row;
  });
  if (!candidates.length) return activePaneId;

  candidates.sort((a, b) => {
    const distanceA = Math.abs(a.row - active.row) + Math.abs(a.col - active.col);
    const distanceB = Math.abs(b.row - active.row) + Math.abs(b.col - active.col);
    return distanceA - distanceB;
  });

  return candidates[0].id;
};

export const WindowNavigatorGame = ({ config }: { config?: WindowNavigatorGameConfig }) => {
  const { t } = useTranslationSafe('challenge');
  const targetScore = config?.targetScore ?? 8;
  const inputRef = useRef<HTMLInputElement>(null);
  const [activePaneId, setActivePaneId] = useState(1);
  const [targetIndex, setTargetIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [pendingCtrlW, setPendingCtrlW] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const targetPaneId = TARGET_SEQUENCE[targetIndex % TARGET_SEQUENCE.length];
  const isComplete = score >= targetScore;

  const reset = () => {
    setActivePaneId(1);
    setTargetIndex(0);
    setScore(0);
    setMisses(0);
    setPendingCtrlW(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock'].includes(event.key)) return;
    event.preventDefault();

    if (isComplete) {
      if (event.key === 'r' || event.key === 'R') reset();
      return;
    }

    if (event.ctrlKey && event.key.toLowerCase() === 'w') {
      setPendingCtrlW(true);
      return;
    }

    if (!pendingCtrlW) {
      setMisses(prev => prev + 1);
      return;
    }

    setPendingCtrlW(false);
    if (!['h', 'j', 'k', 'l'].includes(event.key)) {
      setMisses(prev => prev + 1);
      return;
    }

    const nextPaneId = movePane(activePaneId, event.key as 'h' | 'j' | 'k' | 'l');
    setActivePaneId(nextPaneId);
    if (nextPaneId === targetPaneId) {
      setScore(prev => prev + 1);
      setTargetIndex(prev => prev + 1);
    } else {
      setMisses(prev => prev + 1);
    }
  };

  return (
    <div
      className="my-12 bg-surface rounded-xl overflow-hidden border border-border shadow-2xl outline-none"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="bg-surface-2 border-b border-border p-3 flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 font-semibold text-foreground">
          <PanelTopOpen size={16} />
          {t('windowNavigator.title', 'Window Navigator')}
        </div>
        <div className="flex items-center gap-4 text-foreground-muted">
          <span>{t('windowNavigator.score', 'Score')}: {score}/{targetScore}</span>
          <span>{t('windowNavigator.misses', 'Misses')}: {misses}</span>
          <button
            onClick={(event) => {
              event.stopPropagation();
              reset();
            }}
            className="hover:text-foreground-strong transition-colors"
            title={t('windowNavigator.restart', 'Restart')}
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
            {t('windowNavigator.focus', 'Click to focus')}
          </div>
        )}

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-sm text-foreground-muted">
          <span>
            {isComplete
              ? t('windowNavigator.complete', 'Target score reached. Press r to restart.')
              : t('windowNavigator.prompt', 'Focus pane {{pane}} with Ctrl-w h/j/k/l.', { pane: targetPaneId })}
          </span>
          <span className={`font-mono ${pendingCtrlW ? 'text-warning' : 'text-foreground-faint'}`}>
            {pendingCtrlW ? 'Ctrl-w …' : 'Ctrl-w'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {PANES.map(pane => {
            const isActive = pane.id === activePaneId;
            const isTarget = pane.id === targetPaneId && !isComplete;
            return (
              <div
                key={pane.id}
                className={`min-h-28 rounded-lg border p-3 transition-colors ${
                  isActive
                    ? 'border-primary bg-primary/10 text-foreground-strong'
                    : 'border-border bg-surface-2 text-foreground-muted'
                } ${isTarget ? 'ring-2 ring-warning/70' : ''}`}
              >
                <div className="flex items-center justify-between gap-2 text-xs font-mono">
                  <span>window {pane.id}</span>
                  {isTarget && <span className="text-warning">target</span>}
                </div>
                <div className="mt-4 text-sm font-semibold truncate">{pane.file}</div>
                <div className="mt-2 text-xs text-foreground-faint">
                  row {pane.row + 1}, col {pane.col + 1}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
