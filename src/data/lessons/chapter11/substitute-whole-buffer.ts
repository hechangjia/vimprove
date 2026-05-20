import type { Lesson } from '@/core/types';

export const substituteWholeBuffer: Lesson = {
  slug: 'substitute-whole-buffer',
  title: 'Substitute across the whole buffer',
  categoryId: 'chapter11',
  shortDescription: 'Use :%s/old/new/g when the same replacement spans multiple lines.',
  contentBlocks: [
    {
      type: 'markdown',
      content: `## % means the whole file

The current-line substitute is careful. The whole-buffer substitute is broad:

\`\`\`
:%s/old/new/g
\`\`\`

Read it as:

- **%** — every line in the file.
- **s** — substitute.
- **old/new** — replace old with new.
- **g** — replace every match on each line.

This is powerful enough to deserve a pause before pressing Enter.`
    },
    {
      type: 'challenge',
      config: {
        initialBuffer: [
          'const debug = true;',
          'debugLog("start");',
          'debugLog("done");'
        ],
        initialCursor: { line: 0, col: 0 },
        goalsRequired: 1,
        enabledCommands: [':', '%', 's', '/', 'd', 'e', 'b', 'u', 'g', 'L', 'o', 't', 'r', 'a', 'c', 'Enter', 'Escape'],
        goals: [
          {
            id: 'replace-debug-log',
            type: 'change',
            description: 'Use :%s/debugLog/trace/g to rename every debugLog call.',
            validator: (_prev, next) => {
              const text = next.buffer.join('\n');
              return !text.includes('debugLog') && text.includes('trace("start")') && text.includes('trace("done")');
            }
          }
        ]
      }
    },
    {
      type: 'key-list',
      keys: [
        { chars: [':%s/old/new/g'], desc: 'Replace every old with new in the whole buffer' },
        { chars: ['u'], desc: 'Undo immediately if the replacement was too broad' },
        { chars: [':s/old/new/g'], desc: 'Use current-line scope when the change should be local' }
      ]
    }
  ]
};
