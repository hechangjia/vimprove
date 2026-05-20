import { useEffect, useRef, useState } from 'react';

type FontConfig = {
  name: string;
  googleFont?: string; // Google Fonts family name
  fallback?: string;   // System fallback
};

export const FONT_CONFIGS: FontConfig[] = [
  { name: 'JetBrains Mono', googleFont: 'JetBrains+Mono:wght@400;500;700' },
  { name: 'Cascadia Code', googleFont: 'Cascadia+Code:wght@400;500;700' },
  { name: 'Fira Code', googleFont: 'Fira+Code:wght@400;500;700' },
  { name: 'Consolas', fallback: 'Consolas, monospace' },
  { name: 'Menlo', fallback: 'Menlo, monospace' },
  { name: 'Source Code Pro', googleFont: 'Source+Code+Pro:wght@400;500;700' },
  { name: 'Roboto Mono', googleFont: 'Roboto+Mono:wght@400;500;700' },
  { name: 'IBM Plex Mono', googleFont: 'IBM+Plex+Mono:wght@400;500;700' },
  { name: 'Inconsolata', googleFont: 'Inconsolata:wght@400;500;700' },
  { name: 'Monaco', fallback: 'Monaco, monospace' }
];

const loadedFonts = new Set<string>();
const pendingLinks = new Map<string, HTMLLinkElement>();

export function useFontLoader(fontName: string) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const config = FONT_CONFIGS.find(f => f.name === fontName);
    if (!config) {
      // Font loading state follows the selected font name; invalid names should surface immediately.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError(true);
      return;
    }

    // System fonts don't need loading
    if (config.fallback && !config.googleFont) {
      setIsLoaded(true);
      return;
    }

    // Already loaded
    if (loadedFonts.has(fontName)) {
      setIsLoaded(true);
      return;
    }

    if (config.googleFont) {
      // 复用已 pending 的 link，避免 StrictMode 双 mount 时插入两份相同 <link>。
      let link = pendingLinks.get(fontName);
      if (!link) {
        link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${config.googleFont}&display=swap`;
        pendingLinks.set(fontName, link);
        document.head.appendChild(link);
      }

      const handleLoad = () => {
        loadedFonts.add(fontName);
        pendingLinks.delete(fontName);
        if (isMountedRef.current) setIsLoaded(true);
      };
      const handleError = () => {
        pendingLinks.delete(fontName);
        if (isMountedRef.current) setError(true);
      };

      link.addEventListener('load', handleLoad);
      link.addEventListener('error', handleError);

      return () => {
        link.removeEventListener('load', handleLoad);
        link.removeEventListener('error', handleError);
      };
    }
  }, [fontName]);

  return { isLoaded, error };
}

export function getFontFamily(fontName: string): string {
  const config = FONT_CONFIGS.find(f => f.name === fontName);
  if (!config) return 'monospace';

  if (config.fallback) {
    return config.fallback;
  }

  return `"${fontName}", monospace`;
}
