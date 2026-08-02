import { useEffect, useState } from 'react';
import type { Word } from '../types';

const sourceUrl =
  'https://raw.githubusercontent.com/elzup/jlpt-word-list/refs/heads/master/src/n5.csv';
const split = (line: string) => {
  const cells: string[] = [];
  let cell = '';
  let quoted = false;
  for (const character of line) {
    if (character === '"') quoted = !quoted;
    else if (character === ',' && !quoted) {
      cells.push(cell);
      cell = '';
    } else cell += character;
  }
  return [...cells, cell];
};
export function useVocabulary() {
  const [words, setWords] = useState<Word[]>([]);
  useEffect(() => {
    fetch(sourceUrl)
      .then((response) => response.text())
      .then((csv) =>
        setWords(
          csv
            .split(/\r?\n/)
            .slice(1)
            .map(split)
            .filter((row) => row.length >= 3)
            .map(([jp, reading, meaning]) => ({ id: `${jp}-${reading}`, jp, reading, meaning })),
        ),
      );
  }, []);
  return words;
}
