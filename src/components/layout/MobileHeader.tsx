import { useState, useEffect, useRef } from 'react';
import { Menu, X, Settings, Github, SkipBack, SkipForward, Languages } from 'lucide-react';
import { useTranslationSafe, useLocale } from '@/hooks/useI18n';
import { supportedLocales } from '@/i18n';

type MobileHeaderProps = {
  isVisible: boolean;
  sidebarOpen: boolean;
  onMenuToggle: () => void;
  onSettingsClick: () => void;
  showPrevButton?: boolean;
  showNextButton?: boolean;
  onPrevClick?: () => void;
  onNextClick?: () => void;
};

export const MobileHeader = ({
  isVisible,
  sidebarOpen,
  onMenuToggle,
  onSettingsClick,
  showPrevButton,
  showNextButton,
  onPrevClick,
  onNextClick
}: MobileHeaderProps) => {
  const { t } = useTranslationSafe('layout');
  const { locale, setLocale } = useLocale();
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  // lastScrollY 仅在 scroll 回调里读写，放进 ref 避免触发 effect 反复 detach/attach。
  const lastScrollYRef = useRef(0);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  // 点击外部 / Esc 关闭语言菜单。
  useEffect(() => {
    if (!isLangOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setIsLangOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsLangOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [isLangOpen]);

  useEffect(() => {
    // 通过显式契约 data-scroll-container 找滚动容器，避免依赖 Tailwind 类名组合。
    const scrollContainer = document.querySelector('[data-scroll-container]') as HTMLElement | null;
    if (!scrollContainer) return;

    const handleScroll = () => {
      const currentScrollY = scrollContainer.scrollTop;
      const lastScrollY = lastScrollYRef.current;

      if (currentScrollY < 10) {
        setIsHeaderVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsHeaderVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setIsHeaderVisible(true);
      }

      lastScrollYRef.current = currentScrollY;
    };

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <header
      className={`
        fixed top-0 left-0 right-0 z-50
        bg-surface/95 backdrop-blur-sm border-b border-border
        transition-transform duration-300
        md:hidden
        ${isHeaderVisible ? 'translate-y-0' : '-translate-y-full'}
      `}
    >
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left: Logo and Title */}
        <div className="flex items-center gap-2">
          <img src="/favicon.png" alt="Vimprove" className="w-8 h-8" />
          <span className="font-bold text-lg logo-text">Vimprove</span>
        </div>

        {/* Right: All buttons evenly spaced */}
        <div className="flex items-center gap-1 relative">
          {showPrevButton && onPrevClick && (
            <button
              onClick={onPrevClick}
              className="p-2 hover:bg-surface-3 rounded-lg transition-colors"
              title={t('prevLesson', 'Previous Lesson')}
            >
              <SkipBack size={20} />
            </button>
          )}
          {showNextButton && onNextClick && (
            <button
              onClick={onNextClick}
              className="p-2 hover:bg-surface-3 rounded-lg transition-colors"
              title={t('nextLesson', 'Next Lesson')}
            >
              <SkipForward size={20} />
            </button>
          )}
          {/* Language Switcher */}
          <div className="relative" ref={langMenuRef}>
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="p-2 hover:bg-surface-3 rounded-lg transition-colors"
              title={t('language', 'Language')}
            >
              <Languages size={20} />
            </button>
            {isLangOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-36 bg-surface border border-border rounded-lg shadow-xl overflow-hidden z-50"
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
          <button
            onClick={onSettingsClick}
            className="p-2 hover:bg-surface-3 rounded-lg transition-colors"
            title={t('settings', 'Settings')}
          >
            <Settings size={20} />
          </button>
          <button
            onClick={onMenuToggle}
            className="p-2 hover:bg-surface-3 rounded-lg transition-colors"
            aria-label={t('menu', 'Menu')}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <a
            href="https://github.com/Jerry-Terrasse/vimprove"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 hover:bg-surface-3 rounded-lg transition-colors"
            title={t('starOnGithub', 'Give me a Star!')}
          >
            <Github size={20} />
          </a>
        </div>
      </div>
    </header>
  );
};
