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
  onStudy,
  onSelectLevel,
  onSelectSessionSize,
}: Props) {
  const activity = useDashboardActivity(selectedLevel);

  return (
    <section>
      <div className="page-heading">
        <p className="eyebrow">JAPANESE STUDY</p>
        <h1>일본어 학습</h1>
      </div>
      <div className={styles.studyModes}>
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
        <section className={styles.learning} aria-labelledby="kana-title">
          <div className={styles['learning-heading']}>
            <p className="eyebrow">HIRAGANA & KATAKANA</p>
            <h2 id="kana-title">가나 공부</h2>
            <p>히라가나와 가타카나를 선택하고 직접 써 보세요.</p>
          </div>
          <Link className={`${styles.primary} button-primary`} to="/kana">
            가나 공부 시작하기
          </Link>
        </section>
      </div>
      <BookmarkList bookmarks={bookmarks} onRemoveBookmark={onRemoveBookmark} />
    </section>
  );
}
