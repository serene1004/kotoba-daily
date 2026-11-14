import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { shuffle } from '../lib/study';
import type { Word } from '../types';
import { StudySession } from './StudySession';
import appStyles from '../App.module.css';
import styles from './WordFinder.module.css';

const BOOKMARK_REVIEW_SIZE = 10;

type Props = {
  bookmarks: Word[];
  onRemoveBookmark: (id: string) => void;
};

export function BookmarkStudy({ bookmarks, onRemoveBookmark }: Props) {
  const [reviewOrder, setReviewOrder] = useState<Word[]>([]);
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const initialized = useRef(false);
  const navigate = useNavigate();
  const word = reviewOrder[index];

  useEffect(() => {
    if (initialized.current || !bookmarks.length) return;
    setReviewOrder(shuffle(bookmarks).slice(0, BOOKMARK_REVIEW_SIZE));
    initialized.current = true;
  }, [bookmarks]);

  return (
    <section>
      <div className="page-heading">
        <p className="eyebrow">BOOKMARK REVIEW</p>
        <h1>북마크 단어 복습</h1>
        <p>북마크한 단어를 떠올리고 답을 확인해 보세요.</p>
      </div>
      {word ? (
        <StudySession
          word={word}
          progress={index}
          total={reviewOrder.length}
          onAnswer={(correct) => {
            if (correct) setCorrectCount((current) => current + 1);
            else setWrongCount((current) => current + 1);
            if (correct) onRemoveBookmark(word.id);
          }}
          onNext={() => setIndex((current) => current + 1)}
          isBookmarked={bookmarks.some(({ id }) => id === word.id)}
          onToggleBookmark={() => onRemoveBookmark(word.id)}
          isBookmarkReview
        />
      ) : reviewOrder.length > 0 && index >= reviewOrder.length ? (
        <section className={appStyles.complete}>
          <h2>북마크 복습을 마쳤어요.</h2>
          <strong className={appStyles['complete-score']}>
            {correctCount}/{reviewOrder.length}
          </strong>
          <p>
            맞힌 단어 {correctCount}개 · 틀린 단어 {wrongCount}개
            <br />
            정답으로 판단한 단어는 북마크에서 제거했어요.
          </p>
          <div className={appStyles['complete-actions']}>
            <button
              className={appStyles.secondary}
              type="button"
              onClick={() => {
                setReviewOrder(shuffle(reviewOrder));
                setIndex(0);
                setCorrectCount(0);
                setWrongCount(0);
              }}
            >
              다시 복습하기
            </button>
            <button
              className={`${appStyles.primary} button-primary`}
              type="button"
              onClick={() => navigate('/')}
            >
              대시보드로 가기
            </button>
          </div>
        </section>
      ) : (
        <p className={styles.empty}>복습할 북마크가 없어요.</p>
      )}
    </section>
  );
}
