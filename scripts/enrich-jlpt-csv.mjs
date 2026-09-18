import fs from 'node:fs/promises';
import path from 'node:path';

const sourceUrl =
  process.env.JLPT_SOURCE_URL ||
  'https://raw.githubusercontent.com/elzup/jlpt-word-list/refs/heads/master/src/n5.csv';
const output = process.argv[2] || 'public/data/n5.json';
const model = process.env.OPENAI_MODEL || 'gpt-5';
const batchSize = Number(process.env.ENRICH_BATCH_SIZE || 20);
const concurrency = Number(process.env.ENRICH_CONCURRENCY || 3);
const checkpointPath =
  process.env.ENRICH_CHECKPOINT || 'scripts/.cache/n5-enrichment-progress.json';

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
  return [...cells, cell].map((value) => value.replace(/^"|"$/g, '').trim());
};

const parseCsv = (csv) =>
  csv
    .trim()
    .split(/\r?\n/)
    .slice(1)
    .map(splitCsvLine)
    .filter(([jp, reading, meaningEn]) => jp && reading && meaningEn)
    .map(([jp, reading, meaningEn]) => ({
      id: `${jp}-${reading}`,
      jp,
      reading,
      meaningEn,
      jlptLevel: 'N5',
    }));

const schema = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          meaningKo: { type: 'string' },
          partOfSpeech: { type: 'string' },
          example: {
            type: 'object',
            properties: {
              japanese: { type: 'string' },
              reading: { type: 'string' },
              korean: { type: 'string' },
            },
            required: ['japanese', 'reading', 'korean'],
            additionalProperties: false,
          },
        },
        required: ['id', 'meaningKo', 'partOfSpeech', 'example'],
        additionalProperties: false,
      },
    },
  },
  required: ['items'],
  additionalProperties: false,
};

const validate = (items, source) => {
  if (!Array.isArray(items) || items.length !== source.length) {
    throw new Error(`Expected ${source.length} enriched words, received ${items?.length ?? 0}`);
  }
  const sourceIds = new Set(source.map((word) => word.id));
  const enrichedIds = new Set(items.map((item) => item.id));
  if (enrichedIds.size !== sourceIds.size)
    throw new Error('Enrichment contains duplicate word ids');
  for (const item of items) {
    if (
      !sourceIds.has(item.id) ||
      !item.meaningKo?.trim() ||
      !item.partOfSpeech?.trim() ||
      !item.example?.japanese?.trim() ||
      !item.example?.reading?.trim() ||
      !item.example?.korean?.trim()
    ) {
      throw new Error(`Invalid enrichment for ${item.id || 'unknown word'}`);
    }
  }
};

const enrich = async (source, apiKey) => {
  const batches = [];
  for (let index = 0; index < source.length; index += batchSize) {
    batches.push(source.slice(index, index + batchSize));
  }
  const sourceFingerprint = JSON.stringify(source);
  let enrichedBatches = Array.from({ length: batches.length });
  try {
    const checkpoint = JSON.parse(await fs.readFile(checkpointPath, 'utf8'));
    if (checkpoint.sourceFingerprint === sourceFingerprint && Array.isArray(checkpoint.batches)) {
      enrichedBatches = checkpoint.batches;
      console.log(
        `Resuming ${enrichedBatches.filter(Boolean).length}/${batches.length} completed batches...`,
      );
    }
  } catch {
    // No checkpoint or an incomplete checkpoint: start with the available batches.
  }
  let checkpointWrite = Promise.resolve();
  const saveCheckpoint = () => {
    checkpointWrite = checkpointWrite.then(async () => {
      await fs.mkdir(path.dirname(checkpointPath), { recursive: true });
      await fs.writeFile(
        checkpointPath,
        JSON.stringify({ sourceFingerprint, batches: enrichedBatches }, null, 2),
      );
    });
    return checkpointWrite;
  };
  let nextBatch = 0;
  const worker = async () => {
    while (nextBatch < batches.length) {
      const index = nextBatch;
      nextBatch += 1;
      if (enrichedBatches[index]) continue;
      const batch = batches[index];
      console.log(`Enriching batch ${index + 1}/${batches.length}...`);
      const response = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          store: false,
          input: `한국인 일본어 학습자를 위한 N5 단어 데이터다. 각 단어의 한국어 뜻, 품사, 자연스러운 예문을 작성해라. 원본의 id는 그대로 유지하고, 반드시 모든 단어를 같은 개수로 반환해라. 예문은 일본어와 읽는 법, 한국어 번역을 포함해라.\n\n${JSON.stringify(batch)}`,
          text: { format: { type: 'json_schema', name: 'word_enrichment', strict: true, schema } },
        }),
      });
      if (!response.ok)
        throw new Error(`OpenAI API failed: ${response.status} ${await response.text()}`);
      const payload = await response.json();
      const outputText =
        payload.output_text ||
        payload.output
          ?.flatMap((item) => item.content || [])
          .filter((item) => item.type === 'output_text')
          .map((item) => item.text)
          .join('');
      if (!outputText)
        throw new Error(`OpenAI response did not contain text: ${JSON.stringify(payload)}`);
      enrichedBatches[index] = JSON.parse(outputText).items;
      await saveCheckpoint();
    }
  };
  await Promise.all(Array.from({ length: Math.min(concurrency, batches.length) }, worker));
  return enrichedBatches.flat();
};

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is required. Set it in the shell before running this script.');
}

const source = parseCsv(await (await fetch(sourceUrl)).text());
const enriched = await enrich(source, process.env.OPENAI_API_KEY);
validate(enriched, source);
const byId = new Map(enriched.map((item) => [item.id, item]));
const result = source.map((word) => ({ ...word, ...byId.get(word.id) }));
await fs.mkdir(path.dirname(output), { recursive: true });
await fs.writeFile(output, `${JSON.stringify(result, null, 2)}\n`);
await fs.rm(checkpointPath, { force: true });
console.log(`Wrote ${result.length} words to ${output}`);
