import type { Lesson } from '@/core/types';

export const visualRefactorReview: Lesson = {
  slug: 'visual-refactor-review',
  title: 'Visual mode review: choose the right selection',
  categoryId: 'chapter7',
  shortDescription: 'Combine character, line, and block selections on one small cleanup task.',
  contentBlocks: [
    {
      type: 'markdown',
      content: `## Pick the selection shape

Visual mode is not one feature; it is three selection shapes:

- **v** for a character range.
- **V** for complete lines.
- **Ctrl-v** for a rectangle.

The practical question is: what shape is the edit?

Use characterwise selection for a small phrase, linewise selection for complete statements, and blockwise selection for aligned columns.`
    },
    {
      type: 'key-list',
      keys: [
        { chars: ['v'], desc: 'Characterwise selection for a phrase or word fragment' },
        { chars: ['V'], desc: 'Linewise selection for complete lines' },
        { chars: ['Ctrl-v'], desc: 'Blockwise selection for aligned columns' },
        { chars: ['y', 'd', 'c'], desc: 'Apply yank, delete, or change after selecting' }
      ]
    },
    {
      type: 'challenge',
      config: {
        initialBuffer: [
          '// remove this debug block',
          '// it was useful yesterday',
          'const label = "draft";',
          'name    age    role',
          'nina    34     dev',
          'omar    29     ops'
        ],
        initialCursor: { line: 0, col: 0 },
        goalsRequired: 3,
        enabledCommands: [
          'h', 'j', 'k', 'l',
          'w', 'b', 'e', '0', '^', '$',
          'v', 'V', 'Ctrl-v',
          'y', 'd', 'c',
          'i', 'a',
          'Escape', 'Backspace'
        ],
        goals: [
          {
            id: 'remove-debug-block',
            type: 'delete',
            description: 'Remove the two debug comment lines.',
            validator: (_prev, next) => {
              const text = next.buffer.join('\n');
              return !text.includes('debug block') && !text.includes('yesterday');
            }
          },
          {
            id: 'change-label',
            type: 'change',
            description: 'Change the label from "draft" to "active".',
            validator: (_prev, next) => {
              const text = next.buffer.join('\n');
              return text.includes('"active"') && !text.includes('"draft"');
            }
          },
          {
            id: 'remove-age-column',
            type: 'delete',
            description: 'Remove the aligned age values 34 and 29.',
            validator: (_prev, next) => {
              const text = next.buffer.join('\n');
              return !text.includes('34') && !text.includes('29') && text.includes('nina') && text.includes('ops');
            }
          }
        ]
      }
    },
    {
      type: 'cheat-sheet',
      config: { chapterId: 'chapter7' }
    }
  ]
};
