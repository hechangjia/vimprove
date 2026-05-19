import type { Lesson } from '@/core/types';

export const motionsFileBounds: Lesson = {
  slug: 'motions-file-bounds',
  title: 'File Bounds: gg, G, {N}G',
  categoryId: 'chapter1',
  shortDescription: 'Jump to the top, bottom, or any line by number.',
  contentBlocks: [
    {
      type: 'markdown',
      content: `## Jump anywhere in the file

So far you moved one line at a time with **j** / **k**. For long files, that's too slow.

- **gg** → jump to the **first line** (and first non-blank column).
- **G** → jump to the **last line**.
- **{N}G** → jump to **line N** (1-based). Example: \`5G\` lands on line 5.

These three keys are the most reused motions in real editing. Memorize them.`
    },
    {
      type: 'markdown',
      content: `## Example: gg / G / 5G

Watch the cursor jump from the middle of the file to line 0, then last line, then line 5.`
    },
    {
      type: 'run-example',
      config: {
        initialBuffer: [
          '// file: example.ts',
          'function alpha() {',
          '  return 1;',
          '}',
          '',
          'function beta() {',
          '  return 2;',
          '}',
          '',
          'export { alpha, beta };'
        ],
        initialCursor: { line: 5, col: 0 },
        autoPlaySpeed: 900,
        tracks: [{ label: 'gg / G / 5G', keys: [] }],
        steps: [
          { key: 'g', description: 'g: first half of gg, waits for the next g.', cursorIndex: 0 },
          { key: 'g', description: 'g: completes gg, jumps to line 0.', cursorIndex: 0 },
          { key: 'G', description: 'G: jump to the last line.', cursorIndex: 0 },
          { key: '5', description: '5: count prefix for the next motion.', cursorIndex: 0 },
          { key: 'G', description: '5G: jump to line 5 (1-based).', cursorIndex: 0 }
        ]
      }
    },
    {
      type: 'key-list',
      keys: [
        { chars: ['g', 'g'], desc: 'Go to first line (top of buffer)' },
        { chars: ['G'], desc: 'Go to last line (bottom of buffer)' },
        { chars: ['{N}', 'G'], desc: 'Go to line N (e.g., 5G)' }
      ]
    },
    {
      type: 'challenge',
      config: {
        initialBuffer: [
          'line 1',
          'line 2',
          'line 3',
          'line 4',
          'line 5',
          'line 6',
          'line 7'
        ],
        initialCursor: { line: 3, col: 0 },
        goalsRequired: 3,
        enabledCommands: ['g', 'G', 'h', 'j', 'k', 'l', '0', '$', '1', '2', '3', '4', '5', '6', '7'],
        goals: [
          {
            id: 'top',
            type: 'move',
            description: 'Use gg to jump to line 1.',
            validator: (_p, next) => next.cursor.line === 0
          },
          {
            id: 'bottom',
            type: 'move',
            description: 'Use G to jump to the last line.',
            validator: (_p, next) => next.cursor.line === 6
          },
          {
            id: 'line5',
            type: 'move',
            description: 'Use 5G to jump to line 5 (the line that says "line 5").',
            validator: (_p, next, last) =>
              next.cursor.line === 4 && last?.motion === 'G'
          }
        ]
      }
    }
  ]
};
