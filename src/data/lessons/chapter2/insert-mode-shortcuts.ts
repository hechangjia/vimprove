import type { Lesson } from '@/core/types';

export const insertModeShortcuts: Lesson = {
  slug: 'insert-mode-shortcuts',
  title: 'Insert Mode Shortcuts',
  categoryId: 'chapter2',
  shortDescription: 'Edit efficiently without leaving Insert mode',
  contentBlocks: [
    {
      type: 'markdown',
      content: `## Editing in Insert Mode

You don't always need to return to Normal mode to fix mistakes. Vim provides several shortcuts that work **while you're still in Insert mode**.

These shortcuts help you maintain your flow when typing:

- **Ctrl-w** – delete the word before the cursor
- **Ctrl-u** – delete everything from cursor to line start
- **Ctrl-t** – increase indent (add 2 spaces at line start)
- **Ctrl-d** – decrease indent (remove up to 2 spaces from line start)

Think of them as "quick fixes without breaking your typing rhythm."`
    },
    {
      type: 'markdown',
      content: `## When to use each shortcut

**Use Ctrl-w** when you just typed a wrong word:
- You type: \`const foobar = ...\` but meant \`const foo = ...\`
- Press **Ctrl-w** to delete \`foobar\` and type \`foo\` instead

**Use Ctrl-u** when you need to restart the line:
- You type: \`let x = calculateSomething();\` but realize it should be \`const\`
- Press **Ctrl-u** to clear the line and start over

**Use Ctrl-t / Ctrl-d** when you need to adjust indentation:
- You're typing a nested block and realize it needs more/less indent
- Press **Ctrl-t** to indent or **Ctrl-d** to dedent without leaving Insert mode`
    },
    {
      type: 'markdown',
      content: `## Example: fixing typos while typing

We'll demonstrate how to use these shortcuts to fix mistakes without leaving Insert mode:

- Start typing a line with a typo
- Use **Ctrl-w** to delete the wrong word
- Continue typing the correct word
- Use **Ctrl-t** to adjust indentation

This shows how Insert mode shortcuts keep you in flow.`
    },
    {
      type: 'run-example',
      config: {
        initialBuffer: [''],
        initialCursor: { line: 0, col: 0 },
        autoPlaySpeed: 800,
        tracks: [
          { label: 'Insert mode shortcuts', keys: [] }
        ],
        steps: [
          { key: 'i', description: 'i: enter Insert mode', cursorIndex: 0 },
          { key: 'c', description: 'Type "const wrongname = 42;"', cursorIndex: 0 },
          { key: 'o', description: '', cursorIndex: 0 },
          { key: 'n', description: '', cursorIndex: 0 },
          { key: 's', description: '', cursorIndex: 0 },
          { key: 't', description: '', cursorIndex: 0 },
          { key: ' ', description: '', cursorIndex: 0 },
          { key: 'w', description: '', cursorIndex: 0 },
          { key: 'r', description: '', cursorIndex: 0 },
          { key: 'o', description: '', cursorIndex: 0 },
          { key: 'n', description: '', cursorIndex: 0 },
          { key: 'g', description: '', cursorIndex: 0 },
          { key: 'n', description: '', cursorIndex: 0 },
          { key: 'a', description: '', cursorIndex: 0 },
          { key: 'm', description: '', cursorIndex: 0 },
          { key: 'e', description: '', cursorIndex: 0 },
          { key: ' ', description: '', cursorIndex: 0 },
          { key: '=', description: '', cursorIndex: 0 },
          { key: ' ', description: '', cursorIndex: 0 },
          { key: '4', description: '', cursorIndex: 0 },
          { key: '2', description: '', cursorIndex: 0 },
          { key: ';', description: '', cursorIndex: 0 },
          { key: 'w', description: 'Ctrl-w: delete "wrongname" backward', cursorIndex: 0, ctrlKey: true },
          { key: 'v', description: 'Type "value" to fix the variable name', cursorIndex: 0 },
          { key: 'a', description: '', cursorIndex: 0 },
          { key: 'l', description: '', cursorIndex: 0 },
          { key: 'u', description: '', cursorIndex: 0 },
          { key: 'e', description: '', cursorIndex: 0 },
          { key: 'Enter', description: 'Enter: create new line', cursorIndex: 0 },
          { key: 'c', description: 'Type "console.log(value);"', cursorIndex: 0 },
          { key: 'o', description: '', cursorIndex: 0 },
          { key: 'n', description: '', cursorIndex: 0 },
          { key: 's', description: '', cursorIndex: 0 },
          { key: 'o', description: '', cursorIndex: 0 },
          { key: 'l', description: '', cursorIndex: 0 },
          { key: 'e', description: '', cursorIndex: 0 },
          { key: '.', description: '', cursorIndex: 0 },
          { key: 'l', description: '', cursorIndex: 0 },
          { key: 'o', description: '', cursorIndex: 0 },
          { key: 'g', description: '', cursorIndex: 0 },
          { key: '(', description: '', cursorIndex: 0 },
          { key: 'v', description: '', cursorIndex: 0 },
          { key: 'a', description: '', cursorIndex: 0 },
          { key: 'l', description: '', cursorIndex: 0 },
          { key: 'u', description: '', cursorIndex: 0 },
          { key: 'e', description: '', cursorIndex: 0 },
          { key: ')', description: '', cursorIndex: 0 },
          { key: ';', description: '', cursorIndex: 0 },
          { key: 't', description: 'Ctrl-t: increase indent', cursorIndex: 0, ctrlKey: true },
          { key: 'Escape', description: 'Escape: exit Insert mode', cursorIndex: 0 }
        ]
      }
    },
    {
      type: 'key-list',
      keys: [
        { chars: ['Ctrl-w'], desc: 'Delete word backward (in Insert mode)' },
        { chars: ['Ctrl-u'], desc: 'Delete to line start (in Insert mode)' },
        { chars: ['Ctrl-t'], desc: 'Increase indent (in Insert mode)' },
        { chars: ['Ctrl-d'], desc: 'Decrease indent (in Insert mode)' }
      ]
    },
    {
      type: 'markdown',
      content: `## Practice: fix code while typing

Try using these shortcuts to fix mistakes without leaving Insert mode.

**Goal**: Use Insert mode shortcuts to clean up the code efficiently.`
    },
    {
      type: 'challenge',
      config: {
        initialBuffer: ['function greet() {', 'console.log("Hello");', '}'],
        initialCursor: { line: 1, col: 0 },
        enabledCommands: ['i', 'a', 'I', 'A', 'o', 'O', 'h', 'j', 'k', 'l', 'w', 'b', 'e', '0', '$', 'f', 't', 'F', 'T', ';', ',', 'x', 's', 'r', 'd', 'c', 'y', 'p', 'P', 'u', 'v', 'V'],
        goals: [
          {
            id: 'goal-1',
            type: 'custom',
            description: 'Add 2 spaces indent to line 2',
            validator: (_prev, next) => {
              return next.buffer[1] === '  console.log("Hello");';
            }
          },
          {
            id: 'goal-2',
            type: 'custom',
            description: 'Change "Hello" to "World"',
            validator: (_prev, next) => {
              return next.buffer[1].includes('"World"');
            }
          }
        ],
        goalsRequired: 2
      }
    }
  ]
};
