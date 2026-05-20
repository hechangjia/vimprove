import type { Lesson, VimBuffer } from '@/core/types';

const projectBuffers: VimBuffer[] = [
  { id: 1, name: 'src/main.ts', lines: ['import { App } from "./App";', 'render(<App />);'], cursor: { line: 0, col: 0 } },
  { id: 2, name: 'src/App.tsx', lines: ['export function App() {', '  return <Home />;', '}'], cursor: { line: 0, col: 16 } },
  { id: 3, name: 'README.md', lines: ['# Vimprove', 'A Vim learning project.'], cursor: { line: 0, col: 0 } }
];

export const bufferListBasics: Lesson = {
  slug: 'buffer-list-basics',
  title: 'Buffers: files already in memory',
  categoryId: 'chapter12',
  shortDescription: 'Learn to read Vim’s buffer list as your open-file map.',
  contentBlocks: [
    {
      type: 'markdown',
      content: `## Buffers are open files

In Vim, a **buffer** is a file loaded into memory. A window is just a view into a buffer.

The first navigation command to learn is **:ls**. It shows the buffers Vim already knows about.

- **%** marks the current buffer.
- The number on the left is the buffer number.
- The name on the right is the file name you can switch to later.

Vimprove simulates these buffers. No real files are opened or saved.`
    },
    {
      type: 'key-list',
      keys: [
        { chars: [':ls'], desc: 'List open buffers' },
        { chars: [':buffers'], desc: 'Same idea, longer name' },
        { chars: ['%'], desc: 'Current-buffer marker in the list' }
      ]
    },
    {
      type: 'challenge',
      config: {
        initialBuffer: projectBuffers[0].lines,
        initialCursor: projectBuffers[0].cursor,
        initialBuffers: projectBuffers,
        goalsRequired: 1,
        enabledCommands: [':', 'l', 's', 'b', 'u', 'f', 'e', 'r', 'Enter', 'Escape'],
        goals: [
          {
            id: 'list-buffers',
            type: 'custom',
            description: 'Run :ls to list the project buffers.',
            validator: (_prev, next) => next.lastCommand?.type === 'ex' && next.lastCommand.command === 'ls'
          }
        ]
      }
    }
  ]
};
