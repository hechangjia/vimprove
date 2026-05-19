import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Lesson } from '@/core/types';
import { MarkdownBlock } from '@/components/common/MarkdownBlock';
import { KeyListBlock } from '@/components/common/KeyListBlock';
import { VimChallenge } from '@/components/challenge/VimChallenge';
import { RunExamplePlayer } from '@/components/example/RunExamplePlayer';
import { HjklSnakeGame } from '@/components/minigame/HjklSnakeGame';
import { Game2048Game } from '@/components/minigame/Game2048Game';
import { CheatSheetBlock } from '@/components/common/CheatSheetBlock';
import { useTranslationSafe } from '@/hooks/useI18n';
import { useLocale } from '@/hooks/useI18n';

type LessonViewProps = {
  lesson: Lesson;
  onNext?: () => void;
  onPrev?: () => void;
};

export const LessonView = ({ lesson, onNext, onPrev }: LessonViewProps) => {
  const { t } = useTranslationSafe('lessons');
  const { locale } = useLocale();
  const translateLessons = locale !== 'en';

  const title = translateLessons
    ? t(`lessons.${lesson.slug}.title`, lesson.title)
    : lesson.title;
  const shortDescription = translateLessons
    ? t(`lessons.${lesson.slug}.shortDescription`, lesson.shortDescription)
    : lesson.shortDescription;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 pt-16 md:pt-6 pb-32 animate-in slide-in-from-right duration-300">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground-strong mb-2">{title}</h1>
        <p className="text-foreground-subtle text-lg">{shortDescription}</p>
      </div>

      {lesson.contentBlocks.map((block, idx) => {
        const blockKey = block.i18nKey || `lessons.${lesson.slug}.content.${idx}`;
        const reactKey = `${lesson.slug}-${idx}`;

        if (block.type === 'markdown') {
          // 类型守卫：若 i18n 条目错放成 object/undefined，回退到 .ts 原文，
          // 避免 React 抛 "Objects are not valid as a React child" 导致整页白屏。
          const translated = translateLessons ? t(blockKey, block.content) : block.content;
          const content = typeof translated === 'string' ? translated : block.content;
          return <MarkdownBlock key={reactKey} content={content} />;
        }
        if (block.type === 'key-list') {
          return (
            <KeyListBlock
              key={reactKey}
              keys={block.keys}
              i18nBaseKey={translateLessons ? `${blockKey}` : undefined}
              disableI18n={!translateLessons}
            />
          );
        }
        if (block.type === 'run-example') {
          return (
            <div key={reactKey} className="my-12">
              <RunExamplePlayer
                config={block.config}
                lessonSlug={translateLessons ? lesson.slug : undefined}
                i18nBaseKey={translateLessons ? blockKey : undefined}
                disableI18n={!translateLessons}
              />
            </div>
          );
        }
        if (block.type === 'challenge') {
          return (
            <div key={reactKey} className="my-12">
              <VimChallenge
                config={block.config}
                lessonSlug={translateLessons ? lesson.slug : undefined}
                i18nBaseKey={translateLessons ? blockKey : undefined}
                disableContentI18n={!translateLessons}
                onComplete={({ next }) => {
                  if (next && onNext) onNext();
                }}
              />
            </div>
          );
        }
        if (block.type === 'hjkl-snake') {
          return <HjklSnakeGame key={reactKey} config={block.config} />;
        }
        if (block.type === 'game-2048') {
          return <Game2048Game key={reactKey} config={block.config} />;
        }
        if (block.type === 'cheat-sheet') {
          return <CheatSheetBlock key={reactKey} config={block.config} />;
        }
        return null;
      })}

      <div className="flex justify-between mt-16 border-t border-border pt-8">
        <button
          onClick={onPrev}
          disabled={!onPrev}
          className="flex items-center gap-2 text-foreground-faint hover:text-foreground-strong disabled:opacity-0 transition-colors"
        >
          <ChevronLeft /> {t('nav.previous', 'Previous Lesson', { ns: 'lesson' })}
        </button>
        <button
          onClick={onNext}
          disabled={!onNext}
          className="flex items-center gap-2 text-foreground-faint hover:text-foreground-strong disabled:opacity-0 transition-colors"
        >
          {t('nav.next', 'Next Lesson', { ns: 'lesson' })} <ChevronRight />
        </button>
      </div>
    </div>
  );
};
