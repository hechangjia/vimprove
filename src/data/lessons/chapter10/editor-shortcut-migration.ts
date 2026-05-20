import type { Lesson } from '@/core/types';

export const editorShortcutMigration: Lesson = {
  slug: 'editor-shortcut-migration',
  title: 'Translate editor shortcuts into Vim moves',
  categoryId: 'chapter10',
  shortDescription: 'Build a bridge from familiar editor shortcuts to composable Vim commands.',
  contentBlocks: [
    {
      type: 'markdown',
      content: `## Do not memorize a giant table

When moving from VSCode, JetBrains, Sublime, or another editor, translate intentions:

| Old habit | Vim habit |
| --- | --- |
| Delete current line | \`dd\` |
| Duplicate current line | \`Yp\` |
| Delete to line end | \`D\` |
| Change to line end | \`C\` |
| Select word then type | \`ciw\` |
| Find next match | \`/pattern\`, then \`n\` |

The important shift is from shortcut names to grammar:

> action + target = command

\`ciw\` is not a magic shortcut. It means: change inside word.`
    },
    {
      type: 'key-list',
      keys: [
        { chars: ['d', 'd'], desc: 'Delete the current line' },
        { chars: ['Y', 'p'], desc: 'Duplicate the current line below' },
        { chars: ['D'], desc: 'Delete from cursor to line end' },
        { chars: ['C'], desc: 'Change from cursor to line end' },
        { chars: ['c', 'i', 'w'], desc: 'Replace the current word' }
      ]
    },
    {
      type: 'run-example',
      config: {
        initialBuffer: [
          'const userName = "Ada";',
          'console.log(userName);'
        ],
        initialCursor: { line: 0, col: 6 },
        autoPlaySpeed: 850,
        language: 'javascript',
        tracks: [
          { label: 'Replace a word the Vim way', keys: ['c', 'i', 'w', 'd', 'i', 's', 'p', 'l', 'a', 'y', 'N', 'a', 'm', 'e', 'Escape'] }
        ],
        steps: [
          { key: 'c', description: 'c: begin a change.', cursorIndex: 0 },
          { key: 'i', description: 'i: choose inside.', cursorIndex: 0 },
          { key: 'w', description: 'w: ciw changes the whole word under the cursor.', cursorIndex: 0 },
          { key: 'd', description: 'Type "d".', cursorIndex: 0 },
          { key: 'i', description: 'Type "i".', cursorIndex: 0 },
          { key: 's', description: 'Type "s".', cursorIndex: 0 },
          { key: 'p', description: 'Type "p".', cursorIndex: 0 },
          { key: 'l', description: 'Type "l".', cursorIndex: 0 },
          { key: 'a', description: 'Type "a".', cursorIndex: 0 },
          { key: 'y', description: 'Type "y".', cursorIndex: 0 },
          { key: 'N', description: 'Type "N".', cursorIndex: 0 },
          { key: 'a', description: 'Type "a".', cursorIndex: 0 },
          { key: 'm', description: 'Type "m".', cursorIndex: 0 },
          { key: 'e', description: 'Type "e".', cursorIndex: 0 },
          { key: 'Escape', description: 'Escape: return to Normal mode.', cursorIndex: 0 }
        ]
      }
    },
    {
      type: 'markdown',
      content: `## Migration rule

Keep your old shortcut when it opens a tool. Prefer Vim when the action edits text near the cursor.

That single rule gives you a gradual path instead of a weekend rewrite of every habit.`
    }
  ]
};
