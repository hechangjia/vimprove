import { describe, expect, it } from 'vitest';
import { LESSONS } from './index';
import type { RunExampleConfig, VimState } from '@/core/types';
import { INITIAL_VIM_STATE, vimReducer } from '@/core/vimReducer';

const findRunExample = (slug: string): RunExampleConfig => {
  const lesson = LESSONS.find(item => item.slug === slug);
  if (!lesson) throw new Error(`Missing lesson: ${slug}`);

  const block = lesson.contentBlocks.find(contentBlock => contentBlock.type === 'run-example');
  if (!block || block.type !== 'run-example') throw new Error(`Missing run example: ${slug}`);

  return block.config;
};

const playRunExample = (config: RunExampleConfig): VimState => {
  const states = config.tracks.map(() => vimReducer(INITIAL_VIM_STATE, {
    type: 'RESET',
    payload: {
      buffer: [...config.initialBuffer],
      cursor: config.initialCursor
    }
  }));

  for (const step of config.steps) {
    const cursorIndex = step.cursorIndex ?? 0;
    states[cursorIndex] = vimReducer(states[cursorIndex], {
      type: 'KEYDOWN',
      payload: {
        key: step.key,
        ctrlKey: step.ctrlKey ?? false
      }
    });
  }

  return states[0];
};

describe('run examples', () => {
  const expectedFinalBuffers: Array<{ slug: string; buffer: string[] }> = [
    {
      slug: 'words-fix-small-things',
      buffer: ['int main() {', '    int encounter = 0;', '}']
    },
    {
      slug: 'insert-mode-shortcuts',
      buffer: ['const value = 42;', '  console.log(value);']
    },
    {
      slug: 'count-repeat-undo',
      buffer: [
        'int main() {',
        '    int value1 = 42;',
        '    int value2 = 42;',
        '    int value3 = 42;',
        '    int value4 = 0;',
        '}'
      ]
    },
    {
      slug: 'operators-mini-review',
      buffer: [
        '#include <iostream>',
        '',
        'int main() {',
        '    int items = 3;           // will rename',
        '    int total = 0;',
        '    total = items * 2;       // duplicate and edit',
        '    total = items * 3;       // duplicate and edit',
        '    std::cout << total << "\\n";',
        '}'
      ]
    },
    {
      slug: 'change-with-find',
      buffer: ['#include <string>', '', 'int main() {', '    std::string name = "Bob";', '}']
    },
    {
      slug: 'in-line-precision-review',
      buffer: ['#include <iostream>', '', 'int main() {', '    auto sum = add(42);', '}']
    },
    {
      slug: 'speedrun-challenge',
      buffer: ['int main() {', '    int x = 0;', '    x += 1;', '    x += 1;', '}']
    },
    {
      slug: 'vim-in-vscode',
      buffer: ['{', '  "vim.useSystemClipboard": true,', '  "vim.smartRelativeLine": true', '}']
    }
  ];

  it.each(expectedFinalBuffers)('$slug reaches the documented final buffer', ({ slug, buffer }) => {
    expect(playRunExample(findRunExample(slug)).buffer).toEqual(buffer);
  });

  it('all examples finish in normal mode without pending operators', () => {
    for (const lesson of LESSONS) {
      for (const block of lesson.contentBlocks) {
        if (block.type !== 'run-example') continue;

        const finalState = playRunExample(block.config);

        expect(finalState.mode, lesson.slug).toBe('normal');
        expect(finalState.pendingOperator, lesson.slug).toBeNull();
        expect(finalState.pendingFind, lesson.slug).toBeNull();
        expect(finalState.pendingTextObject, lesson.slug).toBeNull();
      }
    }
  });
});
