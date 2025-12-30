import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Keyboard, RotateCcw, Trophy } from 'lucide-react';
import type { HjklSnakeGameConfig } from '@/core/types';
import { useTranslationSafe } from '@/hooks/useI18n';
import { useHjklSnakeStats } from '@/hooks/useHjklSnakeStats';

type Dir = 'left' | 'right' | 'up' | 'down';
type Badge = 'none' | 'bronze' | 'silver' | 'gold';
type EndCause = 'wall' | 'self' | 'win';

type Pos = { x: number; y: number };

type Toast = {
  id: string;
  badge: Exclude<Badge, 'none'>;
  expiresAtMs: number;
};

type GameState = {
  phase: 'idle' | 'playing' | 'dead';
  boardWidth: number;
  boardHeight: number;

  snake: Pos[];
  direction: Dir | null;
  food: Pos | null;

  score: number;
  tickMs: number;

  startAtMs: number | null;
  lastEatAtMs: number | null;

  badge: Badge;
  toasts: Toast[];

  deathCause: EndCause | null;
  endedAtMs: number | null;
  endedAtIso: string | null;
};

const DEFAULTS = {
  boardWidth: 32,
  boardHeight: 18,
  bronzeScore: 5,
  silverScore: 10,
  goldScore: 15
} as const;

const INITIAL_TICK_MS = 200;
const MIN_TICK_MS = 80;
const SPEED_MULTIPLIER_PER_FOOD = 0.965;

const isOpposite = (a: Dir, b: Dir) => {
  return (
    (a === 'left' && b === 'right')
    || (a === 'right' && b === 'left')
    || (a === 'up' && b === 'down')
    || (a === 'down' && b === 'up')
  );
};

const moveVector = (dir: Dir): Pos => {
  switch (dir) {
    case 'left':
      return { x: -1, y: 0 };
    case 'right':
      return { x: 1, y: 0 };
    case 'up':
      return { x: 0, y: -1 };
    case 'down':
      return { x: 0, y: 1 };
  }
};

const posKey = (p: Pos) => `${p.x},${p.y}`;

const randomInt = (maxExclusive: number) => Math.floor(Math.random() * maxExclusive);

const formatMmSs = (ms: number) => {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
};

const getRgb = (varName: string) => {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  const parts = raw.split(/\s+/).map(n => Number(n));
  if (parts.length !== 3 || parts.some(n => Number.isNaN(n))) return [0, 0, 0] as const;
  return parts as readonly [number, number, number];
};

const rgba = (rgb: readonly [number, number, number], a: number) => `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a})`;
const rgb = (rgb: readonly [number, number, number]) => `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;

const buildInitialSnake = (head: Pos, dir: Dir): Pos[] => {
  const v = moveVector(dir);
  const back = { x: -v.x, y: -v.y };
  return [
    head,
    { x: head.x + back.x, y: head.y + back.y },
    { x: head.x + back.x * 2, y: head.y + back.y * 2 }
  ];
};

const spawnFood = (boardWidth: number, boardHeight: number, snake: Pos[]): Pos | null => {
  const occupied = new Set(snake.map(posKey));
  const empty: Pos[] = [];
  for (let y = 0; y < boardHeight; y++) {
    for (let x = 0; x < boardWidth; x++) {
      const p = { x, y };
      if (!occupied.has(posKey(p))) empty.push(p);
    }
  }
  if (empty.length === 0) return null;
  return empty[randomInt(empty.length)];
};

const computeBadge = (score: number, bronze: number, silver: number, gold: number): Badge => {
  if (score >= gold) return 'gold';
  if (score >= silver) return 'silver';
  if (score >= bronze) return 'bronze';
  return 'none';
};

const nextTickMs = (tickMs: number) => {
  const next = Math.round(tickMs * SPEED_MULTIPLIER_PER_FOOD);
  return Math.max(MIN_TICK_MS, next);
};

export const HjklSnakeGame = ({ config }: { config?: HjklSnakeGameConfig }) => {
  const { t } = useTranslationSafe('minigame');
  const { stats, recordRun, resetStats } = useHjklSnakeStats();

  const boardWidth = config?.boardWidth ?? DEFAULTS.boardWidth;
  const boardHeight = config?.boardHeight ?? DEFAULTS.boardHeight;
  const bronzeScore = config?.bronzeScore ?? DEFAULTS.bronzeScore;
  const silverScore = config?.silverScore ?? DEFAULTS.silverScore;
  const goldScore = config?.goldScore ?? DEFAULTS.goldScore;

  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastRecordedEndRef = useRef<number | null>(null);

  const initialState: GameState = useMemo(() => {
    return {
      phase: 'idle',
      boardWidth,
      boardHeight,
      snake: [],
      direction: null,
      food: null,
      score: 0,
      tickMs: INITIAL_TICK_MS,
      startAtMs: null,
      lastEatAtMs: null,
      badge: 'none',
      toasts: [],
      deathCause: null,
      endedAtMs: null,
      endedAtIso: null
    };
  }, [boardWidth, boardHeight]);

  const [game, setGame] = useState<GameState>(initialState);

  useEffect(() => {
    setGame(initialState);
  }, [initialState]);

  const startNewRunFrom = useCallback((prev: GameState, dir: Dir): GameState => {
    const head = { x: Math.floor(prev.boardWidth / 2), y: Math.floor(prev.boardHeight / 2) };
    const snake = buildInitialSnake(head, dir);
    const food = spawnFood(prev.boardWidth, prev.boardHeight, snake);
    const now = performance.now();
    lastRecordedEndRef.current = null;

    return {
      ...prev,
      phase: 'playing',
      snake,
      direction: dir,
      food,
      score: 0,
      tickMs: INITIAL_TICK_MS,
      startAtMs: now,
      lastEatAtMs: null,
      badge: 'none',
      toasts: [],
      deathCause: null,
      endedAtMs: null,
      endedAtIso: null
    };
  }, []);

  const handleRestart = useCallback(() => {
    setGame(prev => ({
      ...prev,
      phase: 'idle',
      snake: [],
      direction: null,
      food: null,
      score: 0,
      tickMs: INITIAL_TICK_MS,
      startAtMs: null,
      lastEatAtMs: null,
      badge: 'none',
      toasts: [],
      deathCause: null,
      endedAtMs: null,
      endedAtIso: null
    }));
    lastRecordedEndRef.current = null;
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') return;
    if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock'].includes(e.key)) return;

    e.preventDefault();

    if (e.key === 'r' && game.phase === 'dead') {
      handleRestart();
      return;
    }

    const nextDir: Dir | null =
      e.key === 'h' ? 'left'
        : e.key === 'j' ? 'down'
          : e.key === 'k' ? 'up'
            : e.key === 'l' ? 'right'
              : null;

    if (!nextDir) return;

    setGame(prev => {
      if (prev.phase === 'idle') return startNewRunFrom(prev, nextDir);
      if (prev.phase === 'dead') return prev;

      if (prev.direction && isOpposite(prev.direction, nextDir)) return prev;
      return { ...prev, direction: nextDir };
    });
  };

  useEffect(() => {
    if (game.phase !== 'playing') return;
    const id = window.setInterval(() => {
      const now = performance.now();
      setGame(prev => {
        if (prev.phase !== 'playing') return prev;
        if (!prev.direction) return prev;

        const v = moveVector(prev.direction);
        const head = prev.snake[0];
        const nextHead = { x: head.x + v.x, y: head.y + v.y };

        const prunedToasts = prev.toasts.filter(toast => toast.expiresAtMs > now);

        if (
          nextHead.x < 0
          || nextHead.x >= prev.boardWidth
          || nextHead.y < 0
          || nextHead.y >= prev.boardHeight
        ) {
          return {
            ...prev,
            phase: 'dead',
            toasts: prunedToasts,
            deathCause: 'wall',
            endedAtMs: now,
            endedAtIso: new Date().toISOString()
          };
        }

        const willEat = prev.food != null && nextHead.x === prev.food.x && nextHead.y === prev.food.y;
        const occupied = new Set(prev.snake.map(posKey));
        if (!willEat && prev.snake.length > 0) {
          occupied.delete(posKey(prev.snake[prev.snake.length - 1]));
        }
        if (occupied.has(posKey(nextHead))) {
          return {
            ...prev,
            phase: 'dead',
            toasts: prunedToasts,
            deathCause: 'self',
            endedAtMs: now,
            endedAtIso: new Date().toISOString()
          };
        }

        const nextSnake = [nextHead, ...prev.snake];
        if (!willEat) nextSnake.pop();

        if (!willEat) {
          return {
            ...prev,
            snake: nextSnake,
            toasts: prunedToasts
          };
        }

        const nextScore = prev.score + 1;
        const nextBadge = computeBadge(nextScore, bronzeScore, silverScore, goldScore);
        const prevBadge = prev.badge;
        const badgeUpgraded =
          (prevBadge === 'none' && nextBadge !== 'none')
          || (prevBadge === 'bronze' && (nextBadge === 'silver' || nextBadge === 'gold'))
          || (prevBadge === 'silver' && nextBadge === 'gold');

        const toasts = badgeUpgraded && nextBadge !== 'none'
          ? [
              ...prunedToasts,
              { id: `${now}-${nextBadge}`, badge: nextBadge, expiresAtMs: now + 1200 }
            ]
          : prunedToasts;

        const nextFood = spawnFood(prev.boardWidth, prev.boardHeight, nextSnake);
        if (nextFood == null) {
          return {
            ...prev,
            snake: nextSnake,
            score: nextScore,
            tickMs: nextTickMs(prev.tickMs),
            lastEatAtMs: now,
            badge: nextBadge,
            toasts,
            phase: 'dead',
            deathCause: 'win',
            endedAtMs: now,
            endedAtIso: new Date().toISOString()
          };
        }

        return {
          ...prev,
          snake: nextSnake,
          food: nextFood,
          score: nextScore,
          tickMs: nextTickMs(prev.tickMs),
          lastEatAtMs: now,
          badge: nextBadge,
          toasts
        };
      });
    }, game.tickMs);

    return () => window.clearInterval(id);
  }, [game.phase, game.tickMs, bronzeScore, silverScore, goldScore]);

  useEffect(() => {
    if (game.phase !== 'dead') return;
    if (game.endedAtMs == null || game.endedAtIso == null) return;
    if (game.startAtMs == null) return;
    if (lastRecordedEndRef.current === game.endedAtMs) return;

    lastRecordedEndRef.current = game.endedAtMs;

    const survivalMs = Math.max(0, Math.round(game.endedAtMs - game.startAtMs));
    const timeToScoreMs = game.score > 0 && game.lastEatAtMs != null
      ? Math.max(0, Math.round(game.lastEatAtMs - game.startAtMs))
      : null;

    recordRun({
      score: game.score,
      survivalMs,
      timeToScoreMs,
      endedAt: game.endedAtIso,
      cause: game.deathCause ?? 'wall'
    });
  }, [
    game.phase,
    game.endedAtMs,
    game.endedAtIso,
    game.startAtMs,
    game.lastEatAtMs,
    game.score,
    game.deathCause,
    recordRun
  ]);

  const elapsedMs =
    game.startAtMs == null
      ? 0
      : game.endedAtMs != null
        ? Math.max(0, Math.round(game.endedAtMs - game.startAtMs))
        : Math.max(0, Math.round(performance.now() - game.startAtMs));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cell = 20;
    const pxW = game.boardWidth * cell;
    const pxH = game.boardHeight * cell;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.floor(pxW * dpr);
    canvas.height = Math.floor(pxH * dpr);
    canvas.style.width = `${pxW}px`;
    canvas.style.height = `${pxH}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const surface2 = getRgb('--color-surface-2');
    const border = getRgb('--color-border-strong');
    const snakeBody = getRgb('--color-primary');
    const snakeHead = getRgb('--color-primary-strong');
    const food = getRgb('--color-danger');

    ctx.clearRect(0, 0, pxW, pxH);
    ctx.fillStyle = rgb(surface2);
    ctx.fillRect(0, 0, pxW, pxH);

    ctx.strokeStyle = rgba(border, 0.25);
    ctx.lineWidth = 1;
    for (let x = 0; x <= game.boardWidth; x++) {
      ctx.beginPath();
      ctx.moveTo(x * cell + 0.5, 0);
      ctx.lineTo(x * cell + 0.5, pxH);
      ctx.stroke();
    }
    for (let y = 0; y <= game.boardHeight; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * cell + 0.5);
      ctx.lineTo(pxW, y * cell + 0.5);
      ctx.stroke();
    }

    if (game.food) {
      ctx.fillStyle = rgb(food);
      ctx.fillRect(game.food.x * cell + 3, game.food.y * cell + 3, cell - 6, cell - 6);
    }

    game.snake.forEach((p, idx) => {
      ctx.fillStyle = idx === 0 ? rgb(snakeHead) : rgb(snakeBody);
      ctx.fillRect(p.x * cell + 2, p.y * cell + 2, cell - 4, cell - 4);
    });
  }, [game.boardWidth, game.boardHeight, game.food, game.snake]);

  const bestLabel = useMemo(() => {
    if (!stats.bestRun) return t('hjklSnake.best.none', '—');
    const time = stats.bestRun.timeToScoreMs != null ? formatMmSs(stats.bestRun.timeToScoreMs) : t('hjklSnake.best.noTime', '—');
    return `${stats.bestRun.score} @ ${time}`;
  }, [stats.bestRun, t]);

  const speedLabel = game.phase === 'playing' ? String(Math.round(1000 / game.tickMs)) : '—';

  const badgeText = (badge: Badge) => {
    if (badge === 'bronze') return t('hjklSnake.badge.bronze', 'Bronze');
    if (badge === 'silver') return t('hjklSnake.badge.silver', 'Silver');
    if (badge === 'gold') return t('hjklSnake.badge.gold', 'Gold');
    return t('hjklSnake.badge.none', 'None');
  };

  const badgeClassName = (badge: Exclude<Badge, 'none'>) => {
    if (badge === 'gold') return 'bg-medal-gold-soft text-medal-gold-foreground border-medal-gold/50';
    if (badge === 'silver') return 'bg-medal-silver-soft text-medal-silver-foreground border-medal-silver/50';
    return 'bg-medal-bronze-soft text-medal-bronze-foreground border-medal-bronze/50';
  };

  return (
    <div className="my-12">
      <div className="bg-surface rounded-xl overflow-hidden border border-border shadow-2xl">
        <div className="bg-surface-2 border-b border-border p-3 flex items-center justify-between text-sm font-mono">
          <div className="flex items-center gap-4">
            <div className="text-foreground-muted">
              {t('hjklSnake.label.score', 'Score')}: <span className="text-foreground-strong font-bold">{game.score}</span>
            </div>
            <div className="text-foreground-muted">
              {t('hjklSnake.label.time', 'Time')}: <span className="text-foreground-strong font-bold">{formatMmSs(elapsedMs)}</span>
            </div>
            <div className="text-foreground-muted">
              {t('hjklSnake.label.speed', 'Speed')}: <span className="text-foreground-strong font-bold">{speedLabel}</span>
            </div>
            <div className="text-foreground-muted">
              {t('hjklSnake.label.best', 'Best')}: <span className="text-foreground-strong font-bold">{bestLabel}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {game.badge !== 'none' && (
              <div className={`px-2 py-0.5 rounded text-xs font-bold border ${badgeClassName(game.badge)}`}>
                {badgeText(game.badge)}
              </div>
            )}
            <button
              onClick={handleRestart}
              className="hover:text-foreground-strong text-foreground-muted transition-colors"
              title={t('hjklSnake.action.restart', 'Restart')}
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>

        <div
          className="relative bg-surface flex items-center justify-center py-6"
          onClick={() => inputRef.current?.focus()}
        >
          <input
            ref={inputRef}
            type="text"
            className="opacity-0 absolute top-0 left-0 h-full w-full cursor-none"
            onBlur={() => setIsFocused(false)}
            onFocus={() => setIsFocused(true)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
          />

          <div className="relative">
            <canvas ref={canvasRef} className="border border-border-strong rounded-lg shadow-sm" />

            {game.toasts.length > 0 && (
              <div className="absolute top-3 right-3 flex flex-col gap-2">
                {game.toasts.map(toast => (
                  <div
                    key={toast.id}
                    className={`shadow-lg rounded-lg px-3 py-2 text-sm font-semibold border ${badgeClassName(toast.badge)}`}
                  >
                    {t('hjklSnake.toast.reached', 'Reached {{badge}}', { badge: badgeText(toast.badge) })}
                  </div>
                ))}
              </div>
            )}

            {!isFocused && (
              <div className="absolute inset-0 z-10 bg-surface/80 backdrop-blur-[1px] flex items-center justify-center text-foreground-subtle gap-2 rounded-lg">
                <Keyboard size={20} />
                {t('hjklSnake.focus', 'Click to focus')}
              </div>
            )}

            {isFocused && game.phase === 'idle' && (
              <div className="absolute inset-0 z-10 bg-surface/70 backdrop-blur-[1px] flex items-center justify-center text-foreground-subtle gap-2 rounded-lg">
                {t('hjklSnake.hintStart', 'Press h/j/k/l to start')}
              </div>
            )}

            {isFocused && game.phase === 'dead' && (
              <div className="absolute inset-10 z-20 bg-surface-2/90 flex flex-col items-center justify-center animate-in fade-in duration-200 rounded-xl border border-border shadow-2xl">
                <div className="bg-surface px-10 py-8 rounded-2xl border border-border shadow-2xl text-center max-w-lg mx-4">
                  <Trophy className="w-12 h-12 text-warning mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-foreground-strong mb-2">
                    {t('hjklSnake.gameOver.title', 'Game Over')}
                  </h3>
                  <p className="text-foreground-subtle mb-6">
                    {t('hjklSnake.gameOver.summary', 'Score {{score}} · Time {{time}}', {
                      score: game.score,
                      time: formatMmSs(elapsedMs)
                    })}
                  </p>

                  <div className="text-sm text-foreground-muted mb-6 space-y-1">
                    <div>
                      {t('hjklSnake.stats.best', 'Best')}: <span className="text-foreground-strong font-bold">{bestLabel}</span>
                    </div>
                    <div>
                      {t('hjklSnake.stats.bestSurvival', 'Best survival')}: <span className="text-foreground-strong font-bold">{formatMmSs(stats.bestSurvivalMs)}</span>
                    </div>
                    <div>
                      {t('hjklSnake.stats.attempts', 'Attempts')}: <span className="text-foreground-strong font-bold">{stats.attemptsCount}</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleRestart}
                      className="flex-1 bg-surface-2 hover:bg-surface-3 text-foreground-strong px-6 py-2 rounded-lg font-bold transition-colors border border-border"
                    >
                      {t('hjklSnake.action.restart', 'Restart')}
                    </button>
                    <button
                      onClick={resetStats}
                      className="flex-1 bg-surface-2 hover:bg-surface-3 text-foreground-subtle px-6 py-2 rounded-lg font-bold transition-colors border border-border"
                    >
                      {t('hjklSnake.action.resetStats', 'Reset stats')}
                    </button>
                  </div>

                  <p className="text-foreground-faint text-sm mt-4">
                    {t('hjklSnake.gameOver.hint', 'Press h/j/k/l to restart')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-surface-2 border-t border-border p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="text-xs uppercase tracking-widest text-foreground-faint font-bold">
              {t('hjklSnake.legend.title', 'Controls')}
            </div>
            <div className="flex items-center gap-2 text-sm font-mono">
              <span className="px-2 py-1 rounded bg-surface border border-border text-foreground-strong">h</span>
              <span className="text-foreground-faint">←</span>
              <span className="px-2 py-1 rounded bg-surface border border-border text-foreground-strong">j</span>
              <span className="text-foreground-faint">↓</span>
              <span className="px-2 py-1 rounded bg-surface border border-border text-foreground-strong">k</span>
              <span className="text-foreground-faint">↑</span>
              <span className="px-2 py-1 rounded bg-surface border border-border text-foreground-strong">l</span>
              <span className="text-foreground-faint">→</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
