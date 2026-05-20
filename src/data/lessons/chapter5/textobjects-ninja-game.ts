import type { Lesson } from '@/core/types';

export const textobjectsNinjaGame: Lesson = {
  slug: 'textobjects-ninja-game',
  title: 'Text Object Ninja',
  categoryId: 'chapter5',
  shortDescription: 'Master text object selection with this interactive game',
  contentBlocks: [
    {
      type: 'markdown',
      content: `## Text Object Ninja

Time to put your text object skills to the test! This game challenges you to select specific parts of code using the most efficient Vim commands.

**How to play:**
- Look at the highlighted target in the code
- Type the Vim command to select exactly that target
- Use visual mode + text objects (like \`viw\`, \`vi"\`, \`vi{\`)
- Try to match the optimal command for maximum efficiency!

**Tips:**
- \`v\` enters visual mode
- \`i\` means "inside" (excludes delimiters)
- \`a\` means "around" (includes delimiters)
- Combine with \`w\` (word), \`(\` (parentheses), \`{\` (braces), \`"\` (quotes), etc.`
    },
    {
      type: 'text-object-ninja',
      config: {
        targetScore: 5
      }
    },
    {
      type: 'markdown',
      content: `## Keep Practicing

Text objects are one of Vim's most powerful features. The more you practice, the more natural they'll become.

**Next steps:**
- Try using text objects with operators (\`d\`, \`c\`, \`y\`)
- Experiment with different text objects in your daily editing
- Remember: \`i\` for inside, \`a\` for around!`
    }
  ]
};
