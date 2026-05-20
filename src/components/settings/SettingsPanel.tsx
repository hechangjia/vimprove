import { useState } from 'react';
import { BarChart3, Palette, Terminal, Code } from 'lucide-react';
import { useSettingsContext } from '@/contexts/useSettingsContext';
import { AppearanceTab } from './AppearanceTab';
import { VimStatusTab } from './VimStatusTab';
import { VimPlaygroundTab } from './VimPlaygroundTab';
import { KeyStatsTab } from './KeyStatsTab';
import { useTranslationSafe } from '@/hooks/useI18n';

type Tab = 'appearance' | 'vim-status' | 'playground' | 'key-stats';

type SettingsPanelProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const SettingsPanel = ({ isOpen, onClose }: SettingsPanelProps) => {
  const [activeTab, setActiveTab] = useState<Tab>('appearance');
  const { settings, updateEditorSettings, updateTheme, resetToDefaults } = useSettingsContext();
  const { t } = useTranslationSafe('settings');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-backdrop/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative bg-surface rounded-2xl border border-border-strong shadow-2xl w-full max-w-[95vw] md:max-w-4xl max-h-[85vh] overflow-hidden flex flex-col mx-4">
        {/* Tab Bar */}
        <div className="border-b border-border px-4 md:px-6 flex gap-2">
          <button
            onClick={() => setActiveTab('appearance')}
            className={`flex items-center gap-2 px-4 py-3 text-sm transition-colors border-b-2 ${
              activeTab === 'appearance'
                ? 'border-primary text-foreground-strong'
                : 'border-transparent text-foreground-subtle hover:text-foreground-strong'
            }`}
          >
            <Palette size={18} />
            {t('appearance.tab', 'Appearance')}
          </button>
          <button
            onClick={() => setActiveTab('vim-status')}
            className={`flex items-center gap-2 px-4 py-3 text-sm transition-colors border-b-2 ${
              activeTab === 'vim-status'
                ? 'border-primary text-foreground-strong'
                : 'border-transparent text-foreground-subtle hover:text-foreground-strong'
            }`}
          >
            <Terminal size={18} />
            {t('vimStatus.tab', 'Vim Status')}
          </button>
          <button
            onClick={() => setActiveTab('playground')}
            className={`flex items-center gap-2 px-4 py-3 text-sm transition-colors border-b-2 ${
              activeTab === 'playground'
                ? 'border-primary text-foreground-strong'
                : 'border-transparent text-foreground-subtle hover:text-foreground-strong'
            }`}
          >
            <Code size={18} />
            {t('playground.tab', 'Playground')}
          </button>
          <button
            onClick={() => setActiveTab('key-stats')}
            className={`flex items-center gap-2 px-4 py-3 text-sm transition-colors border-b-2 ${
              activeTab === 'key-stats'
                ? 'border-primary text-foreground-strong'
                : 'border-transparent text-foreground-subtle hover:text-foreground-strong'
            }`}
          >
            <BarChart3 size={18} />
            {t('keyStats.tab', 'Key Stats')}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
          {activeTab === 'appearance' && (
            <AppearanceTab
              settings={settings.editor}
              theme={settings.theme}
              onUpdate={updateEditorSettings}
              onUpdateTheme={updateTheme}
            />
          )}
          {activeTab === 'vim-status' && <VimStatusTab />}
          {activeTab === 'playground' && <VimPlaygroundTab />}
          {activeTab === 'key-stats' && <KeyStatsTab />}
        </div>

        {/* Footer */}
        <div className="border-t border-border p-4 flex justify-between items-center">
          <button
            onClick={resetToDefaults}
            className="px-4 py-2 text-sm text-foreground-subtle hover:text-foreground-strong transition-colors"
          >
            {t('reset', 'Reset to Defaults')}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-primary hover:bg-primary-hover text-primary-foreground rounded-lg font-semibold transition-colors"
          >
            {t('done', 'Done')}
          </button>
        </div>
      </div>
    </div>
  );
};
