import type { Lesson } from '@/core/types';

export const visualLineMode: Lesson = {
  slug: 'visual-line-mode',
  title: 'Visual line mode: work with whole lines',
  categoryId: 'chapter7',
  shortDescription: 'Use V for linewise selections when whole lines are the unit of work.',
  contentBlocks: [
    {
      type: 'markdown',
      content: `## V selects complete lines

Characterwise Visual mode is precise, but many edits are line based:

- Remove a short block of comments.
- Move or copy a few adjacent lines.
- Change a complete statement.

Press **V** to enter **Visual Line** mode. The selection covers whole lines no matter which column the cursor was on.`
    },
    {
      type: 'markdown',
      content: `## Example: yank two lines

Start on the first declaration, press **V**, move down once with **j**, then press **y**.
Both complete lines are copied as linewise text.`
    },
    {
      type: 'run-example',
      config: {
        initialBuffer: [
          'const host = "localhost";',
          'const port = 3000;',
          'connect(host, port);'
        ],
        initialCursor: { line: 0, col: 6 },
        autoPlaySpeed: 850,
        tracks: [
          { label: 'Yank two complete lines', keys: ['V', 'j', 'y'] }
        ],
        steps: [
          { key: 'V', description: 'V: start Visual Line mode on the current line.', cursorIndex: 0 },
          { key: 'j', description: 'j: extend the line selection down by one line.', cursorIndex: 0 },
          { key: 'y', description: 'y: yank both selected lines.', cursorIndex: 0 }
        ],
        language: 'javascript'
      }
    },
    {
      type: 'key-list',
      keys: [
        { chars: ['V'], desc: 'Start linewise Visual mode' },
        { chars: ['j'], desc: 'Extend the line selection downward' },
        { chars: ['k'], desc: 'Extend the line selection upward' },
        { chars: ['y'], desc: 'Yank selected lines' },
        { chars: ['d'], desc: 'Delete selected lines' }
      ]
    },
    {
      type: 'challenge',
      config: {
        initialBuffer: [
          'function render() {',
          '  // TODO: remove before commit',
          '  // TODO: noisy debug path',
          '  return view;',
          '}'
        ],
        initialCursor: { line: 1, col: 4 },
        goalsRequired: 2,
        enabledCommands: [
          'h', 'j', 'k', 'l',
          '0', '^', '$',
          'V', 'y', 'd', 'c',
          'Escape'
        ],
        goals: [
          {
            id: 'enter-visual-line',
            type: 'custom',
            description: 'Enter Visual Line mode with V.',
            validator: (_prev, next) => next.mode === 'visual-line'
          },
          {
            id: 'remove-todo-lines',
            type: 'delete',
            description: 'Delete both TODO comment lines as whole lines.',
            validator: (_prev, next) => {
              const text = next.buffer.join('\n');
              return !text.includes('TODO') && text.includes('return view;');
            }
          }
        ]
      }
    }
  ]
};
