import { useEffect, useState } from 'react';
import type { Word } from '../types';

export function useVocabulary() {
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [failedLevels, setFailedLevels] = useState<('N5' | 'N4' | 'N3')[]>([]);
  useEffect(() => {
    setLoading(true);
    const levels = ['n5', 'n4', 'n3'] as const;
    Promise.all(levels.map(async (level) => {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}data/${level}.json`);
        if (!response.ok) throw new Error('Vocabulary request failed');
        const data: unknown = await response.json();
        if (!Array.isArray(data)) throw new Error('Vocabulary data must be an array');
        return { level: level.toUpperCase() as 'N5' | 'N4' | 'N3', words: data as Word[] };
      } catch {
        return { level: level.toUpperCase() as 'N5' | 'N4' | 'N3', words: [] as Word[], failed: true };
      }
    }))
      .then((results) => {
        setWords(results.flatMap((result) => result.words));
        setFailedLevels(results.filter((result) => 'failed' in result).map((result) => result.level));
      })
      .finally(() => setLoading(false));
  }, []);
  return { words, loading, failedLevels };
}
