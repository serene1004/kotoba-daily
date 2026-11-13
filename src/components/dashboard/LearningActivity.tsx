import { ChevronDown } from 'lucide-react';
import styles from '../Dashboard.module.css';
import { ActivityCalendar } from './ActivityCalendar';
import { WeeklyActivityChart } from './WeeklyActivityChart';
import type { useDashboardActivity } from '../../hooks/useDashboardActivity';

type ActivityLevel = 'N5' | 'N4' | 'N3' | 'all';

type Props = {
  selectedLevel: ActivityLevel;
  activity: ReturnType<typeof useDashboardActivity>;
  onSelectLevel: (level: ActivityLevel) => void;
};

export function LearningActivity({ selectedLevel, activity, onSelectLevel }: Props) {
  const {
    completedDates,
    progressByDate,
    studiedCount,
    streak,
    today,
    todayStudied,
    weeklyCount,
    weeklyProgress,
  } = activity;

  return (
    <>
      <label className={styles['activity-toolbar']} htmlFor="activity-level">
        <span>집계 기준</span>
        <span className={styles['activity-select-wrap']}>
          <select
            id="activity-level"
            value={selectedLevel}
            onChange={(event) => onSelectLevel(event.target.value as ActivityLevel)}
          >
            <option value="all">전체 레벨</option>
            <option value="N5">N5</option>
            <option value="N4">N4</option>
            <option value="N3">N3</option>
          </select>
          <ChevronDown size={16} aria-hidden="true" />
        </span>
      </label>
      <div className={styles.stats}>
        <article>
          <b>{todayStudied}</b>
          <span>오늘 단어 학습 횟수</span>
        </article>
        <article>
          <b>{streak}</b>
          <span>이어진 학습일</span>
        </article>
        <article>
          <b>{studiedCount}</b>
          <span>누적 단어 학습 횟수</span>
        </article>
      </div>
      <ActivityCalendar
        today={today}
        progressByDate={progressByDate}
        completedDates={completedDates}
      />
      <WeeklyActivityChart days={weeklyProgress} weeklyCount={weeklyCount} />
    </>
  );
}
