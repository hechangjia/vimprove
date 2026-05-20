import { useCallback, useState } from 'react';

export type KeyStats = Record<string, number>;

const STORAGE_KEY = 'vimprove-key-stats';

const formatKey = (key: string, ctrlKey: boolean): string => {
  if (ctrlKey) return `Ctrl-${key}`;
  if (key === 'Escape') return 'Esc';
  if (key === ' ') return 'Space';
  return key;
};

export const loadKeyStats = (): KeyStats => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const saveKeyStats = (stats: KeyStats) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // localStorage may be unavailable; stats are non-critical.
  }
};

export const useKeyStats = () => {
  const [stats, setStats] = useState<KeyStats>(loadKeyStats);

  const recordKeyStat = useCallback((key: string, ctrlKey: boolean) => {
    const display = formatKey(key, ctrlKey);
    setStats(prev => {
      const next = { ...prev, [display]: (prev[display] ?? 0) + 1 };
      saveKeyStats(next);
      return next;
    });
  }, []);

  const resetKeyStats = useCallback(() => {
    setStats({});
    saveKeyStats({});
  }, []);

  return { stats, recordKeyStat, resetKeyStats };
};
