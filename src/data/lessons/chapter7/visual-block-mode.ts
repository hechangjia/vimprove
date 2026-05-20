import type { Lesson } from '@/core/types';

export const visualBlockMode: Lesson = {
  slug: 'visual-block-mode',
  title: 'Visual block mode: rectangular edits',
  categoryId: 'chapter7',
  shortDescription: 'Use Ctrl-v to select columns across multiple lines.',
  contentBlocks: [
    {
      type: 'markdown',
      content: `## Ctrl-v selects a rectangle

Visual Block mode is for column-shaped work. It selects the same character columns across several lines.

Use it when the text is aligned:

- Remove a column in a small table.
- Copy a rectangular slice.
- Change the same aligned field on adjacent lines.

In this project, Visual Block supports rectangular **yank**, **delete**, and **change**. Full blockwise paste is a later engine milestone.`
    },
    {
      type: 'key-list',
      keys: [
        { chars: ['Ctrl-v'], desc: 'Start Visual Block mode' },
        { chars: ['h', 'j', 'k', 'l'], desc: 'Grow or shrink the rectangular selection' },
        { chars: ['y'], desc: 'Yank the selected rectangle' },
        { chars: ['d'], desc: 'Delete the selected rectangle from each line' },
        { chars: ['c'], desc: 'Change the selected rectangle and enter Insert mode' }
      ]
    },
    {
      type: 'challenge',
      config: {
        initialBuffer: [
          'name    age    role',
          'alice   31     dev',
          'bruno   28     ops'
        ],
        initialCursor: { line: 1, col: 8 },
        goalsRequired: 2,
        enabledCommands: [
          'h', 'j', 'k', 'l',
          'Ctrl-v', 'y', 'd', 'c',
          'Escape'
        ],
        goals: [
          {
            id: 'enter-visual-block',
            type: 'custom',
            description: 'Enter Visual Block mode with Ctrl-v.',
            validator: (_prev, next) => next.mode === 'visual-block'
          },
          {
            id: 'remove-age-values',
            type: 'delete',
            description: 'Use a block selection to delete the age values 31 and 28.',
            validator: (_prev, next) => {
              const text = next.buffer.join('\n');
              return !text.includes('31') && !text.includes('28') && text.includes('alice') && text.includes('ops');
            }
          }
        ]
      }
    }
  ]
};
