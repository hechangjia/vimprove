import type { Lesson } from '@/core/types';

export const substituteCurrentLine: Lesson = {
  slug: 'substitute-current-line',
  title: 'Substitute on the current line',
  categoryId: 'chapter11',
  shortDescription: 'Use :s/old/new/ and :s/old/new/g for quick line-local replacements.',
  contentBlocks: [
    {
      type: 'markdown',
      content: `## :s changes text without moving through every match

The substitute command has a compact shape:

\`\`\`
:s/old/new/
\`\`\`

That replaces the first **old** on the current line.

Add **g** at the end to replace every match on the current line:

\`\`\`
:s/old/new/g
\`\`\`

Use this when a single line has repeated labels, arguments, or words.`
    },
    {
      type: 'run-example',
      config: {
        initialBuffer: ['status status status'],
        initialCursor: { line: 0, col: 0 },
        tracks: [{ label: 'Replace every status on one line', keys: [] }],
        steps: [
          { key: ':', description: 'Open command-line mode.' },
          { key: 's', description: 'Start substitute.' },
          { key: '/', description: 'Separate command and old text.' },
          { key: 's', description: 'Type old text.' },
          { key: 't', description: 'Continue old text.' },
          { key: 'a', description: 'Continue old text.' },
          { key: 't', description: 'Continue old text.' },
          { key: 'u', description: 'Continue old text.' },
          { key: 's', description: 'Continue old text.' },
          { key: '/', description: 'Separate old and new text.' },
          { key: 'r', description: 'Type replacement.' },
          { key: 'e', description: 'Continue replacement.' },
          { key: 'a', description: 'Continue replacement.' },
          { key: 'd', description: 'Continue replacement.' },
          { key: 'y', description: 'Continue replacement.' },
          { key: '/', description: 'Close replacement.' },
          { key: 'g', description: 'Use the global flag for this line.' },
          { key: 'Enter', description: 'Execute the substitute command.' }
        ]
      }
    },
    {
      type: 'challenge',
      config: {
        initialBuffer: ['let color = "blue"; // blue theme'],
        initialCursor: { line: 0, col: 0 },
        goalsRequired: 1,
        enabledCommands: [':', '/', 's', 'b', 'l', 'u', 'e', 'g', 'r', 'n', 'Enter', 'Escape'],
        goals: [
          {
            id: 'replace-blue-with-green',
            type: 'change',
            description: 'Use :s/blue/green/g to replace both blue occurrences on the current line.',
            validator: (_prev, next) =>
              next.buffer[0] === 'let color = "green"; // green theme'
              && next.lastCommand?.type === 'ex'
          }
        ]
      }
    }
  ]
};
