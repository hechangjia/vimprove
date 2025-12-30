import { useEffect, useState } from 'react';

type SnakeEndCause = 'wall' | 'self' | 'win';

export type HjklSnakeRun = {
  score: number;
  survivalMs: number;
  timeToScoreMs: number | null;
  endedAt: string;
  cause: SnakeEndCause;
};

export type HjklSnakeStats = {
  version: 1;
  attemptsCount: number;
  bestRun: HjklSnakeRun | null;
  bestSurvivalMs: number;
  recentRuns: HjklSnakeRun[];
};

const STORAGE_KEY = 'vimprove-minigame-hjkl-snake';

const DEFAULT_STATS: HjklSnakeStats = {
  version: 1,
  attemptsCount: 0,
  bestRun: null,
  bestSurvivalMs: 0,
  recentRuns: []
};

const loadStats = (): HjklSnakeStats => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_STATS;
    const parsed = JSON.parse(stored) as Partial<HjklSnakeStats> | null;

    return {
      ...DEFAULT_STATS,
      ...parsed,
      recentRuns: Array.isArray(parsed?.recentRuns) ? (parsed?.recentRuns as HjklSnakeRun[]) : [],
      bestRun: parsed?.bestRun ?? null
    };
  } catch {
    return DEFAULT_STATS;
  }
};

const isBetterRun = (a: HjklSnakeRun, b: HjklSnakeRun) => {
  if (a.score !== b.score) return a.score > b.score;

  const aTime = a.timeToScoreMs ?? Number.POSITIVE_INFINITY;
  const bTime = b.timeToScoreMs ?? Number.POSITIVE_INFINITY;
  if (aTime !== bTime) return aTime < bTime;

  return a.survivalMs > b.survivalMs;
};

const saveStats = (stats: HjklSnakeStats) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save hjkl-snake stats:', e);
  }
};

export const useHjklSnakeStats = () => {
  const [stats, setStats] = useState<HjklSnakeStats>(loadStats);

  useEffect(() => {
    saveStats(stats);
  }, [stats]);

  const recordRun = (run: HjklSnakeRun) => {
    setStats(prev => {
      const bestRun = prev.bestRun == null || isBetterRun(run, prev.bestRun) ? run : prev.bestRun;
      const bestSurvivalMs = Math.max(prev.bestSurvivalMs, run.survivalMs);
      const recentRuns = [run, ...prev.recentRuns].slice(0, 10);

      return {
        ...prev,
        attemptsCount: prev.attemptsCount + 1,
        bestRun,
        bestSurvivalMs,
        recentRuns
      };
    });
  };

  const resetStats = () => {
    setStats(DEFAULT_STATS);
  };

  return { stats, recordRun, resetStats };
};

