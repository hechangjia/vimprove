import type { Lesson } from '@/core/types';

export const marksBasics: Lesson = {
  slug: 'marks-basics',
  title: 'Marks: save a place and come back',
  categoryId: 'chapter9',
  shortDescription: 'Use m{letter}, `letter, and \'letter to jump back to saved positions.',
  contentBlocks: [
    {
      type: 'markdown',
      content: `## Marks are named positions

Use marks when you need to leave a spot and come back later.

- **ma** saves the current cursor as mark \`a\`.
- **\`a** jumps back to the exact cursor.
- **'a** jumps to the first non-blank on that marked line.

Marks are lightweight anchors for longer edits.`
    },
    {
      type: 'key-list',
      keys: [
        { chars: ['m', 'a'], desc: 'Set mark a at the cursor' },
        { chars: ['`', 'a'], desc: 'Jump to exact mark a position' },
        { chars: ["'", 'a'], desc: 'Jump to the first non-blank on mark a line' },
        { chars: ['`', '`'], desc: 'Jump back to the previous jump location' }
      ]
    },
    {
      type: 'challenge',
      config: {
        initialBuffer: ['alpha', '  beta', 'gamma'],
        initialCursor: { line: 1, col: 4 },
        goalsRequired: 2,
        enabledCommands: ['m', 'a', '`', "'", 'G', 'g', 'h', 'j', 'k', 'l', 'Escape'],
        goals: [
          {
            id: 'set-mark-a',
            type: 'custom',
            description: 'Set mark a.',
            validator: (_prev, next) => Boolean(next.marks.a)
          },
          {
            id: 'jump-mark-a',
            type: 'move',
            description: 'Jump back to mark a.',
            validator: (_prev, next) => next.cursor.line === 1
          }
        ]
      }
    }
  ]
};
