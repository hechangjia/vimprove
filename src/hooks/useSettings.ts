import { useState, useEffect } from 'react';

export type EditorSettings = {
  fontSize: number;
  fontFamily: string;
};

export type ThemeMode = 'system' | 'dark' | 'light';

export type Settings = {
  editor: EditorSettings;
  theme: ThemeMode;
};

const DEFAULT_SETTINGS: Settings = {
  editor: {
    fontSize: 16,
    fontFamily: 'Consolas'
  },
  theme: 'system'
};

const STORAGE_KEY = 'vimprove-settings';

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Partial<Settings> | null;
        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
          editor: {
            ...DEFAULT_SETTINGS.editor,
            ...(parsed?.editor ?? {})
          }
        };
      } catch {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateEditorSettings = (updates: Partial<EditorSettings>) => {
    setSettings(prev => ({
      ...prev,
      editor: { ...prev.editor, ...updates }
    }));
  };

  const updateTheme = (theme: ThemeMode) => {
    setSettings(prev => ({ ...prev, theme }));
  };

  const resetToDefaults = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return {
    settings,
    updateEditorSettings,
    updateTheme,
    resetToDefaults
  };
};
