import { useEffect, useRef } from 'react';
import { Bookmark, BookOpen, X } from 'lucide-react';
import { Furigana } from './Furigana';
import type { Word } from '../types';
import styles from './WordDetailDialog.module.css';

type Props = {
  word: Word;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  onClose: () => void;
};

export function WordDetailDialog({ word, isBookmarked, onToggleBookmark, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby="word-detail-title"
      onClose={onClose}
    >
      <div className={styles.header}>
        <span className={styles.level}>{word.jlptLevel ?? 'JLPT'}</span>
        <button
          className={styles.close}
          type="button"
          aria-label="상세 정보 닫기"
          onClick={() => dialogRef.current?.close()}
        >
          <X size={20} aria-hidden="true" />
        </button>
      </div>
      <div className={styles.word}>
        <h2 id="word-detail-title">
          <Furigana expression={word.jp} reading={word.reading} />
        </h2>
      </div>
      <dl className={styles.details}>
        <div>
          <dt>뜻</dt>
          <dd>{word.meaningKo}</dd>
        </div>
        {word.meaningEn && (
          <div>
            <dt>영어 뜻</dt>
            <dd>{word.meaningEn}</dd>
          </div>
        )}
        {word.partOfSpeech && (
          <div>
            <dt>품사</dt>
            <dd>{word.partOfSpeech}</dd>
          </div>
        )}
        {word.example && (
          <div>
            <dt>예문</dt>
            <dd className={styles.example}>
              <p className={styles.exampleJapanese}>
                {word.example.reading ? (
                  <Furigana expression={word.example.japanese} reading={word.example.reading} />
                ) : (
                  word.example.japanese
                )}
              </p>
              <p>{word.example.korean}</p>
            </dd>
          </div>
        )}
      </dl>
      <div className={styles.actions}>
        <button
          className={styles.bookmark}
          type="button"
          aria-pressed={isBookmarked}
          onClick={() => onToggleBookmark(word.id)}
        >
          <Bookmark size={18} fill={isBookmarked ? 'currentColor' : 'none'} aria-hidden="true" />
          {isBookmarked ? '북마크 해제' : '북마크 추가'}
        </button>
        <a
          href={`https://jisho.org/search/${encodeURIComponent(word.jp)}`}
          target="_blank"
          rel="noreferrer"
        >
          <BookOpen size={17} aria-hidden="true" /> 사전에서 더 보기
        </a>
      </div>
    </dialog>
  );
}
