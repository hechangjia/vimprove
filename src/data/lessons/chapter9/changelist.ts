import type { Lesson } from '@/core/types';

export const changelist: Lesson = {
  slug: 'changelist',
  title: 'Changelist: revisit recent edits',
  categoryId: 'chapter9',
  shortDescription: 'Use g; and g, to jump between recent change locations.',
  contentBlocks: [
    {
      type: 'markdown',
      content: `## Vim remembers edit locations

The changelist is different from undo. It does not revert text; it moves the cursor between recent edits.

- **g;** jumps to an older change location.
- **g,** jumps forward to a newer change location.

Use it after several small edits when you want to inspect or continue one of them.`
    },
    {
      type: 'key-list',
      keys: [
        { chars: ['g', ';'], desc: 'Jump to an older change location' },
        { chars: ['g', ','], desc: 'Jump to a newer change location' },
        { chars: ['x'], desc: 'A small delete that records a change position' }
      ]
    },
    {
      type: 'challenge',
      config: {
        initialBuffer: ['abc', 'def'],
        initialCursor: { line: 0, col: 0 },
        goalsRequired: 1,
        enabledCommands: ['x', 'j', 'k', 'g', ';', ',', 'Escape'],
        goals: [
          {
            id: 'use-changelist',
            type: 'move',
            description: 'Make two edits and use g; or g, to revisit one.',
            validator: (_prev, next) => next.changeList.length >= 2 && next.lastCommand?.type === 'move'
          }
        ]
      }
    },
    {
      type: 'cheat-sheet',
      config: { chapterId: 'chapter9' }
    }
  ]
};
