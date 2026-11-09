import { useEffect, useMemo, useState } from 'react';
import { ArrowUp, Bookmark, ChevronDown, Search } from 'lucide-react';
import { Furigana } from './Furigana';
import { WordDetailDialog } from './WordDetailDialog';
import type { Word } from '../types';
import styles from './WordFinder.module.css';

type Props = {
  words: Word[];
  bookmarks: Word[];
  loading: boolean;
  failedLevels: ('N5' | 'N4' | 'N3')[];
  onToggleBookmark: (id: string) => void;
};

export function WordFinder({ words, bookmarks, loading, failedLevels, onToggleBookmark }: Props) {
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState<'all' | 'bookmarks'>('all');
  const [level, setLevel] = useState<'all' | 'N5' | 'N4' | 'N3'>('all');
  const [visibleCount, setVisibleCount] = useState(40);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [showGoTop, setShowGoTop] = useState(false);
  const bookmarkedIds = useMemo(() => new Set(bookmarks.map(({ id }) => id)), [bookmarks]);
  const results = useMemo(() => {
    const search = query.trim().toLocaleLowerCase();
    return (scope === 'bookmarks' ? bookmarks : words).filter(
      (word) =>
        (level === 'all' || word.jlptLevel === level) &&
        (!search ||
          [word.jp, word.reading, word.meaningKo, word.meaningEn]
            .filter(Boolean)
            .some((value) => value!.toLocaleLowerCase().includes(search))),
    );
  }, [bookmarks, level, query, scope, words]);
  const failedLevelsInScope =
    level === 'all' ? failedLevels : failedLevels.filter((failedLevel) => failedLevel === level);
  useEffect(() => setVisibleCount(40), [level, query, scope]);
  useEffect(() => {
    const updateVisibility = () => setShowGoTop(window.scrollY > 450);
    updateVisibility();
    window.addEventListener('scroll', updateVisibility, { passive: true });
    return () => window.removeEventListener('scroll', updateVisibility);
  }, []);

  return (
    <section>
      <div className="page-heading">
        <p className="eyebrow">JLPT DICTIONARY</p>
        <h1>JLPT 사전</h1>
        <p>일본어, 읽는 법, 한국어 뜻으로 N3~N5 단어를 찾고 상세 정보를 확인하세요.</p>
      </div>
      <div className={styles.tools}>
        <label className={styles.search} htmlFor="word-search">
          <Search size={19} aria-hidden="true" />
          <input
            type="search"
            id="word-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="단어 또는 뜻 검색"
            aria-label="단어 또는 뜻 검색"
          />
        </label>
        <div className={styles.filters}>
          <div role="group" aria-label="검색 범위">
            <button type="button" aria-pressed={scope === 'all'} onClick={() => setScope('all')}>
              전체 단어
            </button>
            <button
              type="button"
              aria-pressed={scope === 'bookmarks'}
              onClick={() => setScope('bookmarks')}
            >
              북마크만
            </button>
          </div>
          <label className={styles.levelFilter} htmlFor="word-level">
            <span>레벨</span>
            <span className={styles.selectWrap}>
              <select
                id="word-level"
                value={level}
                onChange={(event) => setLevel(event.target.value as 'all' | 'N5' | 'N4' | 'N3')}
              >
                <option value="all">전체</option>
                <option value="N5">N5</option>
                <option value="N4">N4</option>
                <option value="N3">N3</option>
              </select>
              <ChevronDown size={16} aria-hidden="true" />
            </span>
          </label>
        </div>
      </div>
      <p className={styles.count} aria-live="polite">
        {results.length}개 단어
      </p>
      {!loading && failedLevelsInScope.length > 0 && (
        <p className={styles.warning} role="status">
          {failedLevelsInScope.join(', ')} 단어 데이터를 불러오지 못했어요. 해당 레벨의 검색 결과가
          빠져 있어요.
        </p>
      )}
      {loading ? (
        <p className={styles.empty} role="status">
          단어 데이터를 불러오는 중이에요.
        </p>
      ) : results.length ? (
        <div className={styles.results}>
          {results.slice(0, visibleCount).map((word) => (
            <article className={styles.word} key={word.id}>
              <button
                className={styles['word-content']}
                type="button"
                onClick={() => setSelectedWord(word)}
                aria-label={`${word.jp}, 상세 정보 보기`}
              >
                <span className={styles.level}>{word.jlptLevel}</span>
                <strong>
                  <Furigana expression={word.jp} reading={word.reading} />
                </strong>
                <span className={styles.meaning}>{word.meaningKo}</span>
              </button>
              <button
                className={styles.bookmark}
                type="button"
                aria-label={bookmarkedIds.has(word.id) ? '북마크 해제' : '북마크 추가'}
                aria-pressed={bookmarkedIds.has(word.id)}
                onClick={() => onToggleBookmark(word.id)}
              >
                <Bookmark
                  size={20}
                  fill={bookmarkedIds.has(word.id) ? 'currentColor' : 'none'}
                  aria-hidden="true"
                />
              </button>
            </article>
          ))}
        </div>
      ) : (
        <p className={styles.empty}>
          {failedLevelsInScope.length > 0 && (level !== 'all' || failedLevels.length === 3)
            ? '단어를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.'
            : scope === 'bookmarks' && !bookmarks.length
              ? '저장된 북마크가 없어요.'
              : '검색 결과가 없어요.'}
        </p>
      )}
      {results.length > visibleCount && (
        <button
          className={styles.more}
          type="button"
          onClick={() => setVisibleCount((count) => count + 40)}
        >
          <ChevronDown size={19} aria-hidden="true" />
          <span>
            <strong>단어 더 보기</strong>
            <small>최대 40개씩 · {results.length - visibleCount}개 남음</small>
          </span>
        </button>
      )}
      {selectedWord && (
        <WordDetailDialog
          word={selectedWord}
          isBookmarked={bookmarkedIds.has(selectedWord.id)}
          onToggleBookmark={onToggleBookmark}
          onClose={() => setSelectedWord(null)}
        />
      )}
      {showGoTop && (
        <button
          className={styles.goTop}
          type="button"
          aria-label="페이지 맨 위로"
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
                ? 'auto'
                : 'smooth',
            })
          }
        >
          <ArrowUp size={18} aria-hidden="true" />맨 위로
        </button>
      )}
    </section>
  );
}
