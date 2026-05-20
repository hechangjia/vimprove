import type { Lesson } from '@/core/types';

export const registersSystem: Lesson = {
  slug: 'registers-system',
  title: 'Special registers: yank and black hole',
  categoryId: 'chapter8',
  shortDescription: 'Use "0 for the last yank and "_ to delete without replacing your paste text.',
  contentBlocks: [
    {
      type: 'markdown',
      content: `## Keep your paste text safe

Two registers matter every day:

- **"0** keeps the most recent yank.
- **"_** is the black-hole register. Deletes sent there do not replace the unnamed register.

If you yanked text and then need to delete something before pasting, use **"_d{motion}** so your paste text survives.`
    },
    {
      type: 'key-list',
      keys: [
        { chars: ['"', '0', 'p'], desc: 'Paste the most recent yank' },
        { chars: ['"', '_', 'd', 'w'], desc: 'Delete a word without changing the default register' },
        { chars: ['"', '_', 'x'], desc: 'Delete one character into the black hole' }
      ]
    },
    {
      type: 'challenge',
      config: {
        initialBuffer: ['keep remove'],
        initialCursor: { line: 0, col: 0 },
        goalsRequired: 1,
        enabledCommands: ['"', '_', 'd', 'w', 'y', 'i', 'p', 'h', 'j', 'k', 'l', 'Escape'],
        goals: [
          {
            id: 'use-black-hole',
            type: 'delete',
            description: 'Use the black-hole register for a delete.',
            validator: (_prev, next) => !next.registers._ && next.buffer.join('\n').includes('remove')
          }
        ]
      }
    }
  ]
};
