import type { Lesson } from '@/core/types';

export const motionsBracketMatch: Lesson = {
  slug: 'motions-bracket-match',
  title: 'Bracket Match: %',
  categoryId: 'chapter1',
  shortDescription: 'Jump between matching ( ), [ ], { } pairs.',
  contentBlocks: [
    {
      type: 'markdown',
      content: `## Match the bracket

Place the cursor on any **\`(\`**, **\`)\`**, **\`[\`**, **\`]\`**, **\`{\`** or **\`}\`** and press **%**.
Vim jumps to its matching pair.

This is essential for navigating function calls, array literals, and code blocks.

> Note: this mini editor matches brackets **on the same line only**. Real Vim handles multi-line as well.`
    },
    {
      type: 'run-example',
      config: {
        initialBuffer: ['function add(a, b) { return a + b; }'],
        initialCursor: { line: 0, col: 12 },
        autoPlaySpeed: 900,
        tracks: [{ label: '% match', keys: [] }],
        steps: [
          { key: '%', description: '%: from ( jump to ).', cursorIndex: 0 },
          { key: '%', description: '%: from ) jump back to (.', cursorIndex: 0 }
        ]
      }
    },
    {
      type: 'key-list',
      keys: [
        { chars: ['%'], desc: 'Jump to the matching bracket' }
      ]
    },
    {
      type: 'challenge',
      config: {
        initialBuffer: ['const tuple = [1, [2, 3], 4];'],
        initialCursor: { line: 0, col: 14 },
        goalsRequired: 2,
        enabledCommands: ['%', 'h', 'l', 'j', 'k'],
        goals: [
          {
            id: 'outer-close',
            type: 'move',
            description: 'Press % to jump to the matching ] of the outer array.',
            validator: (_p, next) => next.cursor.col === 27
          },
          {
            id: 'inner-pair',
            type: 'move',
            description: 'Move to the inner [ and press % to jump to its ].',
            validator: (_p, next) => next.cursor.col === 22
          }
        ]
      }
    }
  ]
};
