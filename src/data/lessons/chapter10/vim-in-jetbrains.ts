import type { Lesson } from '@/core/types';

export const vimInJetbrains: Lesson = {
  slug: 'vim-in-jetbrains',
  title: 'Use IdeaVim in JetBrains IDEs',
  categoryId: 'chapter10',
  shortDescription: 'Use Vim motions in IntelliJ, WebStorm, PyCharm, and friends without losing IDE power.',
  contentBlocks: [
    {
      type: 'markdown',
      content: `## IdeaVim is an adapter, not a full terminal Vim

JetBrains IDEs already have strong navigation, refactoring, inspections, and project tools.
IdeaVim adds Vim-style text editing on top.

The practical split is:

- Use Vim commands for precise edits inside the current file.
- Use IDE actions for project-wide intelligence.
- Put only stable preferences in \`.ideavimrc\`.

Example starter:

\`\`\`vim
set surround
set commentary
set easymotion
set clipboard+=unnamed
\`\`\`

If a key conflict appears, decide which side owns that key: Vim text editing or IDE action.`
    },
    {
      type: 'key-list',
      keys: [
        { chars: ['g', 'd'], desc: 'Often mapped to go to declaration in IDE Vim setups' },
        { chars: ['c', 'i', 'w'], desc: 'Change the current identifier before using IDE rename' },
        { chars: ['d', 'a', '('], desc: 'Delete a function call argument group' },
        { chars: ['u'], desc: 'Undo a Vim-side text edit before invoking IDE refactors' }
      ]
    },
    {
      type: 'run-example',
      config: {
        initialBuffer: [
          'set surround',
          'set commentary',
          'set clipboard+=unnamed'
        ],
        initialCursor: { line: 2, col: 0 },
        autoPlaySpeed: 850,
        language: 'auto',
        tracks: [
          { label: 'Adjust an .ideavimrc option', keys: ['$', 'A', 'p', 'l', 'u', 's', 'Escape'] }
        ],
        steps: [
          { key: '$', description: '$: jump to the end of the clipboard option.', cursorIndex: 0 },
          { key: 'A', description: 'A: append at the end of the line.', cursorIndex: 0 },
          { key: 'p', description: 'Type "p".', cursorIndex: 0 },
          { key: 'l', description: 'Type "l".', cursorIndex: 0 },
          { key: 'u', description: 'Type "u".', cursorIndex: 0 },
          { key: 's', description: 'Type "s" to finish "unnamedplus".', cursorIndex: 0 },
          { key: 'Escape', description: 'Escape: return to Normal mode after updating the option.', cursorIndex: 0 }
        ]
      }
    },
    {
      type: 'markdown',
      content: `## Keep conflicts explicit

When a shortcut feels broken, do not guess. Open the IdeaVim key handler settings and choose whether that shortcut belongs to Vim or the IDE.

That one habit prevents most IdeaVim frustration.`
    }
  ]
};
