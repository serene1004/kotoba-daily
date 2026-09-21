import { useState } from 'react';
import { Bookmark } from 'lucide-react';
import { Furigana } from './Furigana';
import styles from './StudySession.module.css';
import type { Word } from '../types';

type Props = {
  word?: Word;
  progress: number;
  total: number;
  onAnswer: (correct: boolean) => void;
  onNext: () => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
};

export function StudySession({
  word,
  progress,
  total,
  onAnswer,
  onNext,
  isBookmarked,
  onToggleBookmark,
}: Props) {
  const [answer, setAnswer] = useState('');
  const [shown, setShown] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const [showFurigana, setShowFurigana] = useState(false);

  if (!word) {
    return (
      <section className={styles.quest}>
        <p>오늘의 단어를 준비하고 있어요.</p>
      </section>
    );
  }

  const isLast = progress === total - 1;

  const moveNext = (action: () => void) => {
    setAnswer('');
    setShown(false);
    setSkipped(false);
    setShowFurigana(false);
    action();
  };
  const showAnswer = () => {
    if (answer.trim()) {
      setShown(true);
    }
  };
  const skipAnswer = () => {
    onAnswer(false);
    setSkipped(true);
    setShown(true);
  };
  const finishAnswer = (isCorrect: boolean) => {
    onAnswer(isCorrect);
    moveNext(onNext);
  };

  return (
    <section className={styles.quest}>
      <div className={styles['quest-head']}>
        <div>
          <p className="eyebrow">TODAY</p>
          <h2>오늘 학습</h2>
        </div>
        <b>
          {progress + 1} / {total}
        </b>
      </div>
      <div className={styles.meter}>
        <i style={{ width: `${((progress + 1) / total) * 100}%` }} />
      </div>
      <article className={styles.card}>
        <strong>
          <Furigana expression={word.jp} reading={word.reading} show={showFurigana} />
        </strong>
        <div className={styles['answer-input']}>
          <button
            className={`${styles['furigana-toggle']} tooltip`}
            type="button"
            aria-label="후리가나 보기"
            aria-pressed={showFurigana}
            data-tooltip="후리가나"
            onClick={() => setShowFurigana((current) => !current)}
          >
            あ
          </button>
          <input
            value={answer}
            placeholder="생각나는 뜻을 적어 보세요."
            disabled={shown}
            onChange={(event) => setAnswer(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                showAnswer();
              }
            }}
            aria-label="한국어 뜻 입력"
          />
        </div>
        {shown && (
          <>
            <button
              className={`${styles['card-bookmark']} tooltip`}
              type="button"
              aria-label={isBookmarked ? '단어장에서 제거' : '단어장에 저장'}
              aria-pressed={isBookmarked}
              data-tooltip={isBookmarked ? '단어장에서 제거' : '단어장에 저장'}
              onClick={onToggleBookmark}
            >
              <Bookmark
                size={18}
                fill={isBookmarked ? 'currentColor' : 'none'}
                aria-hidden="true"
              />
            </button>
            <div className={styles.answer}>
              <div className={styles['answer-summary']}>
                <div className={styles['answer-row']}>
                  <span className={styles['answer-label']}>사전 뜻</span>
                  <div className={styles['answer-content']}>
                    <strong>{word.meaningKo}</strong>
                    <div className={styles['answer-meta']}>
                      {word.partOfSpeech && (
                        <span className={styles['part-chip']}>{word.partOfSpeech}</span>
                      )}
                      <a
                        className={styles['dictionary-link']}
                        href={`https://jisho.org/search/${encodeURIComponent(word.jp)}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        사전 보기 ↗
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              {word.example && (
                <div className={styles.example}>
                  <span className={styles['example-label']}>예문</span>
                  <p>
                    {word.example.japanese}
                    <br />
                    {word.example.korean}
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </article>
      {shown ? (
        <div className={styles.actions}>
          {skipped ? (
            <button
              className={`${styles.primary} button-primary`}
              type="button"
              onClick={() => moveNext(onNext)}
            >
              {isLast ? '오늘 학습 완료하기' : '다음 단어 보기'}
            </button>
          ) : (
            <>
              <button type="button" onClick={() => finishAnswer(false)}>
                정답이 아니에요
              </button>
              <button
                className={`${styles.primary} button-primary`}
                type="button"
                onClick={() => finishAnswer(true)}
              >
                {isLast ? '정답이에요 · 완료' : '정답이에요'}
              </button>
            </>
          )}
        </div>
      ) : (
        <div className={styles.actions}>
          <button type="button" onClick={skipAnswer}>
            모르겠어요
          </button>
          <button
            className={`${styles.primary} button-primary`}
            type="button"
            disabled={!answer.trim()}
            onClick={showAnswer}
          >
            정답 확인하기
          </button>
        </div>
      )}
    </section>
  );
}
