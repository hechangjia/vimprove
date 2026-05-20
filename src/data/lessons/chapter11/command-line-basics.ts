import type { Lesson } from '@/core/types';

export const commandLineBasics: Lesson = {
  slug: 'command-line-basics',
  title: 'Command-line mode: the colon prompt',
  categoryId: 'chapter11',
  shortDescription: 'Use : commands for editor-level actions such as write, quit, and substitute.',
  contentBlocks: [
    {
      type: 'markdown',
      content: `## The colon prompt controls the editor

Normal mode edits text. **Command-line mode** controls the editor.

Press **:** from Normal mode and Vim opens a small command prompt at the bottom.

- **:w** means write.
- **:q** means quit.
- **:wq** means write then quit.
- **:q!** means quit and discard changes.

In Vimprove these file commands are simulated, but the habit is real.`
    },
    {
      type: 'key-list',
      keys: [
        { chars: [':'], desc: 'Open the command-line prompt' },
        { chars: ['Enter'], desc: 'Execute the command' },
        { chars: ['Escape'], desc: 'Cancel command-line mode' },
        { chars: [':w'], desc: 'Write the file' },
        { chars: [':q!'], desc: 'Quit without saving' }
      ]
    },
    {
      type: 'challenge',
      config: {
        initialBuffer: ['draft note'],
        initialCursor: { line: 0, col: 0 },
        goalsRequired: 2,
        enabledCommands: [':', 'w', 'q', '!', 'Enter', 'Escape'],
        goals: [
          {
            id: 'enter-command-line',
            type: 'custom',
            description: 'Open command-line mode with :.',
            validator: (_prev, next) => next.mode === 'command'
          },
          {
            id: 'write-and-quit',
            type: 'custom',
            description: 'Run :wq to simulate writing and quitting.',
            validator: (_prev, next) => next.lastCommand?.type === 'ex' && next.lastCommand.command === 'wq'
          }
        ]
      }
    }
  ]
};
