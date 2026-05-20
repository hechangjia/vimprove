import type { Lesson } from '@/core/types';

export const visualCharBasics: Lesson = {
  slug: 'visual-char-basics',
  title: 'Visual mode: select first, act second',
  categoryId: 'chapter7',
  shortDescription: 'Use v to select characters, then yank, delete, or change the selected text.',
  contentBlocks: [
    {
      type: 'markdown',
      content: `## Visual mode is a visible selection

Most Vim editing uses **operator + motion**: \`dw\`, \`ciw\`, \`d$\`.

Visual mode flips that order:

1. Press **v** to start selecting.
2. Move with the motions you already know.
3. Press an operator such as **y**, **d**, or **c**.

This is useful when you want to see the exact text before acting. It is slower than a clean text object, but very clear while learning or when a range is awkward.`
    },
    {
      type: 'markdown',
      content: `## Example: yank a visible word

Start on the first letter of \`beta\`, press **v**, move to the end of the word, then press **y**.
Vim leaves Visual mode and stores the selected text in the register.`
    },
    {
      type: 'run-example',
      config: {
        initialBuffer: ['const alpha = beta + gamma;'],
        initialCursor: { line: 0, col: 14 },
        autoPlaySpeed: 850,
        tracks: [
          { label: 'Select beta and yank it', keys: ['v', 'e', 'y'] }
        ],
        steps: [
          { key: 'v', description: 'v: start Visual mode at the current character.', cursorIndex: 0 },
          { key: 'e', description: 'e: extend the selection to the end of the word.', cursorIndex: 0 },
          { key: 'y', description: 'y: yank the selected text and return to Normal mode.', cursorIndex: 0 }
        ],
        language: 'javascript'
      }
    },
    {
      type: 'key-list',
      keys: [
        { chars: ['v'], desc: 'Start characterwise Visual mode' },
        { chars: ['Escape'], desc: 'Cancel Visual mode and return to Normal' },
        { chars: ['y'], desc: 'Yank the selected text' },
        { chars: ['d'], desc: 'Delete the selected text' },
        { chars: ['c'], desc: 'Change the selected text and enter Insert mode' }
      ]
    },
    {
      type: 'challenge',
      config: {
        initialBuffer: ['const alpha = beta + gamma;'],
        initialCursor: { line: 0, col: 14 },
        goalsRequired: 2,
        enabledCommands: [
          'h', 'j', 'k', 'l',
          'w', 'b', 'e', '0', '^', '$',
          'v', 'y', 'd', 'c',
          'i', 'a', 'Escape'
        ],
        goals: [
          {
            id: 'enter-visual-mode',
            type: 'custom',
            description: 'Enter characterwise Visual mode with v.',
            validator: (_prev, next) => next.mode === 'visual'
          },
          {
            id: 'yank-beta',
            type: 'custom',
            description: 'Select and yank the word "beta".',
            validator: (_prev, next) => next.mode === 'normal' && next.register === 'beta'
          }
        ]
      }
    }
  ]
};
