import styles from '../Dashboard.module.css';
import { ActivityCalendar } from './ActivityCalendar';
import { WeeklyActivityChart } from './WeeklyActivityChart';
import type { useDashboardActivity } from '../../hooks/useDashboardActivity';

type Props = {
  selectedLevel: 'N5' | 'N4' | 'N3';
  activity: ReturnType<typeof useDashboardActivity>;
};

export function LearningActivity({ selectedLevel, activity }: Props) {
  const {
    completedDates,
    progressByDate,
    setShowAllLevels,
    showAllLevels,
    studiedCount,
    streak,
    today,
    todayStudied,
    weeklyCount,
    weeklyProgress,
  } = activity;

  return (
    <>
      <div className={styles['activity-toolbar']} aria-label="학습 기록 집계 기준">
        <span>집계 기준</span>
        <div role="group" aria-label="학습 기록 범위">
          <button
            type="button"
            aria-pressed={!showAllLevels}
            className={!showAllLevels ? styles['scope-selected'] : undefined}
            onClick={() => setShowAllLevels(false)}
          >
            선택 레벨 · {selectedLevel}
          </button>
          <button
            type="button"
            aria-pressed={showAllLevels}
            className={showAllLevels ? styles['scope-selected'] : undefined}
            onClick={() => setShowAllLevels(true)}
          >
            전체 레벨
          </button>
        </div>
      </div>
      <div className={styles.stats}>
        <article><b>{todayStudied}</b><span>오늘 단어 학습 횟수</span></article>
        <article><b>{streak}</b><span>이어진 학습일</span></article>
        <article><b>{studiedCount}</b><span>누적 단어 학습 횟수</span></article>
      </div>
      <ActivityCalendar today={today} progressByDate={progressByDate} completedDates={completedDates} />
      <WeeklyActivityChart days={weeklyProgress} weeklyCount={weeklyCount} />
    </>
  );
}
