import type { Word, WordProgress } from '../types';

const STORAGE_PREFIX = 'kotoba-daily:v1:';
const storageKey = (key: string) => `${STORAGE_PREFIX}${key}`;

export const readStorage = <T>(key: string, fallback: T): T => {
  try {
    const stored = localStorage.getItem(storageKey(key)) ?? localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch {
    return fallback;
  }
};

export const writeStorage = (key: string, value: unknown) => {
  try {
    localStorage.setItem(storageKey(key), JSON.stringify(value));
  } catch {
    // Storage can be unavailable in private browsing or a restricted context.
  }
};

export const readProgressByDate = (level?: 'N5' | 'N4' | 'N3') => {
  const studiedByLevelDate = new Map<string, { level: string; date: string; count: number; namespaced: boolean }>();
  const progressByLevelDate = new Map<string, { level: string; date: string; count: number; namespaced: boolean }>();

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key) continue;

    const namespaced = key.startsWith(STORAGE_PREFIX);
    const appKey = namespaced ? key.slice(STORAGE_PREFIX.length) : key;
    const [kind, maybeLevel, maybeDate] = appKey.split(':');
    if (kind !== 'studied' && kind !== 'progress') continue;

    const hasLevel = maybeLevel === 'N5' || maybeLevel === 'N4' || maybeLevel === 'N3';
    const itemLevel = hasLevel ? maybeLevel : 'N5';
    const date = hasLevel ? maybeDate : maybeLevel;
    if (!date) continue;

    const entries = kind === 'studied' ? studiedByLevelDate : progressByLevelDate;
    const itemKey = `${itemLevel}:${date}`;
    const existing = entries.get(itemKey);
    if (!existing || (namespaced && !existing.namespaced)) {
      entries.set(itemKey, {
        level: itemLevel,
        date,
        count: Number(localStorage.getItem(key)) || 0,
        namespaced,
      });
    }
  }

  const result: Record<string, number> = {};
  for (const entry of progressByLevelDate.values()) {
    if (level && entry.level !== level) continue;
    if (studiedByLevelDate.has(`${entry.level}:${entry.date}`)) continue;
    result[entry.date] = (result[entry.date] || 0) + entry.count;
  }
  for (const entry of studiedByLevelDate.values()) {
    if (!level || entry.level === level) {
      result[entry.date] = (result[entry.date] || 0) + entry.count;
    }
  }

  return result;
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
