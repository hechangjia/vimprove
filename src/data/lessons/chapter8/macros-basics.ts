import type { Lesson } from '@/core/types';

export const macrosBasics: Lesson = {
  slug: 'macros-basics',
  title: 'Macros: record once, replay later',
  categoryId: 'chapter8',
  shortDescription: 'Use q{register} to record a command sequence and @{register} to replay it.',
  contentBlocks: [
    {
      type: 'markdown',
      content: `## A macro is a remembered key sequence

Macros let you record real Vim keystrokes and replay them later.

- **q{a-z}** starts recording into a register.
- **q** stops recording.
- **@{a-z}** replays that register.
- **@@** repeats the last replayed macro.

Start with tiny macros. A macro that does one reliable edit is better than a clever macro that only works once.`
    },
    {
      type: 'key-list',
      keys: [
        { chars: ['q', 'a'], desc: 'Start recording macro a' },
        { chars: ['q'], desc: 'Stop recording' },
        { chars: ['@', 'a'], desc: 'Replay macro a' },
        { chars: ['@', '@'], desc: 'Replay the last macro again' }
      ]
    },
    {
      type: 'challenge',
      config: {
        initialBuffer: ['one two three'],
        initialCursor: { line: 0, col: 0 },
        goalsRequired: 2,
        enabledCommands: ['q', '@', 'x', 'h', 'j', 'k', 'l', 'Escape'],
        goals: [
          {
            id: 'record-macro-a',
            type: 'custom',
            description: 'Record a small macro into register a.',
            validator: (_prev, next) => Boolean(next.macros.a?.length)
          },
          {
            id: 'replay-macro-a',
            type: 'custom',
            description: 'Replay macro a at least once.',
            validator: (_prev, next) => next.lastMacroRegister === 'a'
          }
        ]
      }
    }
  ]
};
