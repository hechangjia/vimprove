import { describe, expect, it } from 'vitest';
import { usesBlockCursor } from './modeUtils';
import type { Mode } from './types';

describe('mode cursor rendering rules', () => {
  it('uses a block cursor for normal and visual modes', () => {
    const blockModes: Mode[] = ['normal', 'visual', 'visual-line', 'visual-block'];

    for (const mode of blockModes) {
      expect(usesBlockCursor(mode)).toBe(true);
    }
  });

  it('uses an insert bar cursor outside normal and visual editing modes', () => {
    expect(usesBlockCursor('insert')).toBe(false);
    expect(usesBlockCursor('command')).toBe(false);
  });
});
