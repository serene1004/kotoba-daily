import { useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';
import type { Word } from '../types';
import { useDashboardActivity } from '../hooks/useDashboardActivity';
import { BookmarkList } from './dashboard/BookmarkList';
import { LearningLevelSelector } from './dashboard/LearningLevelSelector';
import styles from './Dashboard.module.css';

type Props = {
  bookmarks: Word[];
  selectedLevel: 'N5' | 'N4' | 'N3';
  sessionSize: 5 | 10;
  resumeAvailable: boolean;
  levelSummaries: {
    level: 'N5' | 'N4' | 'N3';
    total: number;
    learned: number;
    dueReviews: number;
  }[];
  onRemoveBookmark: (id: string) => void;
  onToggleBookmark: (id: string) => void;
  onStudy: () => void;
  onSelectLevel: (level: 'N5' | 'N4' | 'N3') => void;
  onSelectSessionSize: (size: 5 | 10) => void;
};

export function Dashboard({
  bookmarks,
  selectedLevel,
  sessionSize,
  resumeAvailable,
  levelSummaries,
  onRemoveBookmark,
  onToggleBookmark,
  onStudy,
  onSelectLevel,
  onSelectSessionSize,
}: Props) {
  const activity = useDashboardActivity(selectedLevel);
  const [activeTab, setActiveTab] = useState<'vocabulary' | 'quiz' | 'kana'>('vocabulary');
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const tabs = [
    ['vocabulary', '단어 공부'],
    ['quiz', '단어 퀴즈'],
    ['kana', '가나 공부'],
  ] as const;

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const currentIndex = tabs.findIndex(([id]) => id === activeTab);
    const nextIndex =
      event.key === 'ArrowRight'
        ? (currentIndex + 1) % tabs.length
        : event.key === 'ArrowLeft'
          ? (currentIndex - 1 + tabs.length) % tabs.length
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? tabs.length - 1
              : -1;
    if (nextIndex < 0) return;
    event.preventDefault();
    setActiveTab(tabs[nextIndex][0]);
    tabRefs.current[nextIndex]?.focus();
  };

  return (
    <section>
      <div className="page-heading">
        <p className="eyebrow">JAPANESE STUDY</p>
        <h1>일본어 학습</h1>
      </div>
      <div className={styles.studyModes}>
        <div className={styles.tabs} role="tablist" aria-label="학습 모드 선택">
          {tabs.map(([id, label], index) => (
            <button
              key={id}
              ref={(element) => {
                tabRefs.current[index] = element;
              }}
              id={`study-mode-tab-${id}`}
              type="button"
              role="tab"
              aria-selected={activeTab === id}
              aria-controls="study-mode-panel"
              tabIndex={activeTab === id ? 0 : -1}
              onClick={() => setActiveTab(id)}
              onKeyDown={handleTabKeyDown}
            >
              {label}
            </button>
          ))}
        </div>
        <section
          className={styles.learning}
          id="study-mode-panel"
          role="tabpanel"
          aria-labelledby={`study-mode-tab-${activeTab}`}
          tabIndex={0}
        >
          {activeTab === 'vocabulary' ? (
            <LearningLevelSelector
              selectedLevel={selectedLevel}
              sessionSize={sessionSize}
              resumeAvailable={resumeAvailable}
              studiedCount={activity.studiedCount}
              todayStudied={activity.todayStudied}
              levelSummaries={levelSummaries}
              onStudy={onStudy}
              onSelectLevel={onSelectLevel}
              onSelectSessionSize={onSelectSessionSize}
            />
          ) : activeTab === 'quiz' ? (
            <div className={styles.learningContent}>
              <div className={styles['learning-heading']}>
                <p className="eyebrow">{selectedLevel} VOCABULARY QUIZ</p>
                <h2>뜻을 보고 단어를 골라요</h2>
                <p>한국어 뜻에 맞는 일본어 단어를 선택하고 바로 정답을 확인해요.</p>
              </div>
              <div className={styles['level-options']} role="group" aria-label="퀴즈 레벨 선택">
                {levelSummaries.map(({ level, total }) => (
                  <button
                    key={level}
                    className={`${styles['level-option']} ${selectedLevel === level ? styles['level-selected'] : ''}`}
                    type="button"
                    disabled={total === 0}
                    aria-pressed={selectedLevel === level}
                    onClick={() => onSelectLevel(level)}
                  >
                    {total === 0 ? `${level} 데이터 없음` : level}
                  </button>
                ))}
              </div>
              <Link
                className={`${styles.primary} button-primary`}
                to="/quiz"
                state={{ startImmediately: true }}
              >
                {selectedLevel} 퀴즈 시작하기
              </Link>
            </div>
          ) : (
            <div className={styles.learningContent}>
              <div className={styles['learning-heading']}>
                <p className="eyebrow">HIRAGANA & KATAKANA</p>
                <h2>가나를 쓰며 익혀요</h2>
                <p>히라가나와 가타카나를 고르고 획순에 맞춰 연습해요.</p>
              </div>
              <Link className={`${styles.primary} button-primary`} to="/kana">
                가나 공부 시작하기
              </Link>
            </div>
          )}
        </section>
      </div>
      <BookmarkList
        bookmarks={bookmarks}
        onRemoveBookmark={onRemoveBookmark}
        onToggleBookmark={onToggleBookmark}
      />
    </section>
  );
}
