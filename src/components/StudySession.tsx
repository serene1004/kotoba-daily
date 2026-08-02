import { useState } from 'react';
import { Furigana } from './Furigana';
import styles from './StudySession.module.css';
import type { Word } from '../types';

type Props = {
  word?: Word;
  progress: number;
  total: number;
  onBookmark: () => void;
  onRemember: () => void;
};

export function StudySession({ word, progress, total, onBookmark, onRemember }: Props) {
  const [answer, setAnswer] = useState('');
  const [shown, setShown] = useState(false);
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
    setShowFurigana(false);
    action();
  };
  const showAnswer = () => {
    if (answer.trim()) {
      setShown(true);
    }
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
        <span>생각나는 뜻을 적어 보세요.</span>
        <div className={styles['answer-input']}>
          <button
            className={styles['furigana-toggle']}
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
          <div className={styles.answer}>
            <b>사전 뜻 · {word.meaning}</b>
            <a
              className={styles['dictionary-link']}
              href={`https://jisho.org/search/${encodeURIComponent(word.jp)}`}
              target="_blank"
              rel="noreferrer"
            >
              사전에서 자세히 보기 ↗
            </a>
          </div>
        )}
      </article>
      {shown ? (
        <div className={styles.actions}>
          <button type="button" onClick={() => moveNext(onBookmark)}>
            단어장에 저장
          </button>
          <button className={styles.primary} type="button" onClick={() => moveNext(onRemember)}>
            {isLast ? '오늘 학습 완료하기' : '다음 단어 보기'}
          </button>
        </div>
      ) : (
        <div className={styles.actions}>
          <button
            className={styles.primary}
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
