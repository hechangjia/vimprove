import type { Lesson } from '@/core/types';

export const operatorCase: Lesson = {
  slug: 'operator-case',
  title: 'Case Operators: ~, gu, gU, g~',
  categoryId: 'chapter3',
  shortDescription: 'Toggle / lower / upper case on a char, motion, or whole line.',
  contentBlocks: [
    {
      type: 'markdown',
      content: `## Case is also an operator

You can flip case of:

- A **single char** under the cursor with **~** (like x / r operate on one char).
- A **range** via **operator + motion**:
  - **gu{motion}** → make range **lower** case
  - **gU{motion}** → make range **UPPER** case
  - **g~{motion}** → **toggle** case
- A **whole line** with doubled key:
  - **guu** / **gUU** / **g~~**

Example: \`gUw\` on \`hello\` → \`HELLO\`. \`guu\` on a line → all lowercase.`
    },
    {
      type: 'run-example',
      config: {
        initialBuffer: ['hello WORLD'],
        initialCursor: { line: 0, col: 0 },
        autoPlaySpeed: 800,
        tracks: [{ label: '~ / gU / g~', keys: [] }],
        steps: [
          { key: '~', description: '~: toggle "h" -> "H", move right.', cursorIndex: 0 },
          { key: 'g', description: 'g: half of g~ operator, waits.', cursorIndex: 0 },
          { key: 'U', description: 'U: now waiting for motion (gU).', cursorIndex: 0 },
          { key: 'w', description: 'w: gUw uppercases the next word.', cursorIndex: 0 }
        ]
      }
    },
    {
      type: 'key-list',
      keys: [
        { chars: ['~'], desc: 'Toggle case of the char under cursor and move right' },
        { chars: ['g', 'u', '{motion}'], desc: 'Lowercase over motion (guw / gu$)' },
        { chars: ['g', 'U', '{motion}'], desc: 'Uppercase over motion (gUw / gU$)' },
        { chars: ['g', '~', '{motion}'], desc: 'Toggle case over motion (g~w / g~~)' },
        { chars: ['g', 'u', 'u'], desc: 'Lowercase the entire current line' },
        { chars: ['g', 'U', 'U'], desc: 'Uppercase the entire current line' }
      ]
    },
    {
      type: 'challenge',
      config: {
        initialBuffer: ['const greeting = "hello world";'],
        initialCursor: { line: 0, col: 18 },
        goalsRequired: 2,
        enabledCommands: ['~', 'g', 'u', 'U', 'h', 'l', 'w', 'b', 'e', '$', '0', 'Escape'],
        goals: [
          {
            id: 'upper-hello',
            type: 'change',
            description: 'Use gUw on the word "hello" to make it HELLO.',
            validator: (_p, next) => next.buffer[0]?.includes('HELLO') ?? false
          },
          {
            id: 'toggle-w',
            type: 'change',
            description: 'Move to "world" and use g~w (or gUw) to change its case.',
            validator: (_p, next) =>
              (next.buffer[0]?.includes('WORLD') || next.buffer[0]?.includes('wORLD')) ?? false
          }
        ]
      }
    }
  ]
};
