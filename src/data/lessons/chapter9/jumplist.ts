import type { Lesson } from '@/core/types';

export const jumplist: Lesson = {
  slug: 'jumplist',
  title: 'Jumplist: move through where you have been',
  categoryId: 'chapter9',
  shortDescription: 'Use Ctrl-o and Ctrl-i to walk backward and forward through major jumps.',
  contentBlocks: [
    {
      type: 'markdown',
      content: `## Long jumps leave breadcrumbs

Commands like **G**, **gg**, search, paragraph jumps, marks, and bracket matching can move you far away.

The jumplist gives you a back button:

- **Ctrl-o** goes to the older jump.
- **Ctrl-i** goes forward again.

This is how you explore a file without losing your place.`
    },
    {
      type: 'key-list',
      keys: [
        { chars: ['G'], desc: 'Jump to the end of the file' },
        { chars: ['g', 'g'], desc: 'Jump to the start of the file' },
        { chars: ['Ctrl-o'], desc: 'Go back in the jumplist' },
        { chars: ['Ctrl-i'], desc: 'Go forward in the jumplist' }
      ]
    },
    {
      type: 'challenge',
      config: {
        initialBuffer: ['top', 'middle', 'bottom'],
        initialCursor: { line: 0, col: 0 },
        goalsRequired: 2,
        enabledCommands: ['G', 'g', 'Ctrl-o', 'Ctrl-i', 'h', 'j', 'k', 'l', 'Escape'],
        goals: [
          {
            id: 'jump-end',
            type: 'move',
            description: 'Jump to the bottom with G.',
            validator: (_prev, next) => next.cursor.line === 2
          },
          {
            id: 'jump-back',
            type: 'move',
            description: 'Use Ctrl-o to return to the top.',
            validator: (_prev, next) => next.cursor.line === 0 && next.jumpIndex === 0
          }
        ]
      }
    }
  ]
};
