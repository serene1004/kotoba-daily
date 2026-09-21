const hasKanji = (value: string) => /[\u3400-\u4dbf\u4e00-\u9fff々〆ヵヶ]/u.test(value);

export function Furigana({
  expression,
  reading,
  show = true,
}: {
  expression: string;
  reading: string;
  show?: boolean;
}) {
  if (!hasKanji(expression)) {
    return <span aria-label={`${expression}, ${reading}`}>{expression}</span>;
  }

  return (
    <ruby className={show ? undefined : 'furigana-hidden'} aria-label={`${expression}, ${reading}`}>
      {expression}
      <rt>{reading}</rt>
    </ruby>
  );
}
