import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS } from './useSettings';

describe('default settings', () => {
  it('uses JetBrains Mono as the default editor font for clearer glyphs', () => {
    expect(DEFAULT_SETTINGS.editor.fontFamily).toBe('JetBrains Mono');
  });
});
