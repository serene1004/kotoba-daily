import { useEffect, useState } from 'react';
import { BookOpen, BookmarkMinus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Furigana } from '../Furigana';
import styles from '../Dashboard.module.css';
import type { Word } from '../../types';

type Props = { bookmarks: Word[]; onRemoveBookmark: (id: string) => void };
const BOOKMARKS_PER_PAGE = 10;

export function BookmarkList({ bookmarks, onRemoveBookmark }: Props) {
  const [page, setPage] = useState(1);
  const pageCount = Math.ceil(bookmarks.length / BOOKMARKS_PER_PAGE);
  const visibleBookmarks = bookmarks.slice((page - 1) * BOOKMARKS_PER_PAGE, page * BOOKMARKS_PER_PAGE);

  useEffect(() => {
    setPage((current) => Math.min(current, Math.max(pageCount, 1)));
  }, [pageCount]);

  if (!bookmarks.length) return null;

  return (
    <section className={styles.bookmarks}>
      <div className={styles['bookmarks-heading']}>
        <div>
          <p className="eyebrow">WORD LIST</p>
          <h2>단어장</h2>
        </div>
        <b>{bookmarks.length}</b>
      </div>
      <div className={styles['bookmark-list']}>
        {visibleBookmarks.map((word) => (
          <article key={word.id} className={styles['bookmark-item']}>
            <div>
              <strong><Furigana expression={word.jp} reading={word.reading} /></strong>
              <p>{word.meaningKo}</p>
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
      {pageCount > 1 && (
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
    </section>
  );
}
