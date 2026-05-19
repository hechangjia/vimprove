import type { Lesson } from '@/core/types';

export const operatorShortcuts: Lesson = {
  slug: 'operator-shortcuts',
  title: 'Uppercase Shortcuts: D, C, Y, S',
  categoryId: 'chapter3',
  shortDescription: 'One-key shortcuts for the four most common operator + motion combos.',
  contentBlocks: [
    {
      type: 'markdown',
      content: `## Four "save one keystroke" shortcuts

Some operator + motion combos are so common that Vim gives them a single uppercase key:

- **D** ≡ **d$** — delete from cursor to end of line.
- **C** ≡ **c$** — change from cursor to end of line.
- **Y** ≡ **yy** — yank (copy) the entire line.
- **S** ≡ **cc** — substitute the whole line (clear it and enter insert).

Once you internalize these, your daily editing becomes noticeably snappier.`
    },
    {
      type: 'run-example',
      config: {
        initialBuffer: [
          'const x = 42; // delete the comment'
        ],
        initialCursor: { line: 0, col: 14 },
        autoPlaySpeed: 800,
        tracks: [{ label: 'D / Y', keys: [] }],
        steps: [
          { key: 'D', description: 'D: delete from cursor to end of line (= d$).', cursorIndex: 0 },
          { key: '0', description: '0: jump back to column 0.', cursorIndex: 0 },
          { key: 'Y', description: 'Y: yank the whole line into the register (= yy).', cursorIndex: 0 }
        ]
      }
    },
    {
      type: 'key-list',
      keys: [
        { chars: ['D'], desc: 'Delete from cursor to end of line (= d$)' },
        { chars: ['C'], desc: 'Change from cursor to end of line (= c$)' },
        { chars: ['Y'], desc: 'Yank the current line (= yy)' },
        { chars: ['S'], desc: 'Substitute the whole line (= cc)' }
      ]
    },
    {
      type: 'challenge',
      config: {
        initialBuffer: [
          'console.log("debug");  // remove this comment',
          'const value = 42;'
        ],
        initialCursor: { line: 0, col: 23 },
        goalsRequired: 2,
        enabledCommands: ['D', 'C', 'Y', 'S', 'h', 'j', 'k', 'l', '0', '$', 'Escape'],
        goals: [
          {
            id: 'use-D',
            type: 'delete',
            description: 'Use D to remove the inline comment on line 1.',
            validator: (_p, next) =>
              next.buffer[0]?.startsWith('console.log("debug");') &&
              !next.buffer[0]?.includes('//')
          },
          {
            id: 'use-Y',
            type: 'custom',
            description: 'Move to line 2 and use Y to yank the whole line into the register.',
            validator: (_p, next) =>
              typeof next.register === 'string' && next.register.includes('const value = 42;')
          }
        ]
      }
    }
  ]
};
