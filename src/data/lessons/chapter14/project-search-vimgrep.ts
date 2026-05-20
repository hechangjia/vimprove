import type { Lesson, VimBuffer } from '@/core/types';

const projectBuffers: VimBuffer[] = [
  { id: 1, name: 'src/main.ts', lines: ['debugLog("boot");', 'startApp();'], cursor: { line: 0, col: 0 } },
  { id: 2, name: 'src/logger.ts', lines: ['export const debugLog = console.log;', 'export const trace = console.info;'], cursor: { line: 0, col: 13 } },
  { id: 3, name: 'README.md', lines: ['# App', 'debug notes live here.'], cursor: { line: 0, col: 0 } }
];

export const projectSearchVimgrep: Lesson = {
  slug: 'project-search-vimgrep',
  title: 'Project search with :vimgrep',
  categoryId: 'chapter14',
  shortDescription: 'Search every simulated project buffer and collect matches into quickfix.',
  contentBlocks: [
    {
      type: 'markdown',
      content: `## Search first, edit second

Use **:vimgrep /pattern/** when you need a project-wide map.

In Vimprove this is a literal search across simulated buffers. In real Vim, \`:vimgrep\` can use Vim regex and file globs.

The important habit is the same: collect results before changing code.`
    },
    {
      type: 'challenge',
      config: {
        initialBuffer: projectBuffers[0].lines,
        initialCursor: projectBuffers[0].cursor,
        initialBuffers: projectBuffers,
        goalsRequired: 1,
        enabledCommands: [':', 'v', 'i', 'm', 'g', 'r', 'e', 'p', '/', 'd', 'b', 'u', 'Enter', 'Escape'],
        goals: [
          {
            id: 'search-debug',
            type: 'custom',
            description: 'Run :vimgrep /debug/ and build a quickfix list.',
            validator: (_prev, next) => next.quickfixList.length === 3 && next.lastCommand?.command === 'vimgrep /debug/'
          }
        ]
      }
    }
  ]
};
