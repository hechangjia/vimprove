import type { Lesson, VimBuffer } from '@/core/types';

const projectBuffers: VimBuffer[] = [
  { id: 1, name: 'src/main.ts', lines: ['import { App } from "./App";', 'render(<App />);'], cursor: { line: 0, col: 0 } },
  { id: 2, name: 'src/App.tsx', lines: ['export function App() {', '  return <Home />;', '}'], cursor: { line: 0, col: 16 } },
  { id: 3, name: 'README.md', lines: ['# Vimprove', 'A Vim learning project.'], cursor: { line: 0, col: 0 } }
];

export const switchBuffers: Lesson = {
  slug: 'switch-buffers',
  title: 'Switch buffers without reaching for the mouse',
  categoryId: 'chapter12',
  shortDescription: 'Use :bnext, :bprevious, and :buffer N to move between open files.',
  contentBlocks: [
    {
      type: 'markdown',
      content: `## Move between files by number or direction

Once you can read **:ls**, switching buffers is straightforward.

- **:bnext** or **:bn** moves to the next buffer.
- **:bprevious** or **:bp** moves to the previous buffer.
- **:buffer 3** jumps directly to buffer number 3.

For daily work, use **:ls** when you need a map, then jump by number when you know the target.`
    },
    {
      type: 'key-list',
      keys: [
        { chars: [':bn'], desc: 'Move to the next buffer' },
        { chars: [':bp'], desc: 'Move to the previous buffer' },
        { chars: [':buffer 3'], desc: 'Jump directly to buffer number 3' }
      ]
    },
    {
      type: 'challenge',
      config: {
        initialBuffer: projectBuffers[0].lines,
        initialCursor: projectBuffers[0].cursor,
        initialBuffers: projectBuffers,
        goalsRequired: 2,
        enabledCommands: [':', 'b', 'n', 'p', 'u', 'f', 'e', 'r', '3', 'Enter', 'Escape'],
        goals: [
          {
            id: 'next-buffer',
            type: 'custom',
            description: 'Run :bnext or :bn to open src/App.tsx.',
            validator: (_prev, next) => next.currentBufferIndex === 1
          },
          {
            id: 'readme-buffer',
            type: 'custom',
            description: 'Run :buffer 3 to jump to README.md.',
            validator: (_prev, next) => next.currentBufferIndex === 2
          }
        ]
      }
    }
  ]
};
