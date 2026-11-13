import type { Word } from '../types';

type QuizRecord = { lastCorrect?: boolean };
type StoredQuizRecord = {
  correctCount?: number;
  wrongCount?: number;
  lastCorrect?: boolean;
};

export function chooseQuizQuestions(
  words: Word[],
  level: 'N5' | 'N4' | 'N3',
  size: number,
  records: Record<string, StoredQuizRecord>,
  random?: () => number,
): Word[];

export function recordQuizAnswer(
  records: Record<string, StoredQuizRecord>,
  wordId: string,
  isCorrect: boolean,
): Record<
  string,
  StoredQuizRecord & { correctCount: number; wrongCount: number; lastCorrect: boolean }
>;
