import { createContext } from 'react';
import type { EditorSettings, Settings, ThemeMode } from '@/hooks/useSettings';

export type SettingsContextType = {
  settings: Settings;
  updateEditorSettings: (updates: Partial<EditorSettings>) => void;
  updateTheme: (theme: ThemeMode) => void;
  resetToDefaults: () => void;
};

export const SettingsContext = createContext<SettingsContextType | null>(null);
