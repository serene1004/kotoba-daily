import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import styles from './App.module.css';
import { Dashboard } from './components/Dashboard';
import { StudySession } from './components/StudySession';
import { useVocabulary } from './hooks/useVocabulary';
import type { Word } from './types';

const day = new Date().toLocaleDateString('sv-SE');
type Theme = 'light' | 'dark';
const read = <T,>(key: string, fallback: T): T =>
  JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
const pickQuest = (words: Word[], excluded: string[]) => {
  const excludedIds = new Set(excluded);
  return words
    .filter((word) => !excludedIds.has(word.id))
    .sort(() => Math.random() - 0.5)
    .slice(0, 10)
    .map((word) => word.id);
};

function App() {
  const navigate = useNavigate();
  const words = useVocabulary();
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const [known, setKnown] = useState<string[]>(() => read('known', []));
  const [bookmarks, setBookmarks] = useState<Word[]>(() => read('bookmarks', []));
  const [quest, setQuest] = useState<string[]>(() => read(`quest:${day}`, []));
  const [seen, setSeen] = useState<string[]>(() => read(`seen:${day}`, read(`quest:${day}`, [])));
  const [index, setIndex] = useState(() => read(`progress:${day}`, 0));
  const [studied, setStudied] = useState(() => read(`studied:${day}`, read(`progress:${day}`, 0)));

  useEffect(() => {
    if (quest.length || !words.length) return;
    const nextQuest = pickQuest(words, [...known, ...seen]);
    const nextSeen = [...new Set([...seen, ...nextQuest])];
    setQuest(nextQuest);
    setSeen(nextSeen);
    localStorage.setItem(`quest:${day}`, JSON.stringify(nextQuest));
    localStorage.setItem(`seen:${day}`, JSON.stringify(nextSeen));
  }, [known, quest.length, seen, words]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const word = words.find((item) => item.id === quest[index]);
  const advance = () => {
    const nextIndex = index + 1;
    const nextStudied = studied + 1;
    setIndex(nextIndex);
    setStudied(nextStudied);
    localStorage.setItem(`progress:${day}`, JSON.stringify(nextIndex));
    localStorage.setItem(`studied:${day}`, JSON.stringify(nextStudied));
  };
  const remember = () => {
    if (word) {
      const nextKnown = [...new Set([...known, word.id])];
      setKnown(nextKnown);
      localStorage.setItem('known', JSON.stringify(nextKnown));
    }
    advance();
  };
  const bookmark = () => {
    if (word && !bookmarks.some((item) => item.id === word.id)) {
      const nextBookmarks = [...bookmarks, word];
      setBookmarks(nextBookmarks);
      localStorage.setItem('bookmarks', JSON.stringify(nextBookmarks));
    }
    advance();
  };
  const removeBookmark = (id: string) => {
    const nextBookmarks = bookmarks.filter((item) => item.id !== id);
    setBookmarks(nextBookmarks);
    localStorage.setItem('bookmarks', JSON.stringify(nextBookmarks));
  };
  const startAnotherQuest = () => {
    const nextQuest = pickQuest(words, [...known, ...seen]);
    if (!nextQuest.length) return;
    const nextSeen = [...new Set([...seen, ...nextQuest])];
    setQuest(nextQuest);
    setSeen(nextSeen);
    setIndex(0);
    localStorage.setItem(`quest:${day}`, JSON.stringify(nextQuest));
    localStorage.setItem(`seen:${day}`, JSON.stringify(nextSeen));
    localStorage.setItem(`progress:${day}`, JSON.stringify(0));
  };

  const study = (
    <>
      <section className="page-heading">
        <p className="eyebrow">하루 10단어. 부담 없는</p>
        <h1>오늘의 일본어</h1>
      </section>
      {index >= quest.length && quest.length ? (
        <section className={styles.complete}>
          <h2>오늘의 학습을 마쳤어요.</h2>
          <p>새로운 단어로 한 세트 더 학습할 수 있어요.</p>
          <div className={styles['complete-actions']}>
            <button className={styles.secondary} type="button" onClick={() => navigate('/')}>
              대시보드로 가기
            </button>
            <button className={styles.primary} type="button" onClick={startAnotherQuest}>
              다른 단어 더 공부하기
            </button>
          </div>
        </section>
      ) : (
        <StudySession
          word={word}
          progress={index}
          total={quest.length || 10}
          onBookmark={bookmark}
          onRemember={remember}
        />
      )}
    </>
  );

  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        <button className={`${styles.logo} plain`} type="button" onClick={() => navigate('/')}>
          <img className={styles['logo-mark']} src="/favicon.svg" alt="" />
          <span>
            ことば <small>デイリー</small>
          </span>
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
      </Routes>
    </main>
  );
}

export default App;
