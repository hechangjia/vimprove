import { memo, useMemo, useRef, useState } from 'react';
import { CATEGORIES } from '@/data/categories';
import { LESSONS } from '@/data';
import type { CheatSheetConfig, KeyItem } from '@/core/types';
import { useTranslationSafe } from '@/hooks/useI18n';

type Props = { config: CheatSheetConfig };

const collectKeysForChapter = (chapterId: string): KeyItem[] => {
  const seen = new Set<string>();
  const out: KeyItem[] = [];
  for (const lesson of LESSONS) {
    if (lesson.categoryId !== chapterId) continue;
    for (const block of lesson.contentBlocks) {
      if (block.type !== 'key-list') continue;
      for (const k of block.keys) {
        const id = k.chars.join('+');
        if (!seen.has(id)) {
          seen.add(id);
          out.push(k);
        }
      }
    }
  }
  return out;
};

const CheatSheetBlockImpl = ({ config }: Props) => {
  const { t } = useTranslationSafe('challenge');
  const ref = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);

  const chapter = useMemo(
    () => CATEGORIES.find((c) => c.id === config.chapterId),
    [config.chapterId],
  );
  const keys = useMemo(
    () => collectKeysForChapter(config.chapterId),
    [config.chapterId],
  );
  const title = config.title ?? `${chapter?.title ?? config.chapterId} — Cheat Sheet`;

  const download = async () => {
    if (!ref.current) return;
    setBusy(true);
    try {
      // Dynamic import: html-to-image (~30 KB) only loads on first click.
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(ref.current, {
        pixelRatio: 2,
        backgroundColor: '#0c0a09',
      });
      const link = document.createElement('a');
      link.download = `${config.chapterId}-cheat-sheet.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Cheat sheet export failed', err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="my-12">
      <div
        ref={ref}
        className="rounded-xl border border-border bg-surface p-6"
      >
        <h3 className="text-xl font-semibold text-foreground-strong mb-4">
          {title}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {keys.map((k, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <div className="flex gap-1 flex-shrink-0">
                {k.chars.map((c, i) => (
                  <kbd
                    key={i}
                    className="px-2 py-1 bg-stone-800 text-stone-100 rounded text-sm font-mono"
                  >
                    {c}
                  </kbd>
                ))}
              </div>
              <p className="text-sm text-foreground-subtle flex-1">{k.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <button
        type="button"
        onClick={download}
        disabled={busy}
        className="mt-3 px-4 py-2 bg-primary text-primary-foreground rounded text-sm disabled:opacity-50 hover:opacity-90 transition-opacity"
      >
        {busy
          ? t('cheatSheet.exporting', 'Exporting…')
          : t('cheatSheet.download', 'Download as PNG')}
      </button>
    </div>
  );
};

export const CheatSheetBlock = memo(CheatSheetBlockImpl);
