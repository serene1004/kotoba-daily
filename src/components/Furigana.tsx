import { useEffect, useState } from 'react';

type Part = {
  id: string;
  text: string;
  reading?: string;
};

type KanjiData = {
  kun_readings: string[];
  on_readings: string[];
};

const kana = /^[\u3041-\u3096\u309d-\u309e\u30a1-\u30fa\u30fc]+$/u;
const kanji = /^[\u3400-\u4dbf\u4e00-\u9fff\u3005\u3006]+$/u;
const readingCache = new Map<string, Promise<string[]>>();

const toHiragana = (value: string) =>
  value.replace(/[\u30a1-\u30f6]/g, (character) =>
    String.fromCharCode(character.charCodeAt(0) - 0x60),
  );

const splitByKana = (expression: string) => {
  const chunks: string[] = [];

  [...expression].forEach((character) => {
    const previous = chunks.at(-1);

    if (previous && kana.test(previous) === kana.test(character)) {
      chunks[chunks.length - 1] += character;
    } else {
      chunks.push(character);
    }
  });

  return chunks;
};

function getParts(expression: string, reading: string): Part[] {
  const normalizedReading = toHiragana(reading);
  const chunks = splitByKana(expression);
  let cursor = 0;

  return chunks.map((chunk, index) => {
    if (kana.test(chunk)) {
      const position = normalizedReading.indexOf(toHiragana(chunk), cursor);
      cursor = position === -1 ? cursor : position + chunk.length;
      return { id: `${index}-${chunk}`, text: chunk };
    }

    const followingKana = chunks.slice(index + 1).find((value) => kana.test(value));
    const end = followingKana
      ? normalizedReading.indexOf(toHiragana(followingKana), cursor)
      : reading.length;
    const ruby = reading.slice(cursor, end === -1 ? reading.length : end);
    cursor += ruby.length;

    return { id: `${index}-${chunk}`, text: chunk, reading: ruby || undefined };
  });
}

function getReadings(character: string) {
  if (!readingCache.has(character)) {
    readingCache.set(
      character,
      fetch(`https://kanjiapi.dev/v1/kanji/${encodeURIComponent(character)}`)
        .then((response) => (response.ok ? response.json() : Promise.reject(response.status)))
        .then((data: KanjiData) =>
          [...data.kun_readings, ...data.on_readings]
            .map((value) => toHiragana(value.split('.')[0]))
            .filter(Boolean),
        )
        .catch(() => []),
    );
  }

  return readingCache.get(character) as Promise<string[]>;
}

function matchReadings(
  reading: string,
  candidates: string[][],
  index = 0,
  offset = 0,
): string[] | null {
  if (index === candidates.length) {
    return offset === reading.length ? [] : null;
  }

  return candidates[index].reduce<string[] | null>((match, candidate) => {
    if (match || !reading.startsWith(candidate, offset)) {
      return match;
    }

    const following = matchReadings(reading, candidates, index + 1, offset + candidate.length);
    return following ? [candidate, ...following] : null;
  }, null);
}

async function splitKanjiPart(part: Part) {
  if (!part.reading || !kanji.test(part.text) || [...part.text].length < 2) {
    return [part];
  }

  const characters = [...part.text];
  const candidates = await Promise.all(characters.map(getReadings));
  const readings = matchReadings(toHiragana(part.reading), candidates);

  return readings
    ? characters.map((character, index) => ({
        id: `${part.id}-${character}-${index}`,
        text: character,
        reading: readings[index],
      }))
    : [part];
}

function getSegmentedParts(expression: string, reading: string) {
  return Promise.all(getParts(expression, reading).map(splitKanjiPart)).then((parts) =>
    parts.flat(),
  );
}

export function Furigana({
  expression,
  reading,
  show = true,
}: {
  expression: string;
  reading: string;
  show?: boolean;
}) {
  const [parts, setParts] = useState(() => getParts(expression, reading));

  useEffect(() => {
    let current = true;
    setParts(getParts(expression, reading));

    if (show) {
      getSegmentedParts(expression, reading).then((nextParts) => {
        if (current) {
          setParts(nextParts);
        }
      });
    }

    return () => {
      current = false;
    };
  }, [expression, reading, show]);

  return (
    <span className={show ? undefined : 'furigana-hidden'} aria-label={`${expression}, ${reading}`}>
      {parts.map((part) =>
        part.reading ? (
          <ruby key={part.id}>
            {part.text}
            <rt>{part.reading}</rt>
          </ruby>
        ) : (
          <span key={part.id}>{part.text}</span>
        ),
      )}
    </span>
  );
}
