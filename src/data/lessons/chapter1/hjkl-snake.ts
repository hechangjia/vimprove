import type { Lesson } from '@/core/types';

export const hjklSnake: Lesson = {
  slug: 'hjkl-snake',
  title: 'Mini Game: HJKL Snake',
  categoryId: 'chapter1',
  shortDescription: 'Build HJKL muscle memory with a tiny snake game.',
  contentBlocks: [
    {
      type: 'markdown',
      content: `## HJKL Snake

This is a short “muscle memory” drill.

- Use **h j k l** to steer the snake.
- Hit a wall or your own body and the run ends.
- When you reach **Bronze / Silver / Gold**, you'll see a quick badge — the game does not pause.

Tip: press **r** to restart on the game over screen.`
    },
    {
      type: 'hjkl-snake',
      config: {
        boardWidth: 32,
        boardHeight: 18,
        bronzeScore: 5,
        silverScore: 10,
        goldScore: 15
      }
    },
    {
      type: 'key-list',
      keys: [
        { chars: ['h'], desc: 'Move left' },
        { chars: ['j'], desc: 'Move down' },
        { chars: ['k'], desc: 'Move up' },
        { chars: ['l'], desc: 'Move right' }
      ]
    }
  ]
};
