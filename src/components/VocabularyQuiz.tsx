import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Word } from '../types';
import { readStorage, shuffle, writeStorage } from '../lib/study';
import { chooseQuizQuestions, recordQuizAnswer } from '../lib/quizSelection.js';
import styles from './VocabularyQuiz.module.css';

type Level = 'N5' | 'N4' | 'N3';
type QuizRecord = { correctCount: number; wrongCount: number; lastCorrect: boolean };
type Props = {
  words: Word[];
  level: Level;
  size: 5 | 10;
  onSelectLevel: (level: Level) => void;
  startImmediately?: boolean;
};

const readQuizRecords = (level: Level) => {
  const stored = readStorage<unknown>(`quizProgress:${level}`, {});
  return stored && typeof stored === 'object' && !Array.isArray(stored)
    ? (stored as Record<string, QuizRecord>)
    : {};
};

const chooseQuestions = (words: Word[], level: Level, size: number) => {
  const records = readQuizRecords(level);
  return chooseQuizQuestions(words, level, size, records);
};

export function VocabularyQuiz({
  words,
  level,
  size,
  onSelectLevel,
  startImmediately = false,
}: Props) {
  const [started, setStarted] = useState(startImmediately);
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [selected, setSelected] = useState<string>();
  const [questions, setQuestions] = useState<Word[]>(() =>
    startImmediately ? chooseQuestions(words, level, size) : [],
  );
  const levelWords = useMemo(
    () => words.filter((item) => item.jlptLevel === level),
    [words, level],
  );
  const word = questions[index];
  const choices = useMemo(
    () =>
      word
        ? shuffle([
            word,
            ...shuffle(
              levelWords.filter(
                (candidate) =>
                  candidate.id !== word.id &&
                  candidate.meaningKo.trim() !== word.meaningKo.trim() &&
                  candidate.meaningKo.trim(),
              ),
            )
              .filter(
                (candidate, position, candidates) =>
                  candidates.findIndex(
                    (item) => item.meaningKo.trim() === candidate.meaningKo.trim(),
                  ) === position,
              )
              .slice(0, 3),
          ])
        : [],
    [levelWords, questions, word],
  );
  const questionCount = Math.min(size, questions.length);

  if (!started) {
    return (
      <>
        <section className="page-heading">
          <p className="eyebrow">{level} VOCABULARY QUIZ</p>
          <h1>{level} 단어 퀴즈</h1>
        </section>
        <section className={styles.panel}>
          <p>한국어 뜻을 보고 알맞은 일본어 단어를 골라 보세요. {size}문제를 풀어요.</p>
          <div className={styles.levelOptions} role="group" aria-label="퀴즈 레벨 선택">
            {(['N5', 'N4', 'N3'] as const).map((option) => (
              <button
                key={option}
                className={level === option ? styles.levelSelected : undefined}
                type="button"
                aria-pressed={level === option}
                disabled={!words.some((item) => item.jlptLevel === option)}
                onClick={() => onSelectLevel(option)}
              >
                {option}
              </button>
            ))}
          </div>
          <button
            className="button-primary"
            type="button"
            disabled={!words.some((item) => item.jlptLevel === level)}
            onClick={() => {
              setQuestions(chooseQuestions(words, level, size));
              setIndex(0);
              setCorrect(0);
              setStarted(true);
            }}
          >
            퀴즈 시작하기
          </button>
        </section>
      </>
    );
  }

  if (!questions.length) {
    return (
      <>
        <section className="page-heading">
          <p className="eyebrow">{level} VOCABULARY QUIZ</p>
          <h1>{level} 단어 퀴즈</h1>
        </section>
        <section className={styles.panel}>
          <h2>퀴즈를 준비할 수 없어요</h2>
          <p>{level} 단어 데이터를 확인해 주세요.</p>
          <Link to="/">대시보드로 가기</Link>
        </section>
      </>
    );
  }

  if (index >= questionCount) {
    return (
      <>
        <section className="page-heading">
          <p className="eyebrow">QUIZ COMPLETE</p>
          <h1>{level} 단어 퀴즈 결과</h1>
        </section>
        <section className={styles.panel}>
          <strong className={styles.score}>
            {correct}/{questionCount}
          </strong>
          <p>정답 수예요.</p>
          <button
            className="button-primary"
            type="button"
            onClick={() => {
              setQuestions(chooseQuestions(words, level, size));
              setIndex(0);
              setCorrect(0);
              setSelected(undefined);
            }}
          >
            다시 풀기
          </button>
          <Link to="/">대시보드로 가기</Link>
        </section>
      </>
    );
  }

  return (
    <>
      <section className="page-heading">
        <p className="eyebrow">{level} VOCABULARY QUIZ</p>
        <h1>{level} 단어 퀴즈</h1>
      </section>
      <section className={styles.panel}>
        <div className={styles.heading}>
          <div className={styles.questionHeading}>
            <p className="eyebrow">QUESTION</p>
            <h2>한글 뜻에 맞는 일본어 단어를 고르세요.</h2>
          </div>
          <b>
            {index + 1} / {questionCount}
          </b>
        </div>
        <div className={styles.meter}>
          <i style={{ width: `${((index + 1) / questionCount) * 100}%` }} />
        </div>
        <article className={styles.question}>
          <p>{word.meaningKo}</p>
          <div className={styles.choices} role="group" aria-label="정답 선택지">
            {choices.map((choice) => (
              <button
                key={choice.id}
                type="button"
                disabled={selected !== undefined}
                aria-pressed={selected === choice.id}
                className={
                  selected === choice.id
                    ? choice.id === word.id
                      ? styles.correct
                      : styles.incorrect
                    : ''
                }
                onClick={() => {
                  setSelected(choice.id);
                  const isCorrect = choice.id === word.id;
                  if (isCorrect) setCorrect((count) => count + 1);
                  const records = readQuizRecords(level);
                  writeStorage(
                    `quizProgress:${level}`,
                    recordQuizAnswer(records, word.id, isCorrect),
                  );
                }}
              >
                {choice.jp} <span>({choice.reading})</span>
              </button>
            ))}
          </div>
          {selected && (
            <p role="status">
              {selected === word.id ? '정답이에요!' : `아쉬워요. 정답은 ${word.jp}예요.`}
            </p>
          )}
        </article>
        {selected && (
          <button
            className="button-primary"
            type="button"
            onClick={() => {
              setIndex((value) => value + 1);
              setSelected(undefined);
            }}
          >
            다음 문제
          </button>
        )}
      </section>
    </>
  );
}
