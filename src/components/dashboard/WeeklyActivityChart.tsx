import styles from '../Dashboard.module.css';

type DayProgress = { date: string; label: string; progress: number };
type Props = { days: DayProgress[]; weeklyCount: number };
const DAILY_GOAL = 10;
const WEEKLY_GOAL = DAILY_GOAL * 7;

export function WeeklyActivityChart({ days, weeklyCount }: Props) {
  return (
    <section className={styles['weekly-chart']} aria-label="최근 7일 학습량">
      <div className={styles['weekly-chart-head']}>
        <h2>최근 7일 학습</h2>
        <span>{weeklyCount} / {WEEKLY_GOAL}회 · 하루 목표 {DAILY_GOAL}회</span>
      </div>
      <div className={styles['chart-columns']}>
        {days.map((day) => (
          <div key={day.date} className={styles['chart-column']} role="group" aria-label={`${day.date}, ${day.progress}회 학습`}>
            <span className={styles['chart-value']}>{day.progress}</span>
            <div className={styles['chart-track']}>
              <i
                className={styles['chart-bar']}
                style={{ height: `${Math.min((day.progress / 15) * 100, 100)}%` }}
              />
            </div>
            <span className={styles['chart-day']}>{day.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
