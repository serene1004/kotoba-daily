const kanjiPattern = /[\u3400-\u4dbf\u4e00-\u9fff々〆ヵヶ]/u;

function FuriganaPart({
  expression,
  reading,
  show,
}: {
  expression: string;
  reading: string;
  show: boolean;
}) {
  if (!kanjiPattern.test(expression)) return <span>{expression}</span>;

  const prefix = expression.match(/^[ぁ-ゖー～〜]+/u)?.[0] ?? '';
  const suffix = expression.match(/[ぁ-ゖー～〜]+$/u)?.[0] ?? '';
  const kanji = expression.slice(prefix.length, suffix ? -suffix.length : undefined);
  const readingMatchesKana = reading.startsWith(prefix) && reading.endsWith(suffix);

  if (
    !/[;；]/u.test(reading) &&
    /^[\u3400-\u4dbf\u4e00-\u9fff々〆ヵヶ]+$/u.test(kanji) &&
    readingMatchesKana
  ) {
    const kanjiReading = reading.slice(prefix.length, suffix ? -suffix.length : undefined);
    return (
      <span>
        {prefix}
        <ruby className={`furigana ${show ? '' : 'furigana-hidden'}`}>
          {kanji}
          <rt>{kanjiReading}</rt>
        </ruby>
        {suffix}
      </span>
    );
  }

  return (
    <ruby className={`furigana ${show ? '' : 'furigana-hidden'}`}>
      {expression}
      <rt>{reading}</rt>
    </ruby>
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
  const expressions = expression.split(/[;；]/u).map((part) => part.trim());
  const readings = reading.split(/[;；]/u).map((part) => part.trim());
  const readingsMatch = readings.length === expressions.length;
  const sharedReading = readings.length === 1 ? readings[0] : reading;
  if (expressions.length > 1 && readings.length > 1 && !readingsMatch) {
    return (
      <span aria-label={`${expression}, ${reading}`}>
        <FuriganaPart expression={expression} reading={reading} show={show} />
      </span>
    );
  }

  return (
    <span aria-label={`${expression}, ${reading}`}>
      {expressions.map((part, index) => (
        <span key={part}>
          {index > 0 && '; '}
          <FuriganaPart
            expression={part}
            reading={readingsMatch ? readings[index] : sharedReading}
            show={show}
          />
        </span>
      ))}
    </span>
  );
}
