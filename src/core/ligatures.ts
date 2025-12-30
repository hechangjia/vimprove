export type LigatureRange = { start: number; end: number };

const LIGATURE_SEQUENCES = [
  // Common programming ligatures (Fira Code, JetBrains Mono, etc.)
  '!==',
  '===',
  '==',
  '!=',
  '>=',
  '<=',
  '=>',
  '->',
  '<<=',
  '>>=',
  '<<<',
  '>>>',
  '<<',
  '>>',
  '&&',
  '||',
  '??=',
  '??',
  '?.',
  '++',
  '--',
  '**',
  '::',
  '/*',
  '*/',
  '//',
  '...',
];

const SORTED_SEQUENCES = [...LIGATURE_SEQUENCES].sort((a, b) => b.length - a.length);

export const getLigatureRange = (line: string, cursorCol: number): LigatureRange | null => {
  if (cursorCol < 0 || cursorCol >= line.length) return null;

  for (const seq of SORTED_SEQUENCES) {
    let idx = line.indexOf(seq);
    while (idx !== -1) {
      if (cursorCol >= idx && cursorCol < idx + seq.length) {
        return { start: idx, end: idx + seq.length - 1 };
      }
      idx = line.indexOf(seq, idx + 1);
    }
  }

  return null;
};

