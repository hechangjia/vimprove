import type { Lesson } from '@/core/types';

export const vimgolfIntro: Lesson = {
  slug: 'vimgolf-intro',
  title: 'VimGolf: Introduction',
  categoryId: 'chapter15',
  shortDescription: 'Learn the rules and mindset of VimGolf challenges',
  contentBlocks: [
    {
      type: 'markdown',
      content: `## What is VimGolf?

[VimGolf](https://www.vimgolf.com/) is a community-driven game where players compete to transform a given piece of text using the **fewest keystrokes**.

**Rules:**
- You start with an **initial text** and a **target text**
- Your goal: transform the initial text into the target text
- You score based on **number of keystrokes** (fewer = better)
- The community's best solutions are shown on the leaderboard

**Why practice VimGolf?**
- Forces you to think about efficiency
- Exposes you to commands you might not use daily
- Builds muscle memory for real editing scenarios

In this chapter, we've curated 10 classic VimGolf-style challenges adapted for the Vimprove editor. Each challenge shows the optimal keystroke count so you can compare your solution.`
    },
    {
      type: 'key-list',
      keys: [
        { chars: ['VimGolf'], desc: 'Community-driven keystroke optimization game' },
        { chars: ['Optimal'], desc: 'The fewest keystrokes needed to solve a challenge' },
        { chars: ['Compare'], desc: 'Check your keystroke count against the optimal solution' }
      ]
    }
  ]
};

export const vimgolfBasicEditing: Lesson = {
  slug: 'vimgolf-basic-editing',
  title: 'VimGolf: Basic Editing',
  categoryId: 'chapter15',
  shortDescription: 'Three classic VimGolf challenges for basic text editing',
  contentBlocks: [
    {
      type: 'markdown',
      content: `## Challenge 1: Add Quotes

**Start:** Lines without quotes
**Target:** Each line wrapped in double quotes

Optimal: **9 keystrokes** — \`I"<Esc>A"<Esc>jj.\`

[View on VimGolf](https://www.vimgolf.com/)`
    },
    {
      type: 'challenge',
      config: {
        initialBuffer: ['foo', 'bar', 'baz'],
        initialCursor: { line: 0, col: 0 },
        enabledCommands: ['i','a','I','A','o','O','h','j','k','l','w','b','e','0','$','x','s','r','d','c','y','p','P','u','.','Escape','Enter','Backspace'],
        goals: [
          { id: 'g1', type: 'custom', description: 'Wrap each line in double quotes',
            validator: (_prev, next) => next.buffer.every((l: string) => l.startsWith('"') && l.endsWith('"')) }
        ],
        goalsRequired: 1
      }
    },
    {
      type: 'markdown',
      content: `## Challenge 2: Delete Empty Lines

**Start:** Lines with empty gaps
**Target:** No empty lines

Optimal: **8 keystrokes** — \`:g/^$/d<Enter>\``
    },
    {
      type: 'challenge',
      config: {
        initialBuffer: ['foo', '', 'bar', '', 'baz'],
        initialCursor: { line: 0, col: 0 },
        enabledCommands: ['i','a','I','A','o','O','h','j','k','l','w','b','e','0','$','x','s','r','d','c','y','p','P','u','.','Escape','Enter','Backspace','/','?','n','N',':'],
        goals: [
          { id: 'g1', type: 'custom', description: 'Remove all empty lines',
            validator: (_prev, next) => next.buffer.length === 3 && next.buffer.every((l: string) => l.length > 0) }
        ],
        goalsRequired: 1
      }
    },
    {
      type: 'markdown',
      content: `## Challenge 3: Swap Two Words

**Start:** Two words in wrong order
**Target:** Words swapped

Optimal: **4 keystrokes** — \`dwwP\` or \`dewp\``
    },
    {
      type: 'challenge',
      config: {
        initialBuffer: ['hello world'],
        initialCursor: { line: 0, col: 0 },
        enabledCommands: ['i','a','I','A','o','O','h','j','k','l','w','b','e','0','$','x','s','r','d','c','y','p','P','u','.','Escape','Enter','Backspace'],
        goals: [
          { id: 'g1', type: 'custom', description: 'Swap words so "world" comes before "hello"',
            validator: (_prev, next) => next.buffer[0] === 'world hello' }
        ],
        goalsRequired: 1
      }
    }
  ]
};

export const vimgolfTextObjects: Lesson = {
  slug: 'vimgolf-text-objects',
  title: 'VimGolf: Text Objects',
  categoryId: 'chapter15',
  shortDescription: 'Precision editing with text objects',
  contentBlocks: [
    {
      type: 'markdown',
      content: `## Challenge 4: Change Function Arguments

**Start:** Old function arguments
**Target:** New arguments inside same parentheses

Optimal: **12 keystrokes** — \`ci(qux, quux<Esc>\``
    },
    {
      type: 'challenge',
      config: {
        initialBuffer: ['foo(bar, baz)'],
        initialCursor: { line: 0, col: 5 },
        enabledCommands: ['i','a','I','A','o','O','h','j','k','l','w','b','e','0','$','x','s','r','d','c','y','p','P','u','.','Escape','Enter','Backspace'],
        goals: [
          { id: 'g1', type: 'custom', description: 'Change arguments to "qux, quux"',
            validator: (_prev, next) => next.buffer[0] === 'foo(qux, quux)' }
        ],
        goalsRequired: 1
      }
    },
    {
      type: 'markdown',
      content: `## Challenge 5: Delete Inside Brackets

**Start:** Content inside square brackets
**Target:** Empty brackets

Optimal: **3 keystrokes** — \`di[\``
    },
    {
      type: 'challenge',
      config: {
        initialBuffer: ['[foo, bar, baz]'],
        initialCursor: { line: 0, col: 3 },
        enabledCommands: ['i','a','I','A','o','O','h','j','k','l','w','b','e','0','$','x','s','r','d','c','y','p','P','u','.','Escape','Enter','Backspace'],
        goals: [
          { id: 'g1', type: 'custom', description: 'Delete everything inside the brackets',
            validator: (_prev, next) => next.buffer[0] === '[]' }
        ],
        goalsRequired: 1
      }
    },
    {
      type: 'markdown',
      content: `## Challenge 6: Wrap Text in Quotes

**Start:** Unquoted word inside function call
**Target:** Word wrapped in double quotes

Optimal: **5 keystrokes** — \`ciw"<Esc>p\``
    },
    {
      type: 'challenge',
      config: {
        initialBuffer: ['log(message)'],
        initialCursor: { line: 0, col: 5 },
        enabledCommands: ['i','a','I','A','o','O','h','j','k','l','w','b','e','0','$','x','s','r','d','c','y','p','P','u','.','Escape','Enter','Backspace'],
        goals: [
          { id: 'g1', type: 'custom', description: 'Wrap "message" in double quotes',
            validator: (_prev, next) => next.buffer[0] === 'log("message")' }
        ],
        goalsRequired: 1
      }
    }
  ]
};

export const vimgolfMacros: Lesson = {
  slug: 'vimgolf-macros',
  title: 'VimGolf: Macros',
  categoryId: 'chapter15',
  shortDescription: 'Use macros to solve repetitive editing challenges',
  contentBlocks: [
    {
      type: 'markdown',
      content: `## Challenge 7: Format List Items

**Start:** Plain words, one per line
**Target:** Bullet list with "- " prefix

Optimal: **10 keystrokes** — \`qqI- <Esc>jq2@q\`

**Hint:** Record a macro on the first line (\`qq\`), apply the change, move down, stop recording (\`q\`), then replay twice (\`2@q\`).`
    },
    {
      type: 'challenge',
      config: {
        initialBuffer: ['foo', 'bar', 'baz'],
        initialCursor: { line: 0, col: 0 },
        enabledCommands: ['i','a','I','A','o','O','h','j','k','l','w','b','e','0','$','x','s','r','d','c','y','p','P','u','.','@','Escape','Enter','Backspace'],
        goals: [
          { id: 'g1', type: 'custom', description: 'Add "- " prefix to each line',
            validator: (_prev, next) => next.buffer.every((l: string) => l.startsWith('- ')) }
        ],
        goalsRequired: 1
      }
    },
    {
      type: 'markdown',
      content: `## Challenge 8: Add Line Numbers

**Start:** Three unnumbered lines
**Target:** Lines prefixed with "1. ", "2. ", "3. "

Optimal: **~12 keystrokes** — Use a macro with incrementing or type manually

> **Note:** Real VimGolf would use \`<C-a>\` to increment, but our editor supports manual numbering. Try using a macro!`
    },
    {
      type: 'challenge',
      config: {
        initialBuffer: ['First item', 'Second item', 'Third item'],
        initialCursor: { line: 0, col: 0 },
        enabledCommands: ['i','a','I','A','o','O','h','j','k','l','w','b','e','0','$','x','s','r','d','c','y','p','P','u','.','@','Escape','Enter','Backspace'],
        goals: [
          { id: 'g1', type: 'custom', description: 'Add "1. ", "2. ", "3. " prefix to each line',
            validator: (_prev, next) => next.buffer[0].startsWith('1. ') && next.buffer[1].startsWith('2. ') && next.buffer[2].startsWith('3. ') }
        ],
        goalsRequired: 1
      }
    }
  ]
};

export const vimgolfAdvanced: Lesson = {
  slug: 'vimgolf-advanced',
  title: 'VimGolf: Advanced',
  categoryId: 'chapter15',
  shortDescription: 'Put it all together with advanced challenges',
  contentBlocks: [
    {
      type: 'markdown',
      content: `## Challenge 9: Reformat JSON

**Start:** Compact single-line JSON
**Target:** Multi-line formatted JSON

Optimal: **~20 keystrokes** — Break the line, add indentation, reformat

**Hint:** Use \`f{\` to find the brace, then \`a<Enter>\` to split, then indent with \`>>\` or manual spacing.`
    },
    {
      type: 'challenge',
      config: {
        initialBuffer: ['{"key":"value","count":42}'],
        initialCursor: { line: 0, col: 0 },
        enabledCommands: ['i','a','I','A','o','O','h','j','k','l','w','b','e','0','$','f','F','t','T',';',',','x','s','r','d','c','y','p','P','u','.','>>','<<','Escape','Enter','Backspace','/','?','n','N',':','v','V'],
        goals: [
          { id: 'g1', type: 'custom', description: 'Reformat to multi-line JSON with 2-space indent',
            validator: (_prev, next) => {
              return next.buffer.length >= 3 &&
                next.buffer.some((l: string) => l.includes('  "key"')) &&
                next.buffer.some((l: string) => l.includes('  "count"'));
            } }
        ],
        goalsRequired: 1
      }
    },
    {
      type: 'markdown',
      content: `## Challenge 10: Extract Function Names

**Start:** JavaScript function declarations
**Target:** Just the function names, one per line

Optimal: **~15 keystrokes** — Use \`/function\` + \`w\` + yank/paste or manual editing`
    },
    {
      type: 'challenge',
      config: {
        initialBuffer: ['function getUserData() {', 'function setUserData() {', 'function deleteUser() {'],
        initialCursor: { line: 0, col: 0 },
        enabledCommands: ['i','a','I','A','o','O','h','j','k','l','w','b','e','0','$','x','s','r','d','c','y','p','P','u','.','f','F','t','T',';',',','Escape','Enter','Backspace','/','?','n','N',':','v','V'],
        goals: [
          { id: 'g1', type: 'custom', description: 'Extract just the function names (getUserData, setUserData, deleteUser)',
            validator: (_prev, next) => {
              return next.buffer.length === 3 &&
                next.buffer[0] === 'getUserData' &&
                next.buffer[1] === 'setUserData' &&
                next.buffer[2] === 'deleteUser';
            } }
        ],
        goalsRequired: 1
      }
    },
    {
      type: 'markdown',
      content: `## Congratulations!

You've completed all 10 VimGolf challenges! Compare your solutions with the optimal keystroke counts.

**Want more?** Visit [vimgolf.com](https://www.vimgolf.com/) for hundreds more challenges from the community.

**Key takeaways:**
- Think before you type — the shortest path isn't always obvious
- Text objects (\`ci(\`, \`di"\`) are often faster than manual selection
- Macros shine for repetitive tasks
- The \`.\` command is your best friend for repeated edits`
    }
  ]
};