import type { Word, WordProgress } from '../types';

export const readStorage = <T>(key: string, fallback: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch {
    return fallback;
  }
};

export const writeStorage = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be unavailable in private browsing or a restricted context.
  }
};

export const readProgressByDate = () => {
  const progress: Record<string, number> = {};

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (key) {
      if (key.startsWith('studied:')) {
        progress[key.replace('studied:', '')] = Number(localStorage.getItem(key)) || 0;
      } else if (key.startsWith('progress:')) {
        const date = key.replace('progress:', '');
        if (progress[date] === undefined) {
          progress[date] = Number(localStorage.getItem(key)) || 0;
        }
      }
    }
  }

  return progress;
};

const shuffle = <T>(items: T[]) => {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }
  return result;
};

export const addDays = (date: string, days: number) => {
  const next = new Date(`${date}T00:00:00`);
  next.setDate(next.getDate() + days);
  return next.toLocaleDateString('sv-SE');
};

export const reviewDelay = (correctCount: number) => [3, 7, 14][Math.min(correctCount - 1, 2)] || 1;

export const pickQuest = (
  words: Word[],
  known: string[],
  progress: Record<string, WordProgress>,
  seen: string[],
  day: string,
) => {
  const knownIds = new Set(known);
  const reviewSet = new Set(
    words
      .filter(({ id }) => progress[id]?.nextReviewAt && progress[id].nextReviewAt <= day)
      .map(({ id }) => id),
  );
  const seenSet = new Set(seen);
  const reviews = shuffle(
    words.filter((word) => reviewSet.has(word.id) && !seenSet.has(word.id)),
  ).slice(0, 3);
  const fresh = shuffle(
    words.filter(
      (word) => !knownIds.has(word.id) && !reviewSet.has(word.id) && !seenSet.has(word.id),
    ),
  ).slice(0, 7);
  const fallback = shuffle(
    words.filter(
      (word) =>
        !knownIds.has(word.id) &&
        !reviewSet.has(word.id) &&
        !seenSet.has(word.id) &&
        !fresh.includes(word),
    ),
  );

  return [...reviews, ...fresh, ...fallback].slice(0, 10).map((word) => word.id);
};
