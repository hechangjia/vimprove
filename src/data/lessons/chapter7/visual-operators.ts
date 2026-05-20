import type { Lesson } from '@/core/types';

export const visualOperators: Lesson = {
  slug: 'visual-operators',
  title: 'Visual operators: y, d, c after selection',
  categoryId: 'chapter7',
  shortDescription: 'Choose the selection first, then decide whether to yank, delete, or change it.',
  contentBlocks: [
    {
      type: 'markdown',
      content: `## Selection first, operator second

Visual mode is especially helpful when you are still deciding what the range should be.

After you select text:

- **y** copies it and leaves the buffer unchanged.
- **d** deletes it and saves the removed text.
- **c** deletes it, then switches to Insert mode so you can type the replacement.

This mirrors Normal-mode operators, but the range is already visible before the operator runs.`
    },
    {
      type: 'markdown',
      content: `## Example: replace a selected word

Start on \`draft\`, enter Visual mode, extend to the end of the word, and press **c**.
Then type the replacement and press **Esc**.`
    },
    {
      type: 'run-example',
      config: {
        initialBuffer: ['let status = "draft";'],
        initialCursor: { line: 0, col: 14 },
        autoPlaySpeed: 760,
        tracks: [
          { label: 'Select, change, type', keys: ['v', 'e', 'c', 'a', 'c', 't', 'i', 'v', 'e', 'Escape'] }
        ],
        steps: [
          { key: 'v', description: 'v: start selecting at the word.', cursorIndex: 0 },
          { key: 'e', description: 'e: extend to the end of the word.', cursorIndex: 0 },
          { key: 'c', description: 'c: change the selected word and enter Insert mode.', cursorIndex: 0 },
          { key: 'a', description: 'Type "a".', cursorIndex: 0 },
          { key: 'c', description: 'Type "c".', cursorIndex: 0 },
          { key: 't', description: 'Type "t".', cursorIndex: 0 },
          { key: 'i', description: 'Type "i".', cursorIndex: 0 },
          { key: 'v', description: 'Type "v".', cursorIndex: 0 },
          { key: 'e', description: 'Type "e".', cursorIndex: 0 },
          { key: 'Escape', description: 'Escape: finish the replacement.', cursorIndex: 0 }
        ],
        language: 'javascript'
      }
    },
    {
      type: 'key-list',
      keys: [
        { chars: ['v', 'e', 'y'], desc: 'Select to the word end and yank' },
        { chars: ['v', 'e', 'd'], desc: 'Select to the word end and delete' },
        { chars: ['v', 'e', 'c'], desc: 'Select to the word end and change' },
        { chars: ['u'], desc: 'Undo the last visual edit' }
      ]
    },
    {
      type: 'challenge',
      config: {
        initialBuffer: [
          'let status = "draft";',
          'let temporary = true;'
        ],
        initialCursor: { line: 0, col: 14 },
        goalsRequired: 2,
        enabledCommands: [
          'h', 'j', 'k', 'l',
          'w', 'b', 'e', '0', '^', '$',
          'v', 'y', 'd', 'c',
          'i', 'a',
          'u', 'Escape', 'Backspace'
        ],
        goals: [
          {
            id: 'change-draft-to-active',
            type: 'change',
            description: 'Change "draft" to "active".',
            validator: (_prev, next) => next.buffer.join('\n').includes('"active"') && !next.buffer.join('\n').includes('draft')
          },
          {
            id: 'delete-temporary-line',
            type: 'delete',
            description: 'Delete the temporary flag line.',
            validator: (_prev, next) => !next.buffer.join('\n').includes('temporary') && next.buffer.join('\n').includes('status')
          }
        ]
      }
    }
  ]
};
