import type { Lesson } from '@/core/types';

export const vimInTerminal: Lesson = {
  slug: 'vim-in-terminal',
  title: 'Use Vim habits in the terminal',
  categoryId: 'chapter10',
  shortDescription: 'Bring Normal-mode editing to shell prompts, commit messages, less, and man pages.',
  contentBlocks: [
    {
      type: 'markdown',
      content: `## Vim is not only an editor window

Once Vim motions feel natural, you can reuse the same ideas in terminal tools:

- Shell prompt editing with vi mode: \`set -o vi\` in bash or \`bindkey -v\` in zsh.
- Git commit messages: your editor opens and Normal mode is waiting.
- \`less\` and \`man\`: search with \`/\`, repeat with \`n\`, move with \`j\` / \`k\`.

This is where Vim starts to feel like a shared language across tools.`
    },
    {
      type: 'key-list',
      keys: [
        { chars: ['Esc'], desc: 'Leave insert-style shell editing and enter command-style movement' },
        { chars: ['0', '$'], desc: 'Jump to start or end of a command line' },
        { chars: ['w', 'b'], desc: 'Move by words in a shell command' },
        { chars: ['/', 'n'], desc: 'Search inside less, man, or a commit template' }
      ]
    },
    {
      type: 'run-example',
      config: {
        initialBuffer: [
          'git commit -m "fix stuff"',
          '',
          '# Rewrite the message before you commit'
        ],
        initialCursor: { line: 0, col: 15 },
        autoPlaySpeed: 850,
        language: 'auto',
        tracks: [
          { label: 'Rewrite a commit-message fragment', keys: ['c', 'i', '"', 'd', 'e', 's', 'c', 'r', 'i', 'b', 'e', ' ', 'c', 'o', 'n', 'f', 'i', 'g', ' ', 's', 't', 'a', 'r', 't', 'Escape'] }
        ],
        steps: [
          { key: 'c', description: 'c: start changing a text object.', cursorIndex: 0 },
          { key: 'i', description: 'i: choose inside.', cursorIndex: 0 },
          { key: '"', description: '": ci" changes the text inside quotes.', cursorIndex: 0 },
          { key: 'd', description: 'Type the new message.', cursorIndex: 0 },
          { key: 'e', description: 'Continue typing.', cursorIndex: 0 },
          { key: 's', description: 'Continue typing.', cursorIndex: 0 },
          { key: 'c', description: 'Continue typing.', cursorIndex: 0 },
          { key: 'r', description: 'Continue typing.', cursorIndex: 0 },
          { key: 'i', description: 'Continue typing.', cursorIndex: 0 },
          { key: 'b', description: 'Continue typing.', cursorIndex: 0 },
          { key: 'e', description: 'Continue typing.', cursorIndex: 0 },
          { key: ' ', description: 'Type a space.', cursorIndex: 0 },
          { key: 'c', description: 'Continue typing.', cursorIndex: 0 },
          { key: 'o', description: 'Continue typing.', cursorIndex: 0 },
          { key: 'n', description: 'Continue typing.', cursorIndex: 0 },
          { key: 'f', description: 'Continue typing.', cursorIndex: 0 },
          { key: 'i', description: 'Continue typing.', cursorIndex: 0 },
          { key: 'g', description: 'Continue typing.', cursorIndex: 0 },
          { key: ' ', description: 'Type a space.', cursorIndex: 0 },
          { key: 's', description: 'Continue typing.', cursorIndex: 0 },
          { key: 't', description: 'Continue typing.', cursorIndex: 0 },
          { key: 'a', description: 'Continue typing.', cursorIndex: 0 },
          { key: 'r', description: 'Continue typing.', cursorIndex: 0 },
          { key: 't', description: 'Finish the clearer message.', cursorIndex: 0 },
          { key: 'Escape', description: 'Escape: return to Normal mode before saving or editing more.', cursorIndex: 0 }
        ]
      }
    },
    {
      type: 'markdown',
      content: `## Small habit, large payoff

Try vi mode in your shell for one week. Even if you keep using your normal editor, command-line editing becomes less fragile once \`0\`, \`$\`, \`w\`, \`b\`, and \`ci"\` are available.`
    }
  ]
};
