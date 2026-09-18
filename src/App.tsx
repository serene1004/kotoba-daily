import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import styles from './App.module.css';
import { Dashboard } from './components/Dashboard';
import { StudySession } from './components/StudySession';
import { Updates } from './components/Updates';
import { useVocabulary } from './hooks/useVocabulary';
import { addDays, pickQuest, readStorage, reviewDelay, writeStorage } from './lib/study';
import type { Word, WordProgress } from './types';

const day = new Date().toLocaleDateString('sv-SE');
type Theme = 'light' | 'dark';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { words, loading, error } = useVocabulary();
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = readStorage<string>('theme', '');

    if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const [known, setKnown] = useState<string[]>(() => readStorage('known', []));
  const [bookmarks, setBookmarks] = useState<Word[]>(() => readStorage('bookmarks', []));
  const [progress, setProgress] = useState<Record<string, WordProgress>>(() =>
    readStorage('wordProgress', {}),
  );
  const [quest, setQuest] = useState<string[]>(() => readStorage(`quest:${day}`, []));
  const [seen, setSeen] = useState<string[]>(() =>
    readStorage(`seen:${day}`, readStorage(`quest:${day}`, [])),
  );
  const [index, setIndex] = useState(() => readStorage(`progress:${day}`, 0));
  const [studied, setStudied] = useState(() =>
    readStorage(`studied:${day}`, readStorage(`progress:${day}`, 0)),
  );

  useEffect(() => {
    if (quest.length || !words.length) return;
    const nextQuest = pickQuest(words, known, bookmarks, progress, seen, day);
    const nextSeen = [...new Set([...seen, ...nextQuest])];
    setQuest(nextQuest);
    setSeen(nextSeen);
    writeStorage(`quest:${day}`, nextQuest);
    writeStorage(`seen:${day}`, nextSeen);
  }, [bookmarks, known, progress, quest.length, seen, words]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    writeStorage('theme', theme);
  }, [theme]);

  const word = words.find((item) => item.id === quest[index]);
  const advance = () => {
    const nextIndex = index + 1;
    const nextStudied = studied + 1;
    setIndex(nextIndex);
    setStudied(nextStudied);
    writeStorage(`progress:${day}`, nextIndex);
    writeStorage(`studied:${day}`, nextStudied);
  };
  const updateProgress = (wordId: string, correct: boolean) => {
    setProgress((current) => {
      const previous = current[wordId] || { correctCount: 0, wrongCount: 0 };
      const next = {
        ...current,
        [wordId]: {
          correctCount: previous.correctCount + (correct ? 1 : 0),
          wrongCount: previous.wrongCount + (correct ? 0 : 1),
          lastStudiedAt: day,
          nextReviewAt: addDays(day, correct ? reviewDelay(previous.correctCount + 1) : 1),
        },
      };
      writeStorage('wordProgress', next);
      return next;
    });
  };
  const recordAnswer = (correct: boolean) => {
    if (!word) return;
    if (correct) {
      const nextKnown = [...new Set([...known, word.id])];
      setKnown(nextKnown);
      writeStorage('known', nextKnown);
    } else {
      const nextKnown = known.filter((id) => id !== word.id);
      setKnown(nextKnown);
      writeStorage('known', nextKnown);
    }
    updateProgress(word.id, correct);
  };
  const toggleBookmark = () => {
    if (!word) return;
    const nextBookmarks = bookmarks.some((item) => item.id === word.id)
      ? bookmarks.filter((item) => item.id !== word.id)
      : [...bookmarks, word];
    setBookmarks(nextBookmarks);
    writeStorage('bookmarks', nextBookmarks);
  };
  const removeBookmark = (id: string) => {
    const nextBookmarks = bookmarks.filter((item) => item.id !== id);
    setBookmarks(nextBookmarks);
    writeStorage('bookmarks', nextBookmarks);
  };
  const startAnotherQuest = () => {
    const nextQuest = pickQuest(words, known, bookmarks, progress, seen, day);
    if (!nextQuest.length) return;
    const nextSeen = [...new Set([...seen, ...nextQuest])];
    setQuest(nextQuest);
    setSeen(nextSeen);
    setIndex(0);
    writeStorage(`quest:${day}`, nextQuest);
    writeStorage(`seen:${day}`, nextSeen);
    writeStorage(`progress:${day}`, 0);
  };

  const study = (
    <>
      <section className="page-heading">
        <p className="eyebrow">하루 10단어. 부담 없는</p>
        <h1>오늘의 일본어</h1>
      </section>
      {loading ? (
        <section className={styles.complete}>
          <p>오늘의 단어를 불러오는 중이에요.</p>
        </section>
      ) : error ? (
        <section className={styles.complete}>
          <h2>단어를 불러오지 못했어요.</h2>
          <p>잠시 후 페이지를 새로고침해 주세요.</p>
        </section>
      ) : !words.length ? (
        <section className={styles.complete}>
          <h2>학습할 단어가 없어요.</h2>
          <p>N5 단어 데이터를 준비한 뒤 다시 시도해 주세요.</p>
        </section>
      ) : index >= quest.length && quest.length ? (
        <section className={styles.complete}>
          <h2>오늘의 학습을 마쳤어요.</h2>
          <p>새로운 단어로 한 세트 더 학습할 수 있어요.</p>
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
        <button className={`${styles.logo} plain`} type="button" onClick={() => navigate('/')}>
          <img
            className={styles['logo-mark']}
            src={`${import.meta.env.BASE_URL}favicon.svg`}
            alt=""
          />
          <span>
            ことば <small>デイリー</small>
          </span>
        </button>
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
              onRemoveBookmark={removeBookmark}
              onStudy={() => navigate('/study')}
            />
          }
        />
        <Route path="/study" element={study} />
        <Route path="/updates" element={<Updates />} />
      </Routes>
    </main>
  );
}

export default App;
