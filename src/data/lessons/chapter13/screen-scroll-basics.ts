import type { Lesson } from '@/core/types';

const buffer = Array.from({ length: 30 }, (_, index) => `project line ${index + 1}`);

export const screenScrollBasics: Lesson = {
  slug: 'screen-scroll-basics',
  title: 'Screen scrolling: half and full pages',
  categoryId: 'chapter13',
  shortDescription: 'Move through long files with Ctrl-d/u and Ctrl-f/b instead of repeated j/k.',
  contentBlocks: [
    {
      type: 'markdown',
      content: `## Move by screens, not single lines

When a file is longer than your viewport, repeated **j** and **k** are too small.

- **Ctrl-d** moves down about half a page.
- **Ctrl-u** moves up about half a page.
- **Ctrl-f** moves forward a full page.
- **Ctrl-b** moves backward a full page.

Use these when you are reading or scanning, then switch back to precise motions near the target.`
    },
    {
      type: 'key-list',
      keys: [
        { chars: ['Ctrl-d'], desc: 'Scroll down half a page' },
        { chars: ['Ctrl-u'], desc: 'Scroll up half a page' },
        { chars: ['Ctrl-f'], desc: 'Scroll forward one page' },
        { chars: ['Ctrl-b'], desc: 'Scroll backward one page' }
      ]
    },
    {
      type: 'challenge',
      config: {
        initialBuffer: buffer,
        initialCursor: { line: 4, col: 0 },
        goalsRequired: 2,
        enabledCommands: ['Ctrl-d', 'Ctrl-u', 'Ctrl-f', 'Ctrl-b'],
        goals: [
          {
            id: 'half-page-down',
            type: 'move',
            description: 'Use Ctrl-d to move down by a half page.',
            validator: (_prev, next) => next.cursor.line >= 9
          },
          {
            id: 'page-forward',
            type: 'move',
            description: 'Use Ctrl-f to move forward by a full page.',
            validator: (_prev, next) => next.viewportTop >= 10
          }
        ]
      }
    }
  ]
};
