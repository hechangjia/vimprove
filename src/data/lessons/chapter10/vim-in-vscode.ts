import type { Lesson } from '@/core/types';

export const vimInVscode: Lesson = {
  slug: 'vim-in-vscode',
  title: 'Use Vim inside VSCode',
  categoryId: 'chapter10',
  shortDescription: 'Map Vim habits onto VSCode without fighting the whole IDE.',
  contentBlocks: [
    {
      type: 'markdown',
      content: `## Let Vim handle text, let VSCode handle the IDE

The VSCode Vim extension is most useful when you draw a boundary:

- Vim handles local editing: motions, operators, search, text objects, repeat.
- VSCode handles IDE features: command palette, file search, debugger, refactors, panels.

This avoids a common trap: trying to make VSCode behave exactly like terminal Vim.

A good starting setup is small:

\`\`\`json
{
  "vim.useSystemClipboard": true,
  "vim.smartRelativeLine": true,
  "vim.hlsearch": true
}
\`\`\`

Then add keybindings only for actions you actually repeat every day.`
    },
    {
      type: 'key-list',
      keys: [
        { chars: ['d', 'i', '"'], desc: 'Delete inside quotes in code or settings JSON' },
        { chars: ['c', 'i', '"'], desc: 'Change a string value without touching the quotes' },
        { chars: ['/', 'n'], desc: 'Search and jump through repeated setting names' },
        { chars: ['.'], desc: 'Repeat the last text edit after using VSCode navigation' }
      ]
    },
    {
      type: 'run-example',
      config: {
        initialBuffer: [
          '{',
          '  "vim.useSystemClipboard": false,',
          '  "vim.smartRelativeLine": true',
          '}'
        ],
        initialCursor: { line: 1, col: 28 },
        autoPlaySpeed: 850,
        language: 'javascript',
        tracks: [
          { label: 'Fix a VSCode Vim setting', keys: ['c', 'w', 't', 'r', 'u', 'e', 'Escape'] }
        ],
        steps: [
          { key: 'c', description: 'c: start a change operator on the setting value.', cursorIndex: 0 },
          { key: 'w', description: 'w: cw removes "false" and enters Insert mode.', cursorIndex: 0 },
          { key: 't', description: 'Type "t".', cursorIndex: 0 },
          { key: 'r', description: 'Type "r".', cursorIndex: 0 },
          { key: 'u', description: 'Type "u".', cursorIndex: 0 },
          { key: 'e', description: 'Type "e" to make the value true.', cursorIndex: 0 },
          { key: 'Escape', description: 'Escape: keep the JSON edit and return to Normal mode.', cursorIndex: 0 }
        ]
      }
    },
    {
      type: 'markdown',
      content: `## A useful compromise

Keep VSCode shortcuts that open tools: Command Palette, file search, terminal, debugger.

Replace shortcuts that edit text locally with Vim commands. That is where the extension gives you the most value.`
    }
  ]
};
