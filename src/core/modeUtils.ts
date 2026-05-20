import type { Mode } from './types';

export const usesBlockCursor = (mode: Mode): boolean =>
  mode === 'normal' || mode === 'visual' || mode === 'visual-line' || mode === 'visual-block';
