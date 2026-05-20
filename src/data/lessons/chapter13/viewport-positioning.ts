import type { Lesson } from '@/core/types';

const buffer = Array.from({ length: 24 }, (_, index) => `section ${index + 1}`);

export const viewportPositioning: Lesson = {
  slug: 'viewport-positioning',
  title: 'Viewport positioning: zz, zt, zb',
  categoryId: 'chapter13',
  shortDescription: 'Keep the current line where your eyes need it.',
  contentBlocks: [
    {
      type: 'markdown',
      content: `## Put the current line where it helps

Scrolling is not only about moving the cursor. Often you want to keep the cursor line visible in a better place:

- **zz** centers the current line.
- **zt** puts it near the top.
- **zb** puts it near the bottom.

These are view commands: they change how the file is framed without changing the text.`
    },
    {
      type: 'key-list',
      keys: [
        { chars: ['z', 'z'], desc: 'Center the current line' },
        { chars: ['z', 't'], desc: 'Put the current line at the top' },
        { chars: ['z', 'b'], desc: 'Put the current line at the bottom' }
      ]
    },
    {
      type: 'challenge',
      config: {
        initialBuffer: buffer,
        initialCursor: { line: 12, col: 0 },
        goalsRequired: 2,
        enabledCommands: ['z', 't', 'b', 'Escape'],
        goals: [
          {
            id: 'center-line',
            type: 'custom',
            description: 'Use zz to center the current line.',
            validator: (_prev, next) => next.viewportTop === 7
          },
          {
            id: 'top-line',
            type: 'custom',
            description: 'Use zt to place the current line at the top.',
            validator: (_prev, next) => next.viewportTop === 12
          }
        ]
      }
    }
  ]
};
