import { ExternalLink, Trash2 } from 'lucide-react';
import { Furigana } from './Furigana';
import styles from './Dashboard.module.css';
import type { Word } from '../types';
import { readProgressByDate } from '../lib/study';

type Props = {
  bookmarks: Word[];
  onRemoveBookmark: (id: string) => void;
  onStudy: () => void;
};

const weekdays = '일월화수목금토'.split('');
const dateKey = (date: Date) => date.toLocaleDateString('sv-SE');

export function Dashboard({ bookmarks, onRemoveBookmark, onStudy }: Props) {
  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const progressByDate = readProgressByDate();
  const completedDates = Object.entries(progressByDate)
    .filter(([, progress]) => progress >= 10)
    .map(([date]) => date);
  const studiedCount = Object.values(progressByDate).reduce(
    (total, progress) => total + progress,
    0,
  );
  const days = Array.from({ length: monthEnd.getDate() }, (_, index) => index + 1);
  const weeklyProgress = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));

    return {
      date: dateKey(date),
      label: weekdays[date.getDay()],
      progress: progressByDate[dateKey(date)] || 0,
    };
  });
  const maxWeeklyProgress = Math.max(...weeklyProgress.map((day) => day.progress), 1);
  const todayStudied = progressByDate[dateKey(today)] || 0;
  const streak = (() => {
    let count = 0;
    const date = new Date(today);

    while (progressByDate[dateKey(date)]) {
      count += 1;
      date.setDate(date.getDate() - 1);
    }

    return count;
  })();

  return (
    <section>
      <div className="page-heading">
        <div>
          <p className="eyebrow">KOTOBA DAILY</p>
          <h1>오늘의 일본어</h1>
        </div>
      </div>

      {studiedCount ? (
        <>
          <section className={styles['study-start']}>
            <div>
              <b>오늘 {todayStudied}개를 학습했어요.</b>
              <span>하루 10단어, 부담 없이 이어가요.</span>
            </div>
            <button className={`${styles.primary} button-primary`} type="button" onClick={onStudy}>
              공부하러 가기
            </button>
          </section>

          <div className={styles.stats}>
            <article>
              <b>{todayStudied}</b>
              <span>오늘 학습한 단어</span>
            </article>
            <article>
              <b>{streak}</b>
              <span>이어진 학습일</span>
            </article>
            <article>
              <b>{studiedCount}</b>
              <span>전체 학습한 단어</span>
            </article>
          </div>

          <section className={styles['activity-calendar']} aria-label="이번 달 학습 달력">
            <h2>
              {today.getFullYear()}년 {today.getMonth() + 1}월
            </h2>
            <div className={styles['weekday-labels']} aria-hidden="true">
              {weekdays.map((weekday) => (
                <span key={weekday}>{weekday}</span>
              ))}
            </div>
            <div className={styles['calendar-days']}>
              {Array.from({ length: monthStart.getDay() }, (_, index) => (
                <i key={`empty-${index}`} />
              ))}
              {days.map((number) => {
                const date = new Date(today.getFullYear(), today.getMonth(), number);
                const key = dateKey(date);
                const complete = completedDates.includes(key);
                const isToday = key === dateKey(today);

                return (
                  <span
                    key={key}
                    className={`${complete ? styles.studied : ''} ${isToday ? styles['calendar-today'] : ''}`}
                  >
                    {number}
                    {complete && <b aria-label="학습 완료">★</b>}
                  </span>
                );
              })}
            </div>
          </section>

          <section className={styles['weekly-chart']} aria-label="최근 7일 학습량">
            <div className={styles['weekly-chart-head']}>
              <h2>이번 주 학습</h2>
              <span>학습한 단어</span>
            </div>
            <div className={styles['chart-columns']}>
              {weeklyProgress.map((day) => (
                <div key={day.date} className={styles['chart-column']}>
                  <span className={styles['chart-value']}>{day.progress || ''}</span>
                  <div className={styles['chart-track']}>
                    <i
                      className={styles['chart-bar']}
                      style={{ height: `${(day.progress / maxWeeklyProgress) * 100}%` }}
                    />
                  </div>
                  <span className={styles['chart-day']}>{day.label}</span>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : (
        <section className={styles.onboarding}>
          <p className="eyebrow">FIRST STEP</p>
          <h2>오늘의 첫 10단어를 시작해 볼까요?</h2>
          <p>뜻을 적고, 사전 뜻을 확인한 뒤, 헷갈리는 단어만 단어장에 남겨요.</p>
          <button className={`${styles.primary} button-primary`} type="button" onClick={onStudy}>
            첫 학습 시작하기
          </button>
        </section>
      )}

      {bookmarks.length > 0 && (
        <section className={styles.bookmarks}>
          <div className={styles['bookmarks-heading']}>
            <div>
              <p className="eyebrow">WORD LIST</p>
              <h2>단어장</h2>
            </div>
            <b>{bookmarks.length}</b>
          </div>
          <div className={styles['bookmark-list']}>
            {bookmarks.map((word) => (
              <article key={word.id} className={styles['bookmark-item']}>
                <div>
                  <strong>
                    <Furigana expression={word.jp} reading={word.reading} />
                  </strong>
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
                    <ExternalLink size={17} aria-hidden="true" />
                  </a>
                  <button
                    className={`${styles['icon-button']} tooltip`}
                    type="button"
                    onClick={() => onRemoveBookmark(word.id)}
                    aria-label="단어장에서 제거"
                    data-tooltip="단어장에서 제거"
                  >
                    <Trash2 size={17} aria-hidden="true" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </section>
  );
}
