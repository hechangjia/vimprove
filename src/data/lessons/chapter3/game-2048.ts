import type { Lesson } from '@/core/types';

export const game2048: Lesson = {
  slug: 'game-2048',
  title: 'Mini Game: 2048 with HJKL',
  categoryId: 'chapter3',
  shortDescription: 'Play 2048 with h/j/k/l to drill directional muscle memory.',
  contentBlocks: [
    {
      type: 'markdown',
      content: `## 2048 with HJKL

After all those operators, give your fingers a breather with a quick game of **2048** — same hjkl directions, no Vim state to track.

- **h / j / k / l** — slide the entire board left / down / up / right.
- Tiles of the same value merge when they collide.
- The game ends when no tile can move or merge.

This drill is pure direction practice: every move is just *which way do I want to push?* Try to keep your largest tile pinned in a corner.

Earn a badge when you reach **128 / 512 / 2048**. Press **r** on the game over screen to restart.`
    },
    {
      type: 'game-2048',
      config: {
        bronzeTile: 128,
        silverTile: 512,
        goldTile: 2048
      }
    },
    {
      type: 'key-list',
      keys: [
        { chars: ['h'], desc: 'Slide left' },
        { chars: ['j'], desc: 'Slide down' },
        { chars: ['k'], desc: 'Slide up' },
        { chars: ['l'], desc: 'Slide right' },
        { chars: ['r'], desc: 'Restart after game over' }
      ]
    }
  ]
};
