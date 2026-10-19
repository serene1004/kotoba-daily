import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Link, Route, Routes, useBlocker, useLocation, useNavigate } from 'react-router-dom';
import styles from './App.module.css';
import { Dashboard } from './components/Dashboard';
import { StudySession } from './components/StudySession';
import { StudyExitDialog } from './components/StudyExitDialog';
import { Updates } from './components/Updates';
import { useStudyProgress } from './hooks/useStudyProgress';
import { useVocabulary } from './hooks/useVocabulary';
import { readStorage, writeStorage } from './lib/study';
import type { SessionDifficulty } from './types';

type Theme = 'light' | 'dark';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [level, setLevel] = useState<'N5' | 'N4' | 'N3'>(() => {
    const saved = readStorage<string>('studyLevel', 'N5');
    return saved === 'N4' || saved === 'N3' ? saved : 'N5';
  });
  const [studyStarted, setStudyStarted] = useState(false);
  const [sessionSize, setSessionSize] = useState<5 | 10>(() => {
    const saved = readStorage<number>('studySetSize', 10);
    return saved === 5 ? 5 : 10;
  });
  const { words, loading, failedLevels } = useVocabulary();
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = readStorage<string>('theme', '');

    if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const {
    advance,
    bookmarks,
    correctCount,
    currentQuestSize,
    index,
    levelSummaries,
    quest,
    sessionDifficulty,
    word,
    recordAnswer,
    rateSessionDifficulty,
    removeBookmark,
    restartUnstartedQuest,
    startAnotherQuest,
    toggleBookmark,
  } = useStudyProgress(words, level, sessionSize);
  const isActiveStudy =
    location.pathname === '/study' && studyStarted && quest.length > 0 && index < quest.length;
  const blocker = useBlocker(isActiveStudy);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    writeStorage('theme', theme);
  }, [theme]);

  useEffect(() => writeStorage('studyLevel', level), [level]);
  useEffect(() => writeStorage('studySetSize', sessionSize), [sessionSize]);

  const startStudy = () => {
    if (quest.length > 0 && index >= quest.length) {
      startAnotherQuest();
    } else if (quest.length > 0 && index === 0 && currentQuestSize !== sessionSize) {
      restartUnstartedQuest();
    }
    setStudyStarted(true);
    navigate('/study');
  };

  const selectStudyLevel = (selectedLevel: 'N5' | 'N4' | 'N3') => setLevel(selectedLevel);

  const study = (
    <>
      <section className="page-heading">
        <p className="eyebrow">{level} VOCABULARY</p>
        <h1>{level} 단어 학습</h1>
      </section>
      {loading ? (
        <section className={styles.complete}>
          <p>오늘의 단어를 불러오는 중이에요.</p>
        </section>
      ) : !words.some((word) => word.jlptLevel === level) ? (
        <section className={styles.complete}>
          <h2>{failedLevels.includes(level) ? '단어를 불러오지 못했어요.' : '학습할 단어가 없어요.'}</h2>
          <p>
            {failedLevels.includes(level)
              ? '잠시 후 페이지를 새로고침해 주세요.'
              : `${level} 단어 데이터를 준비한 뒤 다시 시도해 주세요.`}
          </p>
        </section>
      ) : !studyStarted ? (
        <section className={styles.complete}>
          <p className="eyebrow">오늘 공부할 레벨</p>
          <h2>어떤 단어를 공부할까요?</h2>
          <p>선택한 JLPT 레벨의 단어로 오늘의 학습을 시작해요.</p>
          <div className={styles['level-options']} role="group" aria-label="JLPT 레벨 선택">
            {(['N5', 'N4', 'N3'] as const).map((option) => (
              <button
                key={option}
                className={`${styles['level-option']} ${level === option ? styles['level-selected'] : ''}`}
                type="button"
                aria-pressed={level === option}
                onClick={() => setLevel(option)}
              >
                {option}
              </button>
            ))}
          </div>
          <button
            className={`${styles.primary} button-primary`}
            type="button"
            onClick={() => setStudyStarted(true)}
          >
            {level} 단어 공부 시작하기
          </button>
        </section>
      ) : index >= quest.length && quest.length ? (
        <section className={styles.complete}>
          <h2>오늘의 학습을 마쳤어요.</h2>
          <strong className={styles['complete-score']}>
            {correctCount}/{quest.length}
          </strong>
          <p>
            이번 세트에서 맞힌 단어예요.
            <br />
            새로운 단어로 한 세트 더 학습할 수 있어요.
          </p>
          <div className={styles['difficulty-rating']}>
            <p>이번 학습은 어땠나요?</p>
            {sessionDifficulty ? (
              <span role="status">
                {sessionDifficulty === 'hard'
                  ? '이번 세트의 정답 단어를 내일 다시 복습할게요.'
                  : sessionDifficulty === 'easy'
                    ? '이번 세트의 정답 단어는 복습 간격을 늘렸어요.'
                    : '현재 복습 간격을 유지할게요.'}
              </span>
            ) : (
              <div role="group" aria-label="이번 학습 난이도 평가">
                {(
                  [
                    ['hard', '어려웠어요'],
                    ['okay', '적당했어요'],
                    ['easy', '쉬웠어요'],
                  ] as [SessionDifficulty, string][]
                ).map(([difficulty, label]) => (
                  <button
                    key={difficulty}
                    type="button"
                    onClick={() => rateSessionDifficulty(difficulty)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className={styles['complete-actions']}>
            <button className={styles.secondary} type="button" onClick={() => navigate('/')}>
              대시보드로 가기
            </button>
            <button
              className={`${styles.primary} button-primary`}
              type="button"
              onClick={startAnotherQuest}
            >
              다른 단어 더 공부하기
            </button>
          </div>
        </section>
      ) : (
        <StudySession
          word={word}
          progress={index}
          total={quest.length || 10}
          onAnswer={recordAnswer}
          onNext={advance}
          isBookmarked={Boolean(word && bookmarks.some((item) => item.id === word.id))}
          onToggleBookmark={toggleBookmark}
        />
      )}
    </>
  );

  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        <Link className={styles.logo} to="/">
          <img
            className={styles['logo-mark']}
            src={`${import.meta.env.BASE_URL}favicon.svg`}
            alt=""
          />
          <span>
            ことば <small>デイリー</small>
          </span>
        </Link>
        <div className={styles['header-actions']}>
          <button
            className={styles.updates}
            type="button"
            onClick={() => navigate(location.pathname === '/updates' ? '/' : '/updates')}
          >
            {location.pathname === '/updates' ? '홈으로 돌아가기' : 'RELEASE NOTES'}
          </button>
          <button
            className={styles['theme-toggle']}
            type="button"
            aria-label={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
            onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
          >
            {theme === 'dark' ? (
              <Sun aria-hidden="true" size={18} strokeWidth={1.8} />
            ) : (
              <Moon aria-hidden="true" size={18} strokeWidth={1.8} />
            )}
          </button>
        </div>
      </header>
      <Routes>
        <Route
          path="/"
          element={
            <Dashboard
              bookmarks={bookmarks}
              selectedLevel={level}
              sessionSize={sessionSize}
              resumeAvailable={index > 0 && index < quest.length}
              levelSummaries={levelSummaries}
              onRemoveBookmark={removeBookmark}
              onStudy={startStudy}
              onSelectLevel={selectStudyLevel}
              onSelectSessionSize={setSessionSize}
            />
          }
        />
        <Route path="/study" element={study} />
        <Route path="/updates" element={<Updates />} />
      </Routes>
      {blocker.state === 'blocked' && (
        <StudyExitDialog
          onContinue={() => blocker.reset?.()}
          onExit={() => blocker.proceed?.()}
        />
      )}
    </main>
  );
}

export default App;
