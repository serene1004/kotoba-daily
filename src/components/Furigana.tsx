export function Furigana({
  expression,
  reading,
  show = true,
}: {
  expression: string;
  reading: string;
  show?: boolean;
}) {
  return (
    <ruby className={show ? undefined : 'furigana-hidden'} aria-label={`${expression}, ${reading}`}>
      {expression}
      <rt>{reading}</rt>
    </ruby>
  );
}
