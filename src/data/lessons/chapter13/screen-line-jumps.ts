import type { Lesson } from '@/core/types';

const buffer = Array.from({ length: 24 }, (_, index) => `visible line practice ${index + 1}`);

export const screenLineJumps: Lesson = {
  slug: 'screen-line-jumps',
  title: 'Visible screen jumps: H, M, L',
  categoryId: 'chapter13',
  shortDescription: 'Jump to the top, middle, or bottom visible line.',
  contentBlocks: [
    {
      type: 'markdown',
      content: `## Jump inside the visible screen

When the target is already visible, use screen-relative jumps:

- **H** jumps to the high/top visible line.
- **M** jumps to the middle visible line.
- **L** jumps to the low/bottom visible line.

These pair well with page scrolling: scroll near the area, then use **H/M/L** to land quickly.`
    },
    {
      type: 'key-list',
      keys: [
        { chars: ['H'], desc: 'Jump to the top visible line' },
        { chars: ['M'], desc: 'Jump to the middle visible line' },
        { chars: ['L'], desc: 'Jump to the bottom visible line' }
      ]
    },
    {
      type: 'challenge',
      config: {
        initialBuffer: buffer,
        initialCursor: { line: 12, col: 0 },
        goalsRequired: 2,
        enabledCommands: ['H', 'M', 'L'],
        goals: [
          {
            id: 'jump-top',
            type: 'move',
            description: 'Use H to jump to the top visible line.',
            validator: (_prev, next) => next.cursor.line === next.viewportTop
          },
          {
            id: 'jump-bottom',
            type: 'move',
            description: 'Use L to jump to the bottom visible line.',
            validator: (_prev, next) => next.cursor.line === next.viewportTop + next.viewportHeight - 1
          }
        ]
      }
    }
  ]
};
