import type { Lesson } from '@/core/types';

export const realworldRefactorDemo: Lesson = {
  slug: 'realworld-refactor-demo',
  title: 'Real-world refactor demo',
  categoryId: 'chapter10',
  shortDescription: 'Use search, text objects, operators, and repeat as one realistic editing flow.',
  contentBlocks: [
    {
      type: 'markdown',
      content: `## A realistic Vim flow is a chain, not a trick

In real work, Vim commands rarely appear alone. A small refactor might look like:

1. Search for the next place to edit.
2. Use a text object to change exactly the risky part.
3. Repeat the same edit when the next match has the same shape.
4. Undo quickly if the pattern changes.

This is why learning operators, text objects, search, and \`.\` together matters. They turn many tiny edits into a controlled workflow.`
    },
    {
      type: 'key-list',
      keys: [
        { chars: ['/', 'n'], desc: 'Find the next matching call or name' },
        { chars: ['c', 'i', '"'], desc: 'Change text inside quotes' },
        { chars: ['d', 'd'], desc: 'Delete obsolete lines' },
        { chars: ['.'], desc: 'Repeat the last change where the shape matches' },
        { chars: ['u'], desc: 'Undo when the next occurrence is not the same shape' }
      ]
    },
    {
      type: 'run-example',
      config: {
        initialBuffer: [
          'logger.info("loading user");',
          'logger.debug("temporary trace");',
          'logger.info("saving user");'
        ],
        initialCursor: { line: 0, col: 0 },
        autoPlaySpeed: 850,
        language: 'javascript',
        tracks: [
          { label: 'Change log wording and remove noise', keys: ['/', 'l', 'o', 'a', 'd', 'i', 'n', 'g', 'Enter', 'c', 'i', '"', 'f', 'e', 't', 'c', 'h', 'i', 'n', 'g', ' ', 'u', 's', 'e', 'r', 'Escape', 'j', 'd', 'd'] }
        ],
        steps: [
          { key: '/', description: '/: start a search.', cursorIndex: 0 },
          { key: 'l', description: 'Type "l".', cursorIndex: 0 },
          { key: 'o', description: 'Type "o".', cursorIndex: 0 },
          { key: 'a', description: 'Type "a".', cursorIndex: 0 },
          { key: 'd', description: 'Type "d".', cursorIndex: 0 },
          { key: 'i', description: 'Type "i".', cursorIndex: 0 },
          { key: 'n', description: 'Type "n".', cursorIndex: 0 },
          { key: 'g', description: 'Type "g".', cursorIndex: 0 },
          { key: 'Enter', description: 'Enter: jump to the matching word.', cursorIndex: 0 },
          { key: 'c', description: 'c: start changing a text object.', cursorIndex: 0 },
          { key: 'i', description: 'i: choose inside.', cursorIndex: 0 },
          { key: '"', description: '": ci" changes the message inside quotes.', cursorIndex: 0 },
          { key: 'f', description: 'Type the replacement text.', cursorIndex: 0 },
          { key: 'e', description: 'Continue typing.', cursorIndex: 0 },
          { key: 't', description: 'Continue typing.', cursorIndex: 0 },
          { key: 'c', description: 'Continue typing.', cursorIndex: 0 },
          { key: 'h', description: 'Continue typing.', cursorIndex: 0 },
          { key: 'i', description: 'Continue typing.', cursorIndex: 0 },
          { key: 'n', description: 'Continue typing.', cursorIndex: 0 },
          { key: 'g', description: 'Continue typing.', cursorIndex: 0 },
          { key: ' ', description: 'Type a space.', cursorIndex: 0 },
          { key: 'u', description: 'Continue typing.', cursorIndex: 0 },
          { key: 's', description: 'Continue typing.', cursorIndex: 0 },
          { key: 'e', description: 'Continue typing.', cursorIndex: 0 },
          { key: 'r', description: 'Finish the replacement.', cursorIndex: 0 },
          { key: 'Escape', description: 'Escape: return to Normal mode after the edit.', cursorIndex: 0 },
          { key: 'j', description: 'j: move to the temporary debug line.', cursorIndex: 0 },
          { key: 'd', description: 'd: first d of dd.', cursorIndex: 0 },
          { key: 'd', description: 'd: second d removes the noisy line.', cursorIndex: 0 }
        ]
      }
    },
    {
      type: 'markdown',
      content: `## Review the shape before repeating

The dot command is powerful only when the next location has the same shape.

If it does not, use the same ingredients manually: search, move, text object, operator, then repeat again when the pattern becomes stable.`
    }
  ]
};
