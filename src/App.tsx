import { useState, useEffect } from 'react';
import { Settings, SkipBack, SkipForward, Github } from 'lucide-react';
import { LESSONS } from '@/data';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { HomePage } from '@/pages/HomePage';
import { LessonPage } from '@/pages/LessonPage';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { SettingsPanel } from '@/components/settings/SettingsPanel';
import { EditorStyleApplier } from '@/components/settings/EditorStyleApplier';
import { useTranslationSafe } from '@/hooks/useI18n';

type View = 'home' | 'lesson';

const CURRENT_LESSON_KEY = 'vimprove_current_lesson';
const LEGACY_LEARNING_STARTED_KEY = 'vimprove_learning_started'; // For migration

// 在模块加载阶段执行一次性的 localStorage 迁移，避免在 render body 中产生副作用
// （render body 在 StrictMode 下会双跑，且违反 React 纯渲染规范）。
const readInitialLessonState = (): { view: View; slug: string } => {
  if (typeof window === 'undefined') {
    return { view: 'home', slug: LESSONS[0].slug };
  }
  try {
    const legacyStarted = window.localStorage.getItem(LEGACY_LEARNING_STARTED_KEY);
    const currentSaved = window.localStorage.getItem(CURRENT_LESSON_KEY);
    if (legacyStarted === 'true' && !currentSaved) {
      window.localStorage.setItem(CURRENT_LESSON_KEY, LESSONS[0].slug);
      window.localStorage.removeItem(LEGACY_LEARNING_STARTED_KEY);
      return { view: 'lesson', slug: LESSONS[0].slug };
    }
    if (currentSaved && LESSONS.some(l => l.slug === currentSaved)) {
      return { view: 'lesson', slug: currentSaved };
    }
  } catch {
    // localStorage 不可用（隐私模式）时静默回退到首页。
  }
  return { view: 'home', slug: LESSONS[0].slug };
};

const App = () => {
  const [{ view: initialView, slug: initialSlug }] = useState(readInitialLessonState);

  const [currentView, setCurrentView] = useState<View>(initialView);
  const [currentLessonSlug, setCurrentLessonSlug] = useState(initialSlug);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { t } = useTranslationSafe('layout');

  // Sidebar state: default closed on mobile, open on desktop
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      // 桌面端默认展开，移动端默认收起；resize 时双向同步。
      setSidebarOpen(window.innerWidth >= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const currentLessonIdx = LESSONS.findIndex(l => l.slug === currentLessonSlug);
  const currentLesson = LESSONS[currentLessonIdx];

  // Scroll to top when lesson changes
  useEffect(() => {
    if (currentView === 'lesson') {
      requestAnimationFrame(() => {
        const scrollContainer = document.querySelector('[data-scroll-container]');
        if (scrollContainer) {
          scrollContainer.scrollTop = 0;
        }
      });
    }
  }, [currentLessonSlug, currentView]);

  const handleNext = () => {
    if (currentLessonIdx < LESSONS.length - 1) {
      const nextSlug = LESSONS[currentLessonIdx + 1].slug;
      setCurrentLessonSlug(nextSlug);
      localStorage.setItem(CURRENT_LESSON_KEY, nextSlug);
    }
  };

  const handlePrev = () => {
    if (currentLessonIdx > 0) {
      const prevSlug = LESSONS[currentLessonIdx - 1].slug;
      setCurrentLessonSlug(prevSlug);
      localStorage.setItem(CURRENT_LESSON_KEY, prevSlug);
    }
  };

  const handleLessonSelect = (slug: string) => {
    setCurrentLessonSlug(slug);
    setCurrentView('lesson');
    localStorage.setItem(CURRENT_LESSON_KEY, slug);
    // Close sidebar on mobile after selection
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const handleStartLearning = () => {
    const firstLessonSlug = LESSONS[0].slug;
    localStorage.setItem(CURRENT_LESSON_KEY, firstLessonSlug);
    setCurrentView('lesson');
    setCurrentLessonSlug(firstLessonSlug);
  };

  const handleSurvivalPack = () => {
    const survivalSlug = 'modes-basics';
    localStorage.setItem(CURRENT_LESSON_KEY, survivalSlug);
    setCurrentView('lesson');
    setCurrentLessonSlug(survivalSlug);
  };

  const handleHomeClick = () => {
    localStorage.removeItem(CURRENT_LESSON_KEY);
    setCurrentView('home');
  };

  return (
    <SettingsProvider>
      <EditorStyleApplier />
      <div className="h-screen bg-background text-foreground font-sans flex overflow-hidden">
        {/* Mobile Header */}
        <MobileHeader
          isVisible={currentView === 'lesson'}
          sidebarOpen={sidebarOpen}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          onSettingsClick={() => setSettingsOpen(true)}
          showPrevButton={currentLessonIdx > 0}
          showNextButton={currentLessonIdx < LESSONS.length - 1}
          onPrevClick={currentLessonIdx > 0 ? handlePrev : undefined}
          onNextClick={currentLessonIdx < LESSONS.length - 1 ? handleNext : undefined}
        />

        {/* Mobile Overlay */}
        {sidebarOpen && currentView === 'lesson' && (
          <div
            className="fixed inset-0 bg-backdrop/50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <Sidebar
          lessons={LESSONS}
          currentLessonSlug={currentLessonSlug}
          onLessonSelect={handleLessonSelect}
          onHomeClick={handleHomeClick}
          isOpen={sidebarOpen}
          isVisible={currentView === 'lesson'}
        />

        <div className="flex-1 h-screen overflow-y-auto bg-background relative" data-scroll-container>
          {currentView === 'home' ? (
            <HomePage onStart={handleStartLearning} onSurvivalPack={handleSurvivalPack} />
          ) : (
            <LessonPage
              lesson={currentLesson}
              onNext={currentLessonIdx < LESSONS.length - 1 ? handleNext : undefined}
              onPrev={currentLessonIdx > 0 ? handlePrev : undefined}
            />
          )}
        </div>

        {/* Floating Action Buttons (Desktop Only) */}
        <div className="hidden md:flex fixed bottom-6 right-6 flex-col gap-3 z-40">
          {currentView === 'lesson' && currentLessonIdx > 0 && (
            <button
              onClick={handlePrev}
              className="w-14 h-14 flex items-center justify-center bg-surface-4 hover:bg-border-stronger border border-border-stronger rounded-full shadow-2xl transition-all hover:scale-110 text-foreground hover:text-foreground-strong"
              title={t('prevLesson', 'Previous Lesson')}
            >
              <SkipBack size={24} />
            </button>
          )}
          {currentView === 'lesson' && currentLessonIdx < LESSONS.length - 1 && (
            <button
              onClick={handleNext}
              className="w-14 h-14 flex items-center justify-center bg-surface-4 hover:bg-border-stronger border border-border-stronger rounded-full shadow-2xl transition-all hover:scale-110 text-foreground hover:text-foreground-strong"
              title={t('nextLesson', 'Next Lesson')}
            >
              <SkipForward size={24} />
            </button>
          )}
          <button
            onClick={() => setSettingsOpen(true)}
            className="w-14 h-14 p-4 bg-surface-4 hover:bg-border-stronger border border-border-stronger rounded-full shadow-2xl transition-all hover:scale-110 text-foreground hover:text-foreground-strong"
            title={t('settings', 'Settings')}
          >
            <Settings size={24} />
          </button>
          <a
            href="https://github.com/Jerry-Terrasse/vimprove"
            target="_blank"
            rel="noopener noreferrer"
            className="w-14 h-14 p-4 bg-surface-4 hover:bg-border-stronger border border-border-stronger rounded-full shadow-2xl transition-all hover:scale-110 text-foreground hover:text-foreground-strong"
            title={t('starOnGithub', 'Give me a Star!')}
          >
            <Github size={24} />
          </a>
        </div>

        {/* Settings Panel */}
        <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      </div>
    </SettingsProvider>
  );
};

export default App;
