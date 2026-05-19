import type { Lesson } from '@/core/types';

export const motionsParagraph: Lesson = {
  slug: 'motions-paragraph',
  title: 'Paragraphs: { and }',
  categoryId: 'chapter1',
  shortDescription: 'Jump between paragraphs (blank-line separated blocks).',
  contentBlocks: [
    {
      type: 'markdown',
      content: `## What counts as a paragraph?

A **paragraph** is any block of text separated from others by a blank line.
Code naturally forms paragraphs: each function, each import block, each \`if\` arm.

- **\`}\`** → jump **forward** to the next blank line (or end of file).
- **\`{\`** → jump **backward** to the previous blank line (or start of file).

This is the fastest way to navigate by "logical block" without counting lines.`
    },
    {
      type: 'run-example',
      config: {
        initialBuffer: [
          'import x',
          'import y',
          '',
          'function a() {',
          '  return 1;',
          '}',
          '',
          'function b() {',
          '  return 2;',
          '}'
        ],
        initialCursor: { line: 0, col: 0 },
        autoPlaySpeed: 850,
        tracks: [{ label: '{ / }', keys: [] }],
        steps: [
          { key: '}', description: '}: jump forward to the first blank line.', cursorIndex: 0 },
          { key: '}', description: '}: jump to the next blank line.', cursorIndex: 0 },
          { key: '{', description: '{: jump backward to previous blank line.', cursorIndex: 0 },
          { key: '{', description: '{: jump back to start of file.', cursorIndex: 0 }
        ]
      }
    },
    {
      type: 'key-list',
      keys: [
        { chars: ['}'], desc: 'Jump forward to the next blank line' },
        { chars: ['{'], desc: 'Jump backward to the previous blank line' }
      ]
    },
    {
      type: 'challenge',
      config: {
        initialBuffer: [
          'paragraph A line 1',
          'paragraph A line 2',
          '',
          'paragraph B line 1',
          'paragraph B line 2',
          '',
          'paragraph C line 1'
        ],
        initialCursor: { line: 0, col: 0 },
        goalsRequired: 2,
        enabledCommands: ['{', '}', 'h', 'j', 'k', 'l'],
        goals: [
          {
            id: 'next-para',
            type: 'move',
            description: 'Use } to jump to the blank line after paragraph A.',
            validator: (_p, next) => next.cursor.line === 2
          },
          {
            id: 'last-para',
            type: 'move',
            description: 'Continue with } until you reach paragraph C.',
            validator: (_p, next) => next.cursor.line === 6
          }
        ]
      }
    }
  ]
};
