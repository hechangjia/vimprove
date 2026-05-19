import { useState, useEffect, useRef } from 'react';
import { ChevronRight, ChevronDown, Languages, GitBranch } from 'lucide-react';
import { CATEGORIES } from '@/data';
import type { Lesson } from '@/core/types';
import { BRANCH_LINKS, CURRENT_BRANCH } from '@/version';
import { supportedLocales } from '@/i18n';
import { useTranslationSafe, useLocale } from '@/hooks/useI18n';

type SidebarProps = {
  lessons: Lesson[];
  currentLessonSlug: string;
  onLessonSelect: (slug: string) => void;
  onHomeClick: () => void;
  isOpen: boolean;
  isVisible: boolean;
};

export const Sidebar = ({
  lessons,
  currentLessonSlug,
  onLessonSelect,
  onHomeClick,
  isOpen,
  isVisible
}: SidebarProps) => {
  const { t } = useTranslationSafe('layout');
  const { locale, setLocale } = useLocale();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isBranchOpen, setIsBranchOpen] = useState(false);
  const translateLessons = locale !== 'en';
  const langMenuRef = useRef<HTMLDivElement>(null);
  const branchMenuRef = useRef<HTMLDivElement>(null);

  // 点击外部 / Esc 关闭语言菜单与分支菜单。
  useEffect(() => {
    if (!isLangOpen && !isBranchOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (isLangOpen && langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setIsLangOpen(false);
      }
      if (isBranchOpen && branchMenuRef.current && !branchMenuRef.current.contains(e.target as Node)) {
        setIsBranchOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsLangOpen(false);
        setIsBranchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [isLangOpen, isBranchOpen]);
  const branchOptions = [
    { key: 'release' as const, label: t('branchRelease', 'Release'), url: BRANCH_LINKS.release.url, version: BRANCH_LINKS.release.version },
    { key: 'alpha' as const, label: t('branchAlpha', 'Alpha'), url: BRANCH_LINKS.alpha.url, version: BRANCH_LINKS.alpha.version }
  ];
  const currentBranch = branchOptions.find(opt => opt.key === CURRENT_BRANCH) || branchOptions[0];

  return (
    <div
      className={`
        fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] h-screen bg-surface border-r border-border transform transition-transform duration-300 ease-in-out
        flex flex-col
        ${!isVisible ? '-translate-x-full' : isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 md:h-screen md:max-w-none
        ${!isVisible ? 'md:hidden' : ''}
      `}
    >
      {/* Header: hidden on mobile to save vertical space */}
      <button
        onClick={onHomeClick}
        className="px-4 py-3 border-b border-border flex items-center gap-4 hidden md:flex text-left hover:bg-surface-2 transition-colors"
      >
        <img src="/favicon.png" alt="Vimprove" className="w-16 h-16 flex-shrink-0" />
        <span className="font-bold text-4xl logo-text text-logo">Vimprove</span>
      </button>

      <div className="flex-1 p-4 overflow-y-auto flex flex-col">
        <div className="flex-1">
          {CATEGORIES.map(cat => (
            <div key={cat.id} className="mb-5">
              <h3 className="text-sm font-bold text-success-muted-foreground uppercase tracking-wide mb-2 px-2 py-1 border-l-2 border-success">
                {translateLessons
                  ? t(`categories.${cat.id}`, cat.title, { ns: 'lessons' })
                  : cat.title}
              </h3>
              <div className="space-y-0.5">
                {lessons
                  .filter(l => l.categoryId === cat.id)
                  .map(lesson => (
                    <button
                      key={lesson.slug}
                      onClick={() => onLessonSelect(lesson.slug)}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-between
                      ${
                        currentLessonSlug === lesson.slug
                          ? 'bg-surface-3 text-foreground-strong'
                          : 'text-foreground-subtle hover:text-foreground hover:bg-surface-2'
                      }
                    `}
                    >
                      {translateLessons
                        ? t(`lessons.${lesson.slug}.title`, lesson.title, { ns: 'lessons' })
                        : lesson.title}
                      {currentLessonSlug === lesson.slug && (
                        <ChevronRight size={14} className="text-foreground-faint" />
                      )}
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>

      </div>

      <div className="border-t border-border px-4 py-3 bg-surface-2/50 space-y-3">
        <div className="grid grid-cols-2 gap-2 items-center">
          <div className="relative" ref={branchMenuRef}>
            <button
              onClick={() => setIsBranchOpen(open => !open)}
              className="w-full flex items-center gap-2 justify-center bg-surface border border-border rounded-lg px-3 py-2 text-sm text-foreground hover:border-primary transition-colors whitespace-nowrap"
            >
              <GitBranch size={16} />
              <span>{currentBranch.label}</span>
              <ChevronDown size={16} className={isBranchOpen ? 'transform rotate-180' : ''} />
            </button>
            {isBranchOpen && (
              <div
                className="absolute left-0 bottom-full mb-2 w-48 bg-surface border border-border rounded-lg shadow-xl overflow-hidden"
                onMouseLeave={() => setIsBranchOpen(false)}
              >
                {branchOptions.map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => {
                      setIsBranchOpen(false);
                      if (!opt.url) return;
                      window.location.href = opt.url;
                    }}
                    disabled={!opt.url}
                    className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                      CURRENT_BRANCH === opt.key
                        ? 'bg-primary-strong/30 text-foreground-strong'
                        : opt.url
                          ? 'text-foreground hover:bg-surface-3'
                          : 'text-foreground-faint cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span>{opt.label}</span>
                      <span className="font-mono text-xs text-foreground-subtle">v{opt.version}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="relative" ref={langMenuRef}>
            <button
              onClick={() => setIsLangOpen(open => !open)}
              className="w-full flex items-center gap-2 justify-center bg-surface border border-border rounded-lg px-3 py-2 text-sm text-foreground hover:border-primary transition-colors whitespace-nowrap"
            >
              <Languages size={16} />
              {supportedLocales.find(l => l.code === locale)?.shortLabel || locale}
              <ChevronDown size={16} className={isLangOpen ? 'transform rotate-180' : ''} />
            </button>
            {isLangOpen && (
              <div
                className="absolute right-0 bottom-full mb-2 w-44 bg-surface border border-border rounded-lg shadow-xl overflow-hidden"
                onMouseLeave={() => setIsLangOpen(false)}
              >
                {supportedLocales.map(lng => (
                  <button
                    key={lng.code}
                    onClick={() => {
                      setLocale(lng.code);
                      setIsLangOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                      locale === lng.code
                        ? 'bg-primary-strong/30 text-foreground-strong'
                        : 'text-foreground hover:bg-surface-3'
                    }`}
                  >
                    {lng.nativeLabel}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
