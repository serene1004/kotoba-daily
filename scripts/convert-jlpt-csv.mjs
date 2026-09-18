import fs from 'node:fs';
import path from 'node:path';

const input = process.argv[2] ?? 'src/n5.csv';
const output = process.argv[3] ?? 'public/data/n5.json';
const csv = fs.readFileSync(input, 'utf8');
const rows = csv.trim().split(/\r?\n/).slice(1);
const splitCsvLine = (line) => {
  const cells = [];
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

const words = rows.map((line) => {
  const [jp, reading, meaningEn] = splitCsvLine(line).map((value) =>
    value.replace(/^"|"$/g, '').trim(),
  );
  return { id: `${jp}-${reading}`, jp, reading, meaningKo: meaningEn, meaningEn, jlptLevel: 'N5' };
});

fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, `${JSON.stringify(words, null, 2)}\n`);
