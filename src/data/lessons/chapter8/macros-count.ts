import type { Lesson } from '@/core/types';

export const macrosCount: Lesson = {
  slug: 'macros-count',
  title: 'Macro counts: repeat the replay',
  categoryId: 'chapter8',
  shortDescription: 'Use a count before @ to replay a macro multiple times.',
  contentBlocks: [
    {
      type: 'markdown',
      content: `## Counts multiply macro replay

Once a macro is safe, add a count:

- **3@a** replays macro \`a\` three times.
- **@@** repeats the last macro one more time.

The count belongs to the replay, not to every key inside the macro. That makes small, predictable macros easy to scale.`
    },
    {
      type: 'key-list',
      keys: [
        { chars: ['3', '@', 'a'], desc: 'Replay macro a three times' },
        { chars: ['@', '@'], desc: 'Replay the last macro once more' }
      ]
    },
    {
      type: 'challenge',
      config: {
        initialBuffer: ['abcd'],
        initialCursor: { line: 0, col: 0 },
        goalsRequired: 1,
        enabledCommands: ['q', '@', 'x', '1', '2', '3', '4', 'Escape'],
        goals: [
          {
            id: 'use-counted-macro',
            type: 'custom',
            description: 'Record x as a macro, then use a counted replay to delete multiple characters.',
            validator: (_prev, next) => next.buffer.join('\n').length <= 1 && next.lastMacroRegister === 'a'
          }
        ]
      }
    }
  ]
};
