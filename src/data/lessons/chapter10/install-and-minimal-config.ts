import type { Lesson } from '@/core/types';

export const installAndMinimalConfig: Lesson = {
  slug: 'install-and-minimal-config',
  title: 'Install Vim / Neovim and start small',
  categoryId: 'chapter10',
  shortDescription: 'Turn Vim from a lesson tool into an editor you can actually open and configure.',
  contentBlocks: [
    {
      type: 'markdown',
      content: `## Start with a tiny, boring setup

Real Vim use starts with two decisions:

- Which editor binary you will run: **Vim** or **Neovim**.
- Which config file you will keep small enough to understand.

Practical defaults:

- macOS: install Neovim with Homebrew, then run \`nvim\`.
- Linux: install \`vim\` or \`neovim\` from your distro package manager.
- Windows: install Neovim and use it from Windows Terminal or PowerShell.

Do not begin by copying a giant dotfiles repo. Start with a tiny file:

\`\`\`vim
set number
set relativenumber
set ignorecase
set smartcase
set incsearch
set undofile
\`\`\`

The goal is not to build the perfect setup. The goal is to have a setup you can explain.`
    },
    {
      type: 'key-list',
      keys: [
        { chars: ['i'], desc: 'Insert before the cursor when editing a config line' },
        { chars: ['A'], desc: 'Append at the end of a config line' },
        { chars: ['o'], desc: 'Open a new config line below' },
        { chars: ['/'], desc: 'Search for an option you want to change' },
        { chars: ['u'], desc: 'Undo a config edit that went wrong' }
      ]
    },
    {
      type: 'run-example',
      config: {
        initialBuffer: [
          'set number',
          'set ignorecase',
          'set undofile'
        ],
        initialCursor: { line: 0, col: 0 },
        autoPlaySpeed: 850,
        language: 'auto',
        tracks: [
          { label: 'Add a small config option', keys: ['G', 'o', 's', 'e', 't', ' ', 'i', 'n', 'c', 's', 'e', 'a', 'r', 'c', 'h', 'Escape'] }
        ],
        steps: [
          { key: 'G', description: 'G: jump to the last config line.', cursorIndex: 0 },
          { key: 'o', description: 'o: open a new line below and enter Insert mode.', cursorIndex: 0 },
          { key: 's', description: 'Type "s".', cursorIndex: 0 },
          { key: 'e', description: 'Type "e".', cursorIndex: 0 },
          { key: 't', description: 'Type "t".', cursorIndex: 0 },
          { key: ' ', description: 'Type a space.', cursorIndex: 0 },
          { key: 'i', description: 'Type "i".', cursorIndex: 0 },
          { key: 'n', description: 'Type "n".', cursorIndex: 0 },
          { key: 'c', description: 'Type "c".', cursorIndex: 0 },
          { key: 's', description: 'Type "s".', cursorIndex: 0 },
          { key: 'e', description: 'Type "e".', cursorIndex: 0 },
          { key: 'a', description: 'Type "a".', cursorIndex: 0 },
          { key: 'r', description: 'Type "r".', cursorIndex: 0 },
          { key: 'c', description: 'Type "c".', cursorIndex: 0 },
          { key: 'h', description: 'Type "h" to finish "set incsearch".', cursorIndex: 0 },
          { key: 'Escape', description: 'Escape: return to Normal mode with the new option in place.', cursorIndex: 0 }
        ]
      }
    },
    {
      type: 'markdown',
      content: `## Keep one rule

When a setting confuses you, delete it or comment it out until you understand it.

The best first config is not impressive. It is small, stable, and easy to rebuild on another machine.`
    }
  ]
};
