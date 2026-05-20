import type { Lesson, VimBuffer } from '@/core/types';

const projectBuffers: VimBuffer[] = [
  { id: 1, name: 'src/main.ts', lines: ['import { App } from "./App";', 'render(<App />);'], cursor: { line: 0, col: 0 } },
  { id: 2, name: 'src/App.tsx', lines: ['export function App() {', '  return <Home />;', '}'], cursor: { line: 0, col: 16 } }
];

export const splitWindows: Lesson = {
  slug: 'split-windows',
  title: 'Windows: multiple views into buffers',
  categoryId: 'chapter12',
  shortDescription: 'Open split views and move focus with Ctrl-w navigation.',
  contentBlocks: [
    {
      type: 'markdown',
      content: `## Windows are views

Vim separates buffers from windows:

- A **buffer** is the file in memory.
- A **window** is a view into a buffer.
- A split creates another window, not another copy of the file.

Use **:split** for a horizontal split and **:vsplit** for a vertical split. Then move focus with **Ctrl-w h/j/k/l**.`
    },
    {
      type: 'key-list',
      keys: [
        { chars: [':split'], desc: 'Open a horizontal split' },
        { chars: [':vsplit'], desc: 'Open a vertical split' },
        { chars: ['Ctrl-w h'], desc: 'Move focus to the left window' },
        { chars: ['Ctrl-w j'], desc: 'Move focus to the lower window' },
        { chars: ['Ctrl-w k'], desc: 'Move focus to the upper window' },
        { chars: ['Ctrl-w l'], desc: 'Move focus to the right window' },
        { chars: [':close'], desc: 'Close the current window' }
      ]
    },
    {
      type: 'challenge',
      config: {
        initialBuffer: projectBuffers[0].lines,
        initialCursor: projectBuffers[0].cursor,
        initialBuffers: projectBuffers,
        goalsRequired: 2,
        enabledCommands: [':', 's', 'p', 'l', 'i', 't', 'v', 'c', 'o', 'e', 'Enter', 'Escape', 'Ctrl-w', 'h', 'j', 'k'],
        goals: [
          {
            id: 'open-split',
            type: 'custom',
            description: 'Run :split to create another window.',
            validator: (_prev, next) => next.windows.length > 1
          },
          {
            id: 'move-focus',
            type: 'custom',
            description: 'Use Ctrl-w j or Ctrl-w k to move window focus.',
            validator: (prev, next) => prev != null && next.currentWindowIndex !== prev.currentWindowIndex
          }
        ]
      }
    }
  ]
};
