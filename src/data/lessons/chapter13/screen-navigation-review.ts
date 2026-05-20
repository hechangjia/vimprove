import type { Lesson } from '@/core/types';

const buffer = Array.from({ length: 30 }, (_, index) => `navigation review line ${index + 1}`);

export const screenNavigationReview: Lesson = {
  slug: 'screen-navigation-review',
  title: 'Screen navigation review',
  categoryId: 'chapter13',
  shortDescription: 'Combine page movement, viewport placement, and visible-line jumps.',
  contentBlocks: [
    {
      type: 'markdown',
      content: `## A reading loop for long files

Use this rhythm in long files:

1. **Ctrl-d/u** to scan by half pages.
2. **Ctrl-f/b** when you need larger jumps.
3. **zz/zt/zb** to reframe the current line.
4. **H/M/L** when the target is already visible.

This is the missing layer between tiny motions and project navigation.`
    },
    {
      type: 'scroll-surfer',
      config: { targetScore: 7 }
    },
    {
      type: 'challenge',
      config: {
        initialBuffer: buffer,
        initialCursor: { line: 4, col: 0 },
        goalsRequired: 3,
        enabledCommands: ['Ctrl-d', 'Ctrl-u', 'Ctrl-f', 'Ctrl-b', 'z', 't', 'b', 'H', 'M', 'L', 'Escape'],
        goals: [
          {
            id: 'move-by-screen',
            type: 'move',
            description: 'Use Ctrl-d or Ctrl-f to move beyond line 10.',
            validator: (_prev, next) => next.cursor.line >= 10
          },
          {
            id: 'reframe-line',
            type: 'custom',
            description: 'Use zz, zt, or zb to change the viewport framing.',
            validator: (prev, next) => prev != null && next.viewportTop !== prev.viewportTop
          },
          {
            id: 'visible-line-jump',
            type: 'move',
            description: 'Use H, M, or L after scrolling.',
            validator: (prev, next) => prev != null && next.lastCommand?.type === 'move' && next.cursor.line !== prev.cursor.line
          }
        ]
      }
    },
    {
      type: 'cheat-sheet',
      config: { chapterId: 'chapter13' }
    }
  ]
};
