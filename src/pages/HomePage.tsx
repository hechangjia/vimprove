import { useState, useEffect, useRef } from 'react';
import { Terminal, Play, Keyboard, Trophy, Code2, Languages, ChevronDown } from 'lucide-react';
import { VERSION, VERSION_LABEL } from '@/version';
import { useTranslationSafe, useLocale } from '@/hooks/useI18n';
import { supportedLocales } from '@/i18n';

type HomePageProps = {
  onStart: () => void;
  onSurvivalPack: () => void;
};

export const HomePage = ({ onStart, onSurvivalPack }: HomePageProps) => {
  const { t } = useTranslationSafe('home');
  const { locale, setLocale } = useLocale();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  // 点击外部 / 按 Esc 关闭语言菜单，避免只能靠再次点击按钮才能合上。
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

  const features = [
    {
      icon: Keyboard,
      title: t('features.realEngine.title', 'Real Engine'),
      desc: t(
        'features.realEngine.desc',
        'A custom built Vim engine running directly in your browser.'
      )
    },
    {
      icon: Trophy,
      title: t('features.gamified.title', 'Gamified'),
      desc: t('features.gamified.desc', 'Complete challenges to unlock new levels and track stats.')
    },
    {
      icon: Code2,
      title: t('features.interactive.title', 'Interactive'),
      desc: t(
        'features.interactive.desc',
        "Don't just read. Type. Edit. Delete. Practice makes perfect."
      )
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center max-w-2xl mx-auto px-6 animate-in fade-in duration-500 relative">
      <div className="w-full flex justify-end mb-6">
        <div className="relative" ref={langMenuRef}>
          <button
            onClick={() => setIsLangOpen(open => !open)}
            className="flex items-center gap-2 bg-surface/80 border border-border text-foreground rounded-full px-3 py-1.5 text-sm hover:border-primary transition-colors"
          >
            <Languages size={16} />
            <span className="font-medium">
              {supportedLocales.find(l => l.code === locale)?.shortLabel || locale}
            </span>
            <ChevronDown size={14} className={isLangOpen ? 'transform rotate-180' : ''} />
          </button>
          {isLangOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-surface border border-border rounded-xl shadow-2xl overflow-hidden z-10">
              <div className="px-3 py-2 text-xs text-foreground-faint border-b border-border text-left">
                {t('language.menuTitle', 'Choose language')}
              </div>
              {supportedLocales.map(lng => (
                <button
                  key={lng.code}
                  onClick={() => {
                    setLocale(lng.code);
                    setIsLangOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    locale === lng.code
                      ? 'bg-primary-strong/30 text-foreground-strong'
                      : 'text-foreground hover:bg-surface-3'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{lng.nativeLabel}</span>
                    <span className="text-xs text-foreground-faint">{lng.shortLabel}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="bg-surface-3 p-4 rounded-2xl mb-8 shadow-2xl rotate-3 transform hover:rotate-0 transition-transform duration-500">
        <Terminal size={64} className="text-success-muted-foreground" />
      </div>
      <h1 className="text-5xl md:text-6xl font-bold text-foreground-strong tracking-tighter mb-6">
        {t('hero.titlePrefix', 'Master')}{' '}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[rgb(var(--color-hero-from))] to-[rgb(var(--color-hero-to))]">
          Vim
        </span>{' '}
        {t('hero.titleSuffix', 'Motion.')}
      </h1>
      <p className="text-xl text-foreground-subtle mb-10 leading-relaxed">
        {t(
          'hero.subtitle',
          'Stop memorizing cheatsheets. Build muscle memory directly in the browser with our interactive challenges.'
        )}
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onStart}
          className="bg-cta text-cta-foreground px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-xl shadow-cta/10"
        >
          <Play size={20} fill="currentColor" />
          {t('hero.cta', 'Start Learning')}
        </button>
        <button
          onClick={onSurvivalPack}
          className="bg-surface border border-border text-foreground px-8 py-4 rounded-full font-bold text-lg hover:border-primary transition-colors flex items-center justify-center gap-2"
        >
          <Keyboard size={20} />
          {t('hero.survivalCta', '30-Minute Survival Pack')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 w-full text-left">
        {features.map((feat, i) => (
          <div key={i} className="bg-surface/50 p-6 rounded-xl border border-border">
            <feat.icon className="text-foreground-faint mb-3" />
            <h3 className="font-bold text-foreground mb-1">{feat.title}</h3>
            <p className="text-sm text-foreground-faint">{feat.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 text-xs text-foreground-dim font-mono">
        v{VERSION} {VERSION_LABEL}
      </div>
    </div>
  );
};
