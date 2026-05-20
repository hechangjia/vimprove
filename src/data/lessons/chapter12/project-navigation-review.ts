import type { Lesson, VimBuffer } from '@/core/types';

const projectBuffers: VimBuffer[] = [
  { id: 1, name: 'src/main.ts', lines: ['import { App } from "./App";', 'render(<App />);'], cursor: { line: 0, col: 0 } },
  { id: 2, name: 'src/App.tsx', lines: ['export function App() {', '  return <Home />;', '}'], cursor: { line: 0, col: 16 } },
  { id: 3, name: 'README.md', lines: ['# Vimprove', 'A Vim learning project.'], cursor: { line: 0, col: 0 } }
];

export const projectNavigationReview: Lesson = {
  slug: 'project-navigation-review',
  title: 'Project navigation review',
  categoryId: 'chapter12',
  shortDescription: 'Combine buffer switching, splits, and Ctrl-w movement into one project routine.',
  contentBlocks: [
    {
      type: 'markdown',
      content: `## A keyboard-first project routine

Use a small loop:

1. Run **:ls** when you need to see the open files.
2. Use **:buffer N** when you know the target number.
3. Use **:split** or **:vsplit** when comparing two places.
4. Use **Ctrl-w h/j/k/l** to move focus without leaving the home row.

This is enough to navigate many small projects before adding plugins or fuzzy finders.`
    },
    {
      type: 'window-navigator',
      config: { targetScore: 8 }
    },
    {
      type: 'challenge',
      config: {
        initialBuffer: projectBuffers[0].lines,
        initialCursor: projectBuffers[0].cursor,
        initialBuffers: projectBuffers,
        goalsRequired: 3,
        enabledCommands: [':', 'l', 's', 'b', 'u', 'f', 'e', 'r', '2', '3', 'p', 'i', 't', 'v', 'Enter', 'Escape', 'Ctrl-w', 'h', 'j', 'k', 'l'],
        goals: [
          {
            id: 'inspect-list',
            type: 'custom',
            description: 'Run :ls to inspect the buffer list.',
            validator: (_prev, next) => next.lastCommand?.type === 'ex' && next.lastCommand.command === 'ls'
          },
          {
            id: 'jump-to-app',
            type: 'custom',
            description: 'Run :buffer 2 to jump to src/App.tsx.',
            validator: (_prev, next) => next.currentBufferIndex === 1
          },
          {
            id: 'create-project-view',
            type: 'custom',
            description: 'Open a split with :split or :vsplit.',
            validator: (_prev, next) => next.windows.length > 1
          }
        ]
      }
    },
    {
      type: 'cheat-sheet',
      config: { chapterId: 'chapter12' }
    }
  ]
};
