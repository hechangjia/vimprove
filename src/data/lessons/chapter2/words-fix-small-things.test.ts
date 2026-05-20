import { describe, expect, it } from 'vitest';
import { INITIAL_VIM_STATE, vimReducer } from '@/core/vimReducer';
import { wordsFixSmallThings } from './words-fix-small-things';

describe('wordsFixSmallThings lesson', () => {
  it('run example fixes encount into encounter', () => {
    const block = wordsFixSmallThings.contentBlocks.find(contentBlock => contentBlock.type === 'run-example');

    if (!block || block.type !== 'run-example') {
      throw new Error('words-fix-small-things is missing its run example');
    }

    let state = vimReducer(INITIAL_VIM_STATE, {
      type: 'RESET',
      payload: {
        buffer: [...block.config.initialBuffer],
        cursor: block.config.initialCursor
      }
    });

    for (const step of block.config.steps) {
      state = vimReducer(state, {
        type: 'KEYDOWN',
        payload: { key: step.key, ctrlKey: step.ctrlKey ?? false }
      });
    }

    expect(state.buffer).toContain('    int encounter = 0;');
    expect(state.buffer.join('\n')).not.toContain('0er');
  });
});
