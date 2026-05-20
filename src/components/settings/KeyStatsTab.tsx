import { BarChart3 } from 'lucide-react';
import { useKeyStats } from '@/hooks/useKeyStats';
import { useTranslationSafe } from '@/hooks/useI18n';

export const KeyStatsTab = () => {
  const { stats, resetKeyStats } = useKeyStats();
  const { t } = useTranslationSafe('settings');
  const entries = Object.entries(stats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 16);
  const max = Math.max(1, ...entries.map(([, count]) => count));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground-strong flex items-center gap-2">
            <BarChart3 size={18} />
            {t('keyStats.title', 'My Key Stats')}
          </h3>
          <p className="text-sm text-foreground-subtle mt-1">
            {t('keyStats.subtitle', 'Local-only counts from challenge practice.')}
          </p>
        </div>
        <button
          onClick={resetKeyStats}
          className="px-3 py-2 text-sm rounded-md border border-border text-foreground-subtle hover:text-foreground-strong"
        >
          {t('keyStats.reset', 'Reset')}
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="border border-border rounded-lg p-6 text-sm text-foreground-subtle">
          {t('keyStats.empty', 'Practice a challenge to build your key heatmap.')}
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map(([key, count]) => (
            <div key={key} className="grid grid-cols-[72px_1fr_48px] items-center gap-3 text-sm">
              <span className="font-mono text-foreground-strong">{key}</span>
              <div className="h-2 rounded-full bg-surface-3 overflow-hidden">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${Math.max(8, (count / max) * 100)}%` }}
                />
              </div>
              <span className="text-right text-foreground-muted">{count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
