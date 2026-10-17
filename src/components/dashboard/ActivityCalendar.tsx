import styles from '../Dashboard.module.css';

type Props = {
  today: Date;
  progressByDate: Record<string, number>;
  completedDates: Set<string>;
};

const weekdays = '일월화수목금토'.split('');
const dateKey = (date: Date) => date.toLocaleDateString('sv-SE');
const DAILY_GOAL = 10;

export function ActivityCalendar({ today, progressByDate, completedDates }: Props) {
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const days = Array.from({ length: monthEnd.getDate() }, (_, index) => index + 1);

  return (
    <section className={styles['activity-calendar']} aria-label="이번 달 학습 달력">
      <div className={styles['calendar-header']}>
        <h2>
          {today.getFullYear()}년 {today.getMonth() + 1}월
        </h2>
        <div className={styles['calendar-legend']} aria-label="날짜별 학습량 범례">
          <span>학습 없음</span><i className={styles['activity-low']} /><span>1–4회</span>
          <i className={styles['activity-medium']} /><span>5–9회</span><i className={styles['activity-high']} /><span>10회 이상</span>
          <span>★ 목표 달성</span>
        </div>
      </div>
      <div className={styles['weekday-labels']} aria-hidden="true">
        {weekdays.map((weekday) => <span key={weekday}>{weekday}</span>)}
      </div>
      <div className={styles['calendar-days']}>
        {Array.from({ length: monthStart.getDay() }, (_, index) => <i key={`empty-${index}`} />)}
        {days.map((number) => {
          const date = new Date(today.getFullYear(), today.getMonth(), number);
          const key = dateKey(date);
          const complete = completedDates.has(key);
          const isToday = key === dateKey(today);
          const count = progressByDate[key] || 0;
          const intensity = count >= DAILY_GOAL ? 'high' : count >= 5 ? 'medium' : count > 0 ? 'low' : 'none';

          return (
            <span
              key={key}
              role="img"
              className={`${styles[`activity-${intensity}`]} ${complete ? styles.studied : ''} ${isToday ? styles['calendar-today'] : ''}`}
              title={`${key}: ${count}회 학습`}
              aria-label={`${today.getMonth() + 1}월 ${number}일, ${count}회 학습${complete ? ', 하루 목표 달성' : ''}`}
            >
              {number}
              {complete && <b aria-label="학습 완료">★</b>}
            </span>
          );
        })}
      </div>
    </section>
  );
}
