import type { Lesson, VimBuffer } from '@/core/types';

const projectBuffers: VimBuffer[] = [
  { id: 1, name: 'src/main.ts', lines: ['debugLog("boot");', 'startApp();'], cursor: { line: 0, col: 0 } },
  { id: 2, name: 'src/logger.ts', lines: ['export const debugLog = console.log;', 'export const trace = console.info;'], cursor: { line: 0, col: 13 } },
  { id: 3, name: 'README.md', lines: ['# App', 'debug notes live here.'], cursor: { line: 0, col: 0 } }
];

export const workspaceMentalModel: Lesson = {
  slug: 'workspace-mental-model',
  title: 'Project workspace: files, buffers, and results',
  categoryId: 'chapter14',
  shortDescription: 'Move from one-buffer practice to project-style editing.',
  contentBlocks: [
    {
      type: 'markdown',
      content: `## Vim project work has three layers

In a real project you rarely edit just one file. The loop is:

1. Keep files as **buffers**.
2. Search across the project.
3. Put results in a **quickfix list**.
4. Jump result-by-result and edit the active buffer.

Vimprove simulates the project, but the workflow is the same habit you use in real Vim.`
    },
    {
      type: 'key-list',
      keys: [
        { chars: [':ls'], desc: 'List open project buffers' },
        { chars: [':vimgrep /debug/'], desc: 'Search project buffers for a literal pattern' },
        { chars: [':copen'], desc: 'Open the quickfix panel' }
      ]
    },
    {
      type: 'challenge',
      config: {
        initialBuffer: projectBuffers[0].lines,
        initialCursor: projectBuffers[0].cursor,
        initialBuffers: projectBuffers,
        goalsRequired: 2,
        enabledCommands: [':', 'l', 's', 'v', 'i', 'm', 'g', 'r', 'e', 'p', '/', 'd', 'b', 'u', 'c', 'o', 'n', 'Enter', 'Escape'],
        goals: [
          {
            id: 'list-buffers',
            type: 'custom',
            description: 'Run :ls to inspect the project buffers.',
            validator: (_prev, next) => next.lastCommand?.type === 'ex' && next.lastCommand.command === 'ls'
          },
          {
            id: 'open-quickfix',
            type: 'custom',
            description: 'Run :vimgrep /debug/ to populate quickfix results.',
            validator: (_prev, next) => next.quickfixList.length >= 2 && next.quickfixOpen
          }
        ]
      }
    }
  ]
};
