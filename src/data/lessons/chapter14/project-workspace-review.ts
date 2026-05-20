import type { Lesson, VimBuffer } from '@/core/types';

const projectBuffers: VimBuffer[] = [
  { id: 1, name: 'src/main.ts', lines: ['debugLog("boot");', 'startApp();'], cursor: { line: 0, col: 0 } },
  { id: 2, name: 'src/logger.ts', lines: ['export const debugLog = console.log;', 'export const trace = console.info;'], cursor: { line: 0, col: 13 } },
  { id: 3, name: 'README.md', lines: ['# App', 'debug notes live here.'], cursor: { line: 0, col: 0 } }
];

export const projectWorkspaceReview: Lesson = {
  slug: 'project-workspace-review',
  title: 'Project workspace review',
  categoryId: 'chapter14',
  shortDescription: 'Search, inspect, jump, and edit in a simulated project workspace.',
  contentBlocks: [
    {
      type: 'markdown',
      content: `## The v3 workflow

This is the shape of real Vim project editing:

1. Search across project buffers.
2. Open quickfix.
3. Jump to each result.
4. Use normal Vim edits at the destination.

The commands are small, but the workflow is project-scale.`
    },
    {
      type: 'challenge',
      config: {
        initialBuffer: projectBuffers[0].lines,
        initialCursor: projectBuffers[0].cursor,
        initialBuffers: projectBuffers,
        goalsRequired: 3,
        enabledCommands: [':', 'v', 'i', 'm', 'g', 'r', 'e', 'p', '/', 'd', 'b', 'u', 'c', 'n', 'x', 't', 'p', 'o', 'l', 's', 'Enter', 'Escape', 'w', 'c', 'i', 't', 'a', 'r'],
        goals: [
          {
            id: 'project-search',
            type: 'custom',
            description: 'Run :vimgrep /debug/ to collect all debug results.',
            validator: (_prev, next) => next.quickfixList.length === 3
          },
          {
            id: 'jump-quickfix',
            type: 'move',
            description: 'Use :cnext to jump to a result outside the first buffer.',
            validator: (_prev, next) => next.currentBufferIndex > 0 && next.quickfixIndex > 0
          },
          {
            id: 'open-panel',
            type: 'custom',
            description: 'Keep the quickfix panel open while navigating.',
            validator: (_prev, next) => next.quickfixOpen
          }
        ]
      }
    },
    {
      type: 'cheat-sheet',
      config: { chapterId: 'chapter14' }
    }
  ]
};
