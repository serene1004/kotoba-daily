import { useEffect, useState } from 'react';
import { shuffle } from '../lib/study';
import type { Word } from '../types';
import { StudySession } from './StudySession';
import styles from './WordFinder.module.css';

type Props = {
  bookmarks: Word[];
  onRemoveBookmark: (id: string) => void;
};

export function BookmarkStudy({ bookmarks, onRemoveBookmark }: Props) {
  const [reviewOrder, setReviewOrder] = useState<Word[]>([]);
  const [index, setIndex] = useState(0);
  const word = reviewOrder[index];

  useEffect(() => {
    setReviewOrder((current) => {
      if (!bookmarks.length) return [];
      const bookmarkIds = new Set(bookmarks.map(({ id }) => id));
      const remaining = current.filter(({ id }) => bookmarkIds.has(id));
      const remainingIds = new Set(remaining.map(({ id }) => id));
      return [...remaining, ...shuffle(bookmarks.filter(({ id }) => !remainingIds.has(id)))];
    });
  }, [bookmarks]);

  useEffect(() => {
    setIndex((current) => Math.min(current, Math.max(reviewOrder.length - 1, 0)));
  }, [reviewOrder.length]);

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
          onAnswer={() => {}}
          onNext={() => setIndex((current) => (current + 1) % reviewOrder.length)}
          isBookmarked
          onToggleBookmark={() => onRemoveBookmark(word.id)}
          isBookmarkReview
        />
      ) : (
        <p className={styles.empty}>복습할 북마크가 없어요.</p>
      )}
    </section>
  );
}
