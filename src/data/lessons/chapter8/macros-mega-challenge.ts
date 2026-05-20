import type { Lesson } from '@/core/types';

export const macrosMegaChallenge: Lesson = {
  slug: 'macros-mega-challenge',
  title: 'Macro review: repeat a real edit',
  categoryId: 'chapter8',
  shortDescription: 'Combine macros and registers on a small repeated cleanup task.',
  contentBlocks: [
    {
      type: 'markdown',
      content: `## A good macro has a stable landing point

Before recording, ask:

1. Where does the macro start?
2. What edit does it perform?
3. Where should the cursor land for the next replay?

The safest macros finish on the next similar target, ready for **@@** or a counted replay.`
    },
    {
      type: 'key-list',
      keys: [
        { chars: ['q', 'a'], desc: 'Record macro a' },
        { chars: ['@', 'a'], desc: 'Replay macro a' },
        { chars: ['3', '@', 'a'], desc: 'Replay macro a three times' },
        { chars: ['"', '_'], desc: 'Use black-hole deletes inside cleanup macros' }
      ]
    },
    {
      type: 'challenge',
      config: {
        initialBuffer: ['TODO alpha', 'TODO beta', 'TODO gamma'],
        initialCursor: { line: 0, col: 0 },
        goalsRequired: 2,
        enabledCommands: ['q', '@', 'x', 'w', 'j', '0', '"', '_', 'd', '1', '2', '3', 'Escape'],
        goals: [
          {
            id: 'record-cleanup-macro',
            type: 'custom',
            description: 'Record a cleanup macro.',
            validator: (_prev, next) => Boolean(next.macros.a?.length)
          },
          {
            id: 'replay-cleanup-macro',
            type: 'custom',
            description: 'Replay the cleanup macro.',
            validator: (_prev, next) => next.lastMacroRegister === 'a'
          }
        ]
      }
    },
    {
      type: 'cheat-sheet',
      config: { chapterId: 'chapter8' }
    }
  ]
};
