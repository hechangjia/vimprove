import type { Lesson } from '@/core/types';

const dailyCommands = ['h', 'j', 'k', 'l', 'w', 'b', 'e', '0', '^', '$', 'f', 'F', 't', 'T', ';', ',', 'i', 'a', 'I', 'A', 'x', 's', 'r', 'c', 'd', 'y', 'p', 'P', 'u', '.', '/', '?', 'n', 'N', 'Escape', 'Enter', 'Backspace'];

export const devEnvironmentMentalModel: Lesson = {
  slug: 'dev-environment-mental-model',
  title: 'Development Environment Mental Model',
  categoryId: 'chapter16',
  shortDescription: 'See Vim as one layer in a complete development environment.',
  contentBlocks: [
    {
      type: 'markdown',
      content: `## Vim is one layer, not the whole system

A productive development environment is a stack:

- **Editor**: where you change text.
- **Shell**: where you run tools.
- **Language server**: where definitions, references, diagnostics, and rename live.
- **Formatter / linter / tests**: where feedback becomes repeatable.
- **AI assistant**: where suggestions accelerate exploration, but still need review.
- **Remote runtime**: where containers, SSH, and cloud workspaces keep projects reproducible.

Vim skills sit at the editing layer, but the real payoff comes when they cooperate with the rest of the stack.`
    },
    {
      type: 'key-list',
      keys: [
        { chars: ['Vim mode'], desc: 'Use Vim editing inside a larger editor or IDE' },
        { chars: ['LSP'], desc: 'Ask language-aware tools for definitions, references, diagnostics, and rename' },
        { chars: ['Feedback loop'], desc: 'Edit, run, inspect, jump back, and repeat' }
      ]
    },
    {
      type: 'challenge',
      config: {
        initialBuffer: [
          '# dev-env.toml',
          'editor = "nano"',
          'vim_mode = false',
          'diagnostics = "off"'
        ],
        initialCursor: { line: 1, col: 10 },
        enabledCommands: dailyCommands,
        goalsRequired: 2,
        goals: [
          {
            id: 'choose-vim',
            type: 'custom',
            description: 'Change the editor setting to "vim".',
            validator: (_prev, next) => next.buffer[1] === 'editor = "vim"'
          },
          {
            id: 'enable-vim-mode',
            type: 'custom',
            description: 'Change vim_mode to true.',
            validator: (_prev, next) => next.buffer[2] === 'vim_mode = true'
          }
        ]
      }
    }
  ]
};

export const vimModeEverywhere: Lesson = {
  slug: 'vim-mode-everywhere',
  title: 'Vim Mode Everywhere',
  categoryId: 'chapter16',
  shortDescription: 'Carry the same editing language into IDEs, shells, and review tools.',
  contentBlocks: [
    {
      type: 'markdown',
      content: `## One editing language across tools

Modern development often moves between VS Code, JetBrains IDEs, terminals, commit messages, browser text boxes, and code review comments.

The useful move is not to replace every tool with terminal Vim. It is to keep **Vim mode** available wherever you edit enough text to care:

- VS Code Vim or similar extensions for daily code.
- IdeaVim for JetBrains projects.
- Shell vi mode for command-line editing.
- Vim keybindings in notebooks, review tools, and browser extensions when they help.

The goal is consistency: motion, operator, text object, repeat.`
    },
    {
      type: 'key-list',
      keys: [
        { chars: ['ci"'], desc: 'Still useful inside VS Code Vim, IdeaVim, and terminal Vim' },
        { chars: ['.'], desc: 'Repeat small edits wherever the Vim layer supports it' },
        { chars: ['Esc'], desc: 'Return to command thinking before choosing the next action' }
      ]
    },
    {
      type: 'challenge',
      config: {
        initialBuffer: [
          '{',
          '  "vim.enable": false,',
          '  "vim.leader": "<space>",',
          '  "editor.lineNumbers": true',
          '}'
        ],
        initialCursor: { line: 1, col: 16 },
        enabledCommands: dailyCommands,
        goalsRequired: 1,
        goals: [
          {
            id: 'enable-vim-extension',
            type: 'custom',
            description: 'Change vim.enable from false to true.',
            validator: (_prev, next) => next.buffer[1].includes('"vim.enable": true')
          }
        ]
      }
    }
  ]
};

export const lspAiVimWorkflow: Lesson = {
  slug: 'lsp-ai-vim-workflow',
  title: 'LSP, AI, and Vim Workflow',
  categoryId: 'chapter16',
  shortDescription: 'Use Vim for precise edits while language tools handle code intelligence.',
  contentBlocks: [
    {
      type: 'markdown',
      content: `## Let each tool do its job

Vim is excellent at precise text transformation. Language servers are excellent at code-aware navigation and refactoring. AI assistants are useful for drafts, explanations, and broad edits that still need human review.

A strong workflow looks like this:

1. Use LSP to find the right symbol, diagnostic, or reference.
2. Use Vim motions and text objects to make the local edit.
3. Use formatter, linter, and tests to verify.
4. Use AI for exploration, but keep final edits small and inspectable.

This keeps your hands fast without pretending every problem is a text-only problem.`
    },
    {
      type: 'key-list',
      keys: [
        { chars: ['gd'], desc: 'Go to definition in many Vim-mode IDE setups' },
        { chars: ['gr'], desc: 'Find references through the language layer' },
        { chars: ['rename'], desc: 'Prefer semantic rename over global text replacement for symbols' }
      ]
    },
    {
      type: 'challenge',
      config: {
        initialBuffer: [
          'function getUsrName(user) {',
          '  return user.name;',
          '}',
          '',
          'const label = getUsrName(currentUser);'
        ],
        initialCursor: { line: 0, col: 12 },
        enabledCommands: dailyCommands,
        goalsRequired: 1,
        goals: [
          {
            id: 'fix-local-symbol-spelling',
            type: 'custom',
            description: 'Fix the local function spelling to getUserName in both places.',
            validator: (_prev, next) =>
              next.buffer[0].startsWith('function getUserName') &&
              next.buffer[4] === 'const label = getUserName(currentUser);'
          }
        ]
      }
    }
  ]
};

export const remoteDevWorkflowReview: Lesson = {
  slug: 'remote-dev-workflow-review',
  title: 'Remote Dev Workflow Review',
  categoryId: 'chapter16',
  shortDescription: 'Practice the edit-run-inspect loop used in SSH, containers, and cloud workspaces.',
  contentBlocks: [
    {
      type: 'markdown',
      content: `## Remote development is still an editing loop

SSH sessions, dev containers, and cloud workspaces change where the code runs, but not the core loop:

1. Open the project in a stable environment.
2. Search for the failing setting or diagnostic.
3. Make the smallest clear edit.
4. Run the formatter, linter, or test.
5. Jump back through errors and repeat.

Vim matters here because keyboard-driven editing remains reliable even when latency, remote shells, or constrained terminals make mouse-heavy workflows awkward.`
    },
    {
      type: 'key-list',
      keys: [
        { chars: [':vimgrep'], desc: 'Project search that can feed quickfix-style navigation' },
        { chars: [':cnext'], desc: 'Jump to the next result or error' },
        { chars: ['ciw'], desc: 'Change the exact word once you land at the problem' }
      ]
    },
    {
      type: 'challenge',
      config: {
        initialBuffer: [
          '# .devcontainer/settings',
          'workspace = "local"',
          'lint = "manual"',
          'test = "skip"'
        ],
        initialCursor: { line: 1, col: 13 },
        enabledCommands: dailyCommands,
        goalsRequired: 3,
        goals: [
          {
            id: 'remote-workspace',
            type: 'custom',
            description: 'Change workspace to "remote".',
            validator: (_prev, next) => next.buffer[1] === 'workspace = "remote"'
          },
          {
            id: 'auto-lint',
            type: 'custom',
            description: 'Change lint to "auto".',
            validator: (_prev, next) => next.buffer[2] === 'lint = "auto"'
          },
          {
            id: 'enable-tests',
            type: 'custom',
            description: 'Change test to "run".',
            validator: (_prev, next) => next.buffer[3] === 'test = "run"'
          }
        ]
      }
    }
  ]
};
