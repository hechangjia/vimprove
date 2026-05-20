import type { Lesson, VimBuffer } from '@/core/types';

const projectBuffers: VimBuffer[] = [
  { id: 1, name: 'src/main.ts', lines: ['debugLog("boot");', 'startApp();'], cursor: { line: 0, col: 0 } },
  { id: 2, name: 'src/logger.ts', lines: ['export const debugLog = console.log;', 'export const trace = console.info;'], cursor: { line: 0, col: 13 } },
  { id: 3, name: 'README.md', lines: ['# App', 'debug notes live here.'], cursor: { line: 0, col: 0 } }
];

export const quickfixNavigation: Lesson = {
  slug: 'quickfix-navigation',
  title: 'Quickfix navigation: cnext and cprev',
  categoryId: 'chapter14',
  shortDescription: 'Jump through project search results without losing context.',
  contentBlocks: [
    {
      type: 'markdown',
      content: `## Quickfix is your project to-do list

Once **:vimgrep** fills quickfix, use:

- **:cnext** to jump to the next result.
- **:cprev** to jump to the previous result.
- **:copen** and **:cclose** to show or hide the list.

Each jump switches to the matching buffer and places the cursor on the match.`
    },
    {
      type: 'key-list',
      keys: [
        { chars: [':cnext'], desc: 'Jump to the next quickfix result' },
        { chars: [':cprev'], desc: 'Jump to the previous quickfix result' },
        { chars: [':copen'], desc: 'Open the quickfix panel' },
        { chars: [':cclose'], desc: 'Close the quickfix panel' }
      ]
    },
    {
      type: 'challenge',
      config: {
        initialBuffer: projectBuffers[0].lines,
        initialCursor: projectBuffers[0].cursor,
        initialBuffers: projectBuffers,
        goalsRequired: 2,
        enabledCommands: [':', 'v', 'i', 'm', 'g', 'r', 'e', 'p', '/', 'd', 'b', 'u', 'c', 'n', 'x', 't', 'p', 'o', 'l', 's', 'Enter', 'Escape'],
        goals: [
          {
            id: 'build-quickfix',
            type: 'custom',
            description: 'Run :vimgrep /debug/ to build quickfix.',
            validator: (_prev, next) => next.quickfixList.length === 3
          },
          {
            id: 'jump-next-result',
            type: 'move',
            description: 'Run :cnext to jump into src/logger.ts.',
            validator: (_prev, next) => next.currentBufferIndex === 1 && next.quickfixIndex === 1
          }
        ]
      }
    }
  ]
};
