import styles from '../Dashboard.module.css';

type Props = {
  selectedLevel: 'N5' | 'N4' | 'N3';
  sessionSize: 5 | 10;
  resumeAvailable: boolean;
  studiedCount: number;
  todayStudied: number;
  levelSummaries: { level: 'N5' | 'N4' | 'N3'; total: number; learned: number; dueReviews: number }[];
  onStudy: () => void;
  onSelectLevel: (level: 'N5' | 'N4' | 'N3') => void;
  onSelectSessionSize: (size: 5 | 10) => void;
};

export function LearningLevelSelector({
  selectedLevel,
  sessionSize,
  resumeAvailable,
  studiedCount,
  todayStudied,
  levelSummaries,
  onStudy,
  onSelectLevel,
  onSelectSessionSize,
}: Props) {
  const selectedLevelAvailable = levelSummaries.some(
    (summary) => summary.level === selectedLevel && summary.total > 0,
  );

  return (
    <section className={styles.learning} aria-labelledby="learning-title">
      <div className={styles['learning-heading']}>
        <p className="eyebrow">{studiedCount ? 'MY LEARNING' : 'FIRST STEP'}</p>
        <h2 id="learning-title">공부할 레벨을 선택해요</h2>
        <p>
          {studiedCount && todayStudied
            ? `오늘 ${todayStudied}개를 학습했어요. 이어서 공부해 볼까요?`
            : '레벨을 고르고 오늘의 단어 학습을 시작해요.'}
        </p>
      </div>
      <div className={styles['level-list']}>
        {levelSummaries.map(({ level, total, learned, dueReviews }) => {
          const percent = total ? Math.round((learned / total) * 100) : 0;
          return (
            <article key={level} className={styles['level-row']}>
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
              <button
                className={selectedLevel === level ? styles['level-selected'] : undefined}
                type="button"
                disabled={total === 0}
                aria-pressed={selectedLevel === level}
                onClick={() => onSelectLevel(level)}
              >
                {total === 0 ? '데이터 없음' : selectedLevel === level ? '선택됨' : '선택'}
              </button>
            </article>
          );
        })}
      </div>
      <div className={styles['session-size']} role="group" aria-label="세트당 학습 단어 수">
        <span>한 세트 학습량</span>
        {([5, 10] as const).map((size) => (
          <button
            key={size}
            className={sessionSize === size ? styles['session-size-selected'] : undefined}
            type="button"
            aria-pressed={sessionSize === size}
            onClick={() => onSelectSessionSize(size)}
          >
            {size}개
          </button>
        ))}
      </div>
      <button
        className={`${styles.primary} button-primary`}
        type="button"
        disabled={!selectedLevelAvailable}
        onClick={onStudy}
      >
        {selectedLevelAvailable
          ? `${selectedLevel} ${resumeAvailable ? '학습 이어하기' : '단어 공부 시작하기'}`
          : `${selectedLevel} 데이터 없음`}
      </button>
    </section>
  );
}
