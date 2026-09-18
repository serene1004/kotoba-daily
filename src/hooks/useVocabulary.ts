import { useEffect, useState } from 'react';
import type { Word } from '../types';

export function useVocabulary() {
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/n5.json`)
      .then((response) => {
        if (!response.ok) throw new Error('Vocabulary request failed');
        return response.json() as Promise<Word[]>;
      })
      .then((data) => {
        setWords(data);
        setError(false);
      })
      .catch(() => {
        setWords([]);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, []);
  return { words, loading, error };
}
