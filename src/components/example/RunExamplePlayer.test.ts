import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('RunExamplePlayer', () => {
  it('passes step ctrlKey through replay and key history paths', () => {
    const source = readFileSync(new URL('./RunExamplePlayer.tsx', import.meta.url), 'utf-8');

    expect(source).toContain('ctrlKey: step.ctrlKey ?? false');
    expect(source).toContain('recordKey(step.key, step.ctrlKey ?? false');
    expect(source).not.toContain('ctrlKey: false');
    expect(source).not.toContain('recordKey(step.key, false');
  });
});
