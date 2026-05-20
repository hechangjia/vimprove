import type { Lesson } from '@/core/types';

export const firstWeekWorkflowReview: Lesson = {
  slug: 'first-week-workflow-review',
  title: 'First-week workflow review',
  categoryId: 'chapter11',
  shortDescription: 'Combine quick exits, precise find motions, and substitute into a daily editing routine.',
  contentBlocks: [
    {
      type: 'markdown',
      content: `## A daily Vim loop

For the first week, keep the loop simple:

1. Move with words and line targets, not one character at a time.
2. Use **f/t** when the target is visible on the line.
3. Use **/** when the target is elsewhere.
4. Use **:s** or **:%s** when the same text repeats.
5. If the command was too broad, press **u** immediately.

The goal is not purity. The goal is to make common edits feel boring and reliable.`
    },
    {
      type: 'find-target',
      config: {
        targetScore: 5
      }
    },
    {
      type: 'challenge',
      config: {
        initialBuffer: [
          'status: pending',
          'status: pending',
          'status: pending'
        ],
        initialCursor: { line: 0, col: 0 },
        goalsRequired: 2,
        enabledCommands: [':', '%', 's', '/', 'p', 'e', 'n', 'd', 'i', 'g', 'r', 'a', 'y', 'Enter', 'Escape', 'u'],
        goals: [
          {
            id: 'replace-pending-with-ready',
            type: 'change',
            description: 'Use :%s/pending/ready/g to update every status.',
            validator: (_prev, next) => next.buffer.every(line => line === 'status: ready')
          },
          {
            id: 'ex-command-used',
            type: 'custom',
            description: 'Complete the edit through command-line mode.',
            validator: (_prev, next) => next.lastCommand?.type === 'ex'
          }
        ]
      }
    },
    {
      type: 'cheat-sheet',
      config: { chapterId: 'chapter11' }
    }
  ]
};
