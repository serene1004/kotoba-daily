import fs from 'node:fs/promises';

const file = process.argv[2] ?? 'public/data/n5.json';
const words = JSON.parse(await fs.readFile(file, 'utf8'));
const ids = new Set();

if (!Array.isArray(words) || !words.length) {
  throw new Error('Vocabulary data must be a non-empty array');
}

for (const word of words) {
  if (!word.id || ids.has(word.id)) {
    throw new Error(`Duplicate or missing id: ${word.id || 'unknown'}`);
  }
  if (!word.jp?.trim() || !word.reading?.trim() || !word.meaningKo?.trim()) {
    throw new Error(`Missing required word fields: ${word.id}`);
  }
  if (word.example && (!word.example.japanese?.trim() || !word.example.korean?.trim())) {
    throw new Error(`Incomplete example: ${word.id}`);
  }
  ids.add(word.id);
}

console.log(`Validated ${words.length} vocabulary entries.`);
