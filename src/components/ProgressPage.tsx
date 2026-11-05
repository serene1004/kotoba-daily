import { useDashboardActivity } from '../hooks/useDashboardActivity';
import { LearningActivity } from './dashboard/LearningActivity';
import styles from './Dashboard.module.css';

type LevelSummary = {
  level: 'N5' | 'N4' | 'N3';
  total: number;
  learned: number;
  dueReviews: number;
};

type Props = {
  selectedLevel: 'N5' | 'N4' | 'N3';
  levelSummaries: LevelSummary[];
};

export function ProgressPage({ selectedLevel, levelSummaries }: Props) {
  const activity = useDashboardActivity(selectedLevel);

  return (
    <section>
      <div className="page-heading">
        <p className="eyebrow">LEARNING STATISTICS</p>
        <h1>학습 통계</h1>
      </div>
      <section className={styles.learning} aria-labelledby="level-progress-title">
        <div className={styles['learning-heading']}>
          <p className="eyebrow">JLPT VOCABULARY</p>
          <h2 id="level-progress-title">레벨별 학습 현황</h2>
        </div>
        <div className={styles['level-list']}>
          {levelSummaries.map(({ level, total, learned, dueReviews }) => {
            const percent = total ? Math.round((learned / total) * 100) : 0;
            return (
              <article
                key={level}
                className={`${styles['level-row']} ${styles['level-progress-row']}`}
              >
                <div className={styles['level-name']}>
                  <strong>{level}</strong>
                  <span>
                    {learned.toLocaleString()} / {total.toLocaleString()} 단어 · {percent}%
                  </span>
                </div>
                <div
                  className={styles['level-track']}
                  role="progressbar"
                  aria-label={`${level} 학습 진도`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={percent}
                >
                  <i style={{ width: `${percent}%` }} />
                </div>
                <span className={dueReviews ? styles['review-due'] : styles['review-clear']}>
                  {dueReviews ? `복습 ${dueReviews}개` : '복습 없음'}
                </span>
              </article>
            );
          })}
        </div>
      </section>
      <LearningActivity selectedLevel={selectedLevel} activity={activity} />
    </section>
  );
}
