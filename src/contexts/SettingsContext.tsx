import type { ReactNode } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { SettingsContext } from './settingsContextValue';

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const settingsHook = useSettings();

  return (
    <SettingsContext.Provider value={settingsHook}>
      {children}
    </SettingsContext.Provider>
  );
};
