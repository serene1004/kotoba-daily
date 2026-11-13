import { useEffect, useState } from 'react';
import { BookOpen, BookmarkMinus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { WordDetailDialog } from '../WordDetailDialog';
import styles from '../Dashboard.module.css';
import type { Word } from '../../types';

type Props = {
  bookmarks: Word[];
  onRemoveBookmark: (id: string) => void;
  onToggleBookmark: (id: string) => void;
};
const BOOKMARKS_PER_PAGE = 10;

export function BookmarkList({ bookmarks, onRemoveBookmark, onToggleBookmark }: Props) {
  const [page, setPage] = useState(1);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const pageCount = Math.ceil(bookmarks.length / BOOKMARKS_PER_PAGE);
  const visibleBookmarks = bookmarks.slice(
    (page - 1) * BOOKMARKS_PER_PAGE,
    page * BOOKMARKS_PER_PAGE,
  );

  useEffect(() => {
    setPage((current) => Math.min(current, Math.max(pageCount, 1)));
  }, [pageCount]);

  return (
    <section className={styles.bookmarks}>
      <div className={styles['bookmarks-heading']}>
        <div className={styles['bookmark-title']}>
          <p className="eyebrow">BOOKMARKS</p>
          <h2>북마크</h2>
          <p className={styles['bookmark-count']}>총 {bookmarks.length}개 단어를 저장했어요.</p>
        </div>
        {bookmarks.length > 0 && (
          <div className={styles['bookmark-toolbar']}>
            <Link className={`${styles['bookmark-review']} button-primary`} to="/bookmark-study">
              북마크 단어 복습하기
            </Link>
          </div>
        )}
      </div>
      {bookmarks.length ? (
        <div className={styles['bookmark-list']}>
          {visibleBookmarks.map((word) => (
            <article key={word.id} className={styles['bookmark-item']}>
              <button
                className={styles['bookmark-detail']}
                type="button"
                onClick={() => setSelectedWord(word)}
                aria-label={`${word.jp}, 상세 정보 보기`}
              />
              <div className={styles['bookmark-content']}>
                <strong>{word.jp}</strong>
                <span>{word.meaningKo}</span>
              </div>
              <div className={styles['bookmark-actions']}>
                <a
                  className={`${styles['icon-button']} tooltip`}
                  href={`https://jisho.org/search/${encodeURIComponent(word.jp)}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="사전에서 자세히 보기"
                  data-tooltip="사전에서 자세히 보기"
                >
                  <BookOpen size={17} aria-hidden="true" />
                </a>
                <button
                  className={`${styles['icon-button']} tooltip`}
                  type="button"
                  onClick={() => onRemoveBookmark(word.id)}
                  aria-label="단어장 저장 해제"
                  data-tooltip="단어장 저장 해제"
                >
                  <BookmarkMinus size={17} aria-hidden="true" />
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className={styles['bookmark-empty']}>
          아직 저장한 단어가 없어요. 공부 중 마음에 드는 단어를 북마크해 보세요.
        </p>
      )}
      {bookmarks.length > 0 && pageCount > 1 && (
        <nav className={styles.pagination} aria-label="단어장 페이지 이동">
          <button
            className={`${styles['page-button']} tooltip`}
            type="button"
            onClick={() => setPage((current) => current - 1)}
            disabled={page === 1}
            aria-label="이전 페이지"
            data-tooltip="이전 페이지"
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
          {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => (
            <button
              key={number}
              className={styles['page-button']}
              type="button"
              onClick={() => setPage(number)}
              aria-current={page === number ? 'page' : undefined}
            >
              {number}
            </button>
          ))}
          <button
            className={`${styles['page-button']} tooltip`}
            type="button"
            onClick={() => setPage((current) => current + 1)}
            disabled={page === pageCount}
            aria-label="다음 페이지"
            data-tooltip="다음 페이지"
          >
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </nav>
      )}
      {selectedWord && (
        <WordDetailDialog
          word={selectedWord}
          isBookmarked={bookmarks.some(({ id }) => id === selectedWord.id)}
          onToggleBookmark={onToggleBookmark}
          onClose={() => setSelectedWord(null)}
        />
      )}
    </section>
  );
}
