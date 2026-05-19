import { useEffect, useState } from 'react';

export type Game2048Run = {
  score: number;
  bestTile: number;
  durationMs: number;
  reachedWin: boolean;
  endedAt: string;
};

export type Game2048Stats = {
  version: 1;
  attemptsCount: number;
  bestRun: Game2048Run | null;
  bestScore: number;
  bestTile: number;
  recentRuns: Game2048Run[];
};

const STORAGE_KEY = 'vimprove-minigame-2048';

const DEFAULT_STATS: Game2048Stats = {
  version: 1,
  attemptsCount: 0,
  bestRun: null,
  bestScore: 0,
  bestTile: 0,
  recentRuns: []
};

const loadStats = (): Game2048Stats => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_STATS;
    const parsed = JSON.parse(stored) as Partial<Game2048Stats> | null;
    return {
      ...DEFAULT_STATS,
      ...parsed,
      recentRuns: Array.isArray(parsed?.recentRuns) ? (parsed?.recentRuns as Game2048Run[]) : [],
      bestRun: parsed?.bestRun ?? null
    };
  } catch {
    return DEFAULT_STATS;
  }
};

// 谁更好：先比 bestTile，再比 score，再比用时短。
const isBetterRun = (a: Game2048Run, b: Game2048Run) => {
  if (a.bestTile !== b.bestTile) return a.bestTile > b.bestTile;
  if (a.score !== b.score) return a.score > b.score;
  return a.durationMs < b.durationMs;
};

const saveStats = (stats: Game2048Stats) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save 2048 stats:', e);
  }
};

export const useGame2048Stats = () => {
  const [stats, setStats] = useState<Game2048Stats>(loadStats);

  useEffect(() => {
    saveStats(stats);
  }, [stats]);

  const recordRun = (run: Game2048Run) => {
    setStats(prev => {
      const bestRun = prev.bestRun == null || isBetterRun(run, prev.bestRun) ? run : prev.bestRun;
      const bestScore = Math.max(prev.bestScore, run.score);
      const bestTile = Math.max(prev.bestTile, run.bestTile);
      const recentRuns = [run, ...prev.recentRuns].slice(0, 10);

      return {
        ...prev,
        attemptsCount: prev.attemptsCount + 1,
        bestRun,
        bestScore,
        bestTile,
        recentRuns
      };
    });
  };

  const resetStats = () => {
    setStats(DEFAULT_STATS);
  };

  return { stats, recordRun, resetStats };
};
