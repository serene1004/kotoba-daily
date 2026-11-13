import assert from 'node:assert/strict';
import test from 'node:test';
import { chooseQuizQuestions, recordQuizAnswer } from '../src/lib/quizSelection.js';

const word = (id, jlptLevel = 'N5') => ({ id, jlptLevel });

test('correct answers have lower weight than unanswered words', () => {
  const correct = word('correct');
  const unanswered = word('unanswered');

  assert.deepEqual(
    chooseQuizQuestions(
      [correct, unanswered],
      'N5',
      1,
      { correct: { lastCorrect: true } },
      () => 0.3,
    ),
    [unanswered],
  );
});

test('wrong answers keep the higher weight than previously correct words', () => {
  const correct = word('correct');
  const wrong = word('wrong');

  assert.deepEqual(
    chooseQuizQuestions(
      [correct, wrong],
      'N5',
      1,
      { correct: { lastCorrect: true }, wrong: { lastCorrect: false } },
      () => 0.3,
    ),
    [wrong],
  );
});

test('questions stay within the requested level and do not repeat in a set', () => {
  const words = [word('n5-a'), word('n5-b'), word('n4-a', 'N4')];
  const selected = chooseQuizQuestions(words, 'N5', 10, {}, () => 0);

  assert.deepEqual(
    selected.map(({ id }) => id),
    ['n5-a', 'n5-b'],
  );
  assert.equal(new Set(selected.map(({ id }) => id)).size, selected.length);
});

test('empty levels produce no questions', () => {
  assert.deepEqual(
    chooseQuizQuestions([], 'N3', 5, {}, () => 0),
    [],
  );
});

test('answers update correct and wrong counts and remember the latest result', () => {
  const records = { existing: { correctCount: 2, wrongCount: 1, lastCorrect: false } };

  assert.deepEqual(recordQuizAnswer(records, 'existing', true), {
    existing: { correctCount: 3, wrongCount: 1, lastCorrect: true },
  });
  assert.deepEqual(recordQuizAnswer(records, 'new', false), {
    existing: { correctCount: 2, wrongCount: 1, lastCorrect: false },
    new: { correctCount: 0, wrongCount: 1, lastCorrect: false },
  });
});
