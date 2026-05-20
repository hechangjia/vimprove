import { useEffect } from 'react';
import { useSettingsContext } from '@/contexts/useSettingsContext';
import { useFontLoader, getFontFamily } from '@/hooks/useFontLoader';

const setThemeColorMeta = () => {
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (!meta) return;

  const raw = getComputedStyle(document.documentElement).getPropertyValue('--color-background').trim();
  const parts = raw.split(/\s+/).map(Number);
  if (parts.length !== 3 || parts.some(n => Number.isNaN(n))) return;

  const [r, g, b] = parts;
  meta.setAttribute('content', `rgb(${r}, ${g}, ${b})`);
};

export const EditorStyleApplier = () => {
  const { settings } = useSettingsContext();
  useFontLoader(settings.editor.fontFamily);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--editor-font-family', getFontFamily(settings.editor.fontFamily));
    root.style.setProperty('--editor-font-size', `${settings.editor.fontSize}px`);
  }, [settings.editor.fontFamily, settings.editor.fontSize]);

  useEffect(() => {
    const root = document.documentElement;

    if (settings.theme === 'system') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', settings.theme);
    }

    setThemeColorMeta();

    if (settings.theme !== 'system') return;

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setThemeColorMeta();
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [settings.theme]);

  return null;
};
