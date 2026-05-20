import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard, RotateCcw, Trophy } from 'lucide-react';
import type { Game2048Config } from '@/core/types';
import {
  applyMove,
  boardsEqual,
  createInitialBoard,
  hasAnyMove,
  hasReachedWin,
  maxTile,
  spawnTile,
  type Board,
  type Direction
} from '@/core/game2048';
import { useTranslationSafe } from '@/hooks/useI18n';
import { useGame2048Stats } from '@/hooks/useGame2048Stats';

type Phase = 'idle' | 'playing' | 'over';
type Badge = 'none' | 'bronze' | 'silver' | 'gold';

type GameState = {
  phase: Phase;
  board: Board;
  score: number;
  startAtMs: number | null;
  endedAtMs: number | null;
  endedAtIso: string | null;
  badge: Badge;
  badgeRecorded: { bronze: boolean; silver: boolean; gold: boolean };
};

type Toast = {
  id: string;
  badge: Exclude<Badge, 'none'>;
  expiresAtMs: number;
};

type Game2048GameProps = {
  config?: Game2048Config;
};

const DEFAULTS = {
  bronzeTile: 128,
  silverTile: 512,
  goldTile: 2048
} as const;

const TOAST_VISIBLE_MS = 1800;

// hjkl → 方向。与 Vim 一致：h 左、j 下、k 上、l 右。
const KEY_TO_DIRECTION: Record<string, Direction> = {
  h: 'left',
  H: 'left',
  l: 'right',
  L: 'right',
  k: 'up',
  K: 'up',
  j: 'down',
  J: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  ArrowUp: 'up',
  ArrowDown: 'down'
};

// 使用现有 Tailwind palette，避免再扩展主题变量。
// 视觉风格：从冷色（小值）逐渐过渡到暖色（大值），呼应原版 2048。
const TILE_COLOR_CLASSES: Record<number, string> = {
  2: 'bg-stone-200 text-stone-900',
  4: 'bg-stone-300 text-stone-900',
  8: 'bg-amber-300 text-stone-900',
  16: 'bg-amber-400 text-stone-900',
  32: 'bg-orange-400 text-white',
  64: 'bg-orange-500 text-white',
  128: 'bg-yellow-400 text-stone-900',
  256: 'bg-yellow-500 text-white',
  512: 'bg-yellow-600 text-white',
  1024: 'bg-red-500 text-white',
  2048: 'bg-red-600 text-white'
};

const getTileClasses = (value: number): string => {
  if (value === 0) return 'bg-surface-3 text-transparent';
  return TILE_COLOR_CLASSES[value] || 'bg-rose-700 text-white';
};

const buildInitialState = (): GameState => ({
  phase: 'idle',
  board: createInitialBoard(),
  score: 0,
  startAtMs: null,
  endedAtMs: null,
  endedAtIso: null,
  badge: 'none',
  badgeRecorded: { bronze: false, silver: false, gold: false }
});

export const Game2048Game = ({ config }: Game2048GameProps) => {
  const { t } = useTranslationSafe('challenge');
  const { stats, recordRun } = useGame2048Stats();
  const containerRef = useRef<HTMLDivElement>(null);

  const bronzeTile = config?.bronzeTile ?? DEFAULTS.bronzeTile;
  const silverTile = config?.silverTile ?? DEFAULTS.silverTile;
  const goldTile = config?.goldTile ?? DEFAULTS.goldTile;

  const [state, setState] = useState<GameState>(buildInitialState);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const recordedThisRunRef = useRef(false);

  const showBadgeToast = useCallback((badge: Exclude<Badge, 'none'>) => {
    const id = `${badge}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const expiresAtMs = Date.now() + TOAST_VISIBLE_MS;
    setToasts(prev => [...prev, { id, badge, expiresAtMs }]);
  }, []);

  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setTimeout(() => {
      setToasts(prev => prev.filter(t => t.expiresAtMs > Date.now()));
    }, 200);
    return () => clearTimeout(timer);
  }, [toasts]);

  const reset = useCallback(() => {
    setState(buildInitialState());
    setToasts([]);
    recordedThisRunRef.current = false;
  }, []);

  const finalize = useCallback(
    (next: GameState) => {
      if (recordedThisRunRef.current) return;
      recordedThisRunRef.current = true;
      const reachedWin = hasReachedWin(next.board);
      const bestTile = maxTile(next.board);
      const endedAtMs = next.endedAtMs ?? Date.now();
      const durationMs = endedAtMs - (next.startAtMs ?? endedAtMs);
      recordRun({
        score: next.score,
        bestTile,
        durationMs,
        reachedWin,
        endedAt: new Date(endedAtMs).toISOString()
      });
    },
    [recordRun]
  );

  const performMove = useCallback(
    (direction: Direction) => {
      setState(prev => {
        if (prev.phase === 'over') return prev;
        const { board: moved, gained, moved: didMove } = applyMove(prev.board, direction);
        if (!didMove || boardsEqual(moved, prev.board)) return prev;

        const withSpawn = spawnTile(moved);
        const nextScore = prev.score + gained;
        const bestTile = maxTile(withSpawn);

        const badgeRecorded = { ...prev.badgeRecorded };
        let badge = prev.badge;
        if (!badgeRecorded.bronze && bestTile >= bronzeTile) {
          badgeRecorded.bronze = true;
          badge = 'bronze';
          showBadgeToast('bronze');
        }
        if (!badgeRecorded.silver && bestTile >= silverTile) {
          badgeRecorded.silver = true;
          badge = 'silver';
          showBadgeToast('silver');
        }
        if (!badgeRecorded.gold && bestTile >= goldTile) {
          badgeRecorded.gold = true;
          badge = 'gold';
          showBadgeToast('gold');
        }

        const gameOver = !hasAnyMove(withSpawn);
        const startAtMs = prev.startAtMs ?? Date.now();

        const next: GameState = {
          ...prev,
          phase: gameOver ? 'over' : 'playing',
          board: withSpawn,
          score: nextScore,
          startAtMs,
          endedAtMs: gameOver ? Date.now() : null,
          endedAtIso: gameOver ? new Date().toISOString() : null,
          badge,
          badgeRecorded
        };

        if (gameOver) {
          // 在 setState 外触发 recordRun（避免 setState 内副作用），用微任务延迟。
          queueMicrotask(() => finalize(next));
        }

        return next;
      });
    },
    [bronzeTile, silverTile, goldTile, showBadgeToast, finalize]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (state.phase === 'over') {
        if (e.key === 'r' || e.key === 'R') {
          e.preventDefault();
          reset();
        }
        return;
      }
      const direction = KEY_TO_DIRECTION[e.key];
      if (!direction) return;
      e.preventDefault();
      performMove(direction);
    },
    [state.phase, performMove, reset]
  );

  useEffect(() => {
    if (!isFocused) return;
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocused, handleKeyDown]);

  const [elapsedNowMs, setElapsedNowMs] = useState<number | null>(null);
  useEffect(() => {
    if (!state.startAtMs || state.endedAtMs != null) return;

    const updateElapsedNow = () => setElapsedNowMs(Date.now());
    updateElapsedNow();
    const id = window.setInterval(updateElapsedNow, 1000);
    return () => window.clearInterval(id);
  }, [state.startAtMs, state.endedAtMs]);

  const elapsedSec = useMemo(() => {
    if (!state.startAtMs) return 0;
    const end = state.endedAtMs ?? elapsedNowMs ?? state.startAtMs;
    return Math.max(0, Math.floor((end - state.startAtMs) / 1000));
  }, [state.startAtMs, state.endedAtMs, elapsedNowMs]);

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onClick={() => containerRef.current?.focus()}
      className="bg-surface rounded-xl overflow-hidden border border-border shadow-2xl flex flex-col cursor-pointer outline-none focus:ring-2 focus:ring-primary/40"
    >
      {/* Header */}
      <div className="bg-surface-2 border-b border-border p-3 flex items-center justify-between text-sm">
        <div className="flex items-center gap-4 font-mono">
          <span className="text-foreground-strong font-bold">
            {t('game2048.score', 'Score', { ns: 'challenge' })}: {state.score}
          </span>
          <span className="text-foreground-muted">
            {t('game2048.best', 'Best', { ns: 'challenge' })}: {stats.bestScore}
          </span>
          <span className="text-foreground-muted">
            {t('game2048.time', 'Time', { ns: 'challenge' })}: {elapsedSec}s
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            reset();
          }}
          className="hover:text-foreground-strong text-foreground-muted transition-colors flex items-center gap-1 text-xs"
          title={t('game2048.restart', 'Restart', { ns: 'challenge' })}
        >
          <RotateCcw size={14} />
          {t('game2048.restart', 'Restart', { ns: 'challenge' })}
        </button>
      </div>

      {/* Board */}
      <div className="relative flex-1 bg-surface p-4 flex items-center justify-center">
        {!isFocused && state.phase !== 'over' && (
          <div className="absolute inset-0 z-10 bg-surface/80 backdrop-blur-[1px] flex items-center justify-center text-foreground-subtle gap-2">
            <Keyboard size={20} />
            {t('game2048.focusHint', 'Click to focus, then use h/j/k/l', { ns: 'challenge' })}
          </div>
        )}

        <div className="grid grid-cols-4 gap-2 p-3 bg-surface-2 rounded-lg">
          {state.board.map((row, r) =>
            row.map((value, c) => (
              <div
                key={`${r}-${c}`}
                className={`w-16 h-16 md:w-20 md:h-20 rounded-md flex items-center justify-center font-bold text-2xl md:text-3xl transition-colors ${getTileClasses(value)}`}
              >
                {value !== 0 ? value : ''}
              </div>
            ))
          )}
        </div>

        {/* Badge Toasts */}
        <div className="absolute top-3 right-3 z-20 flex flex-col gap-2 pointer-events-none">
          {toasts.map(toast => (
            <div
              key={toast.id}
              className="bg-surface-3 border border-border rounded-lg px-3 py-1.5 text-sm font-bold shadow-2xl animate-in slide-in-from-top duration-300 flex items-center gap-2"
            >
              <Trophy size={14} className={
                toast.badge === 'gold' ? 'text-warning' :
                toast.badge === 'silver' ? 'text-foreground-subtle' :
                'text-warning-strong'
              } />
              <span className="text-foreground-strong">
                {t(`game2048.badge.${toast.badge}`, toast.badge, { ns: 'challenge' })}
              </span>
            </div>
          ))}
        </div>

        {/* Game Over Overlay */}
        {state.phase === 'over' && (
          <div className="absolute inset-0 z-30 bg-surface-2/95 flex flex-col items-center justify-center animate-in fade-in duration-500">
            <div className="bg-surface px-10 py-8 rounded-2xl border border-border shadow-2xl text-center max-w-md mx-4">
              <Trophy className={`w-14 h-14 mx-auto mb-3 ${
                state.badge === 'gold' ? 'text-warning' :
                state.badge === 'silver' ? 'text-foreground-subtle' :
                state.badge === 'bronze' ? 'text-warning-strong' :
                'text-foreground-faint'
              }`} />
              <h3 className="text-xl font-bold text-foreground-strong mb-2">
                {hasReachedWin(state.board)
                  ? t('game2048.win', 'You reached 2048!', { ns: 'challenge' })
                  : t('game2048.gameOver', 'Game Over', { ns: 'challenge' })}
              </h3>
              <p className="text-foreground-subtle mb-4 font-mono text-sm">
                {t('game2048.score', 'Score', { ns: 'challenge' })}: {state.score} · max {maxTile(state.board)}
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  reset();
                }}
                className="bg-primary hover:bg-primary-hover text-primary-foreground px-5 py-2 rounded-lg font-bold transition-all"
              >
                {t('game2048.restart', 'Restart', { ns: 'challenge' })}
              </button>
              <p className="text-foreground-faint text-xs mt-3">
                {t('game2048.restartHint', 'Press r to restart', { ns: 'challenge' })}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer help */}
      <div className="bg-surface-2 border-t border-border p-2 text-xs text-foreground-muted flex justify-center gap-4 font-mono">
        <span>h ← </span>
        <span>j ↓</span>
        <span>k ↑</span>
        <span>l →</span>
        <span className="text-foreground-faint">r {t('game2048.restart', 'Restart', { ns: 'challenge' })}</span>
      </div>
    </div>
  );
};
