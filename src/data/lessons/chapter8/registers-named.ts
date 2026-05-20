import type { Lesson } from '@/core/types';

export const registersNamed: Lesson = {
  slug: 'registers-named',
  title: 'Named registers: more than one clipboard',
  categoryId: 'chapter8',
  shortDescription: 'Use "a through "z to store and paste named snippets.',
  contentBlocks: [
    {
      type: 'markdown',
      content: `## Registers are Vim clipboards

The unnamed register is what plain **y**, **d**, and **p** use.

Named registers let you keep several snippets:

- **"ayiw** yanks the current word into register \`a\`.
- **"ap** pastes from register \`a\`.
- **"byy** can store a different line in register \`b\`.

Use names when you need to hold one snippet while editing another area.`
    },
    {
      type: 'key-list',
      keys: [
        { chars: ['"', 'a', 'y', 'i', 'w'], desc: 'Yank the inner word into register a' },
        { chars: ['"', 'a', 'p'], desc: 'Paste from register a' },
        { chars: ['"', 'b', 'd', 'w'], desc: 'Delete into register b' }
      ]
    },
    {
      type: 'challenge',
      config: {
        initialBuffer: ['alpha beta'],
        initialCursor: { line: 0, col: 0 },
        goalsRequired: 1,
        enabledCommands: ['"', 'a', 'y', 'i', 'w', 'p', 'h', 'j', 'k', 'l', 'Escape'],
        goals: [
          {
            id: 'fill-register-a',
            type: 'custom',
            description: 'Yank "alpha" into register a.',
            validator: (_prev, next) => next.registers.a === 'alpha'
          }
        ]
      }
    }
  ]
};
