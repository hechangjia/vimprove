import type { KeyHistory } from '@/core/keyHistory.types';

export type CommandSuggestion = {
  id: string;
  messageKey: string;
  fallback: string;
};

export const getCommandSuggestion = (history: KeyHistory): CommandSuggestion | null => {
  const keys = history.flatMap(group => group.keys.map(key => key.rawKey));
  const tail = keys.slice(-8);
  const directions = ['h', 'j', 'k', 'l'];

  for (const direction of directions) {
    const streak = [...tail].reverse().findIndex(key => key !== direction);
    const count = streak === -1 ? tail.length : streak;
    if (count >= 5) {
      return {
        id: `repeat-${direction}`,
        messageKey: 'suggestions.repeatedMotion',
        fallback: `You used ${direction} ${count} times in a row. Next time, try a count like ${count}${direction}.`
      };
    }
  }

  return null;
};
