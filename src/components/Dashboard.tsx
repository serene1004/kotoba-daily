import type { Word } from '../types';
import { useDashboardActivity } from '../hooks/useDashboardActivity';
import { BookmarkList } from './dashboard/BookmarkList';
import { LearningActivity } from './dashboard/LearningActivity';
import { LearningLevelSelector } from './dashboard/LearningLevelSelector';

type Props = {
  bookmarks: Word[];
  selectedLevel: 'N5' | 'N4' | 'N3';
  sessionSize: 5 | 10;
  resumeAvailable: boolean;
  levelSummaries: { level: 'N5' | 'N4' | 'N3'; total: number; learned: number; dueReviews: number }[];
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
        <p className="eyebrow">MY LEARNING</p>
        <h1>학습 현황</h1>
      </div>
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
      {activity.activityAvailable && (
        <LearningActivity selectedLevel={selectedLevel} activity={activity} />
      )}
      <BookmarkList bookmarks={bookmarks} onRemoveBookmark={onRemoveBookmark} />
    </section>
  );
}
