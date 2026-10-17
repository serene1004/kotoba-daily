import { useEffect, useMemo, useState } from 'react';
import type { Word, WordProgress } from '../types';
import { addDays, pickQuest, readStorage, reviewDelay, writeStorage } from '../lib/study';

const todayKey = () => new Date().toLocaleDateString('sv-SE');
const readLevelStorage = <T>(key: string, level: string, day: string, fallback: T) =>
  readStorage(`${key}:${level}:${day}`, level === 'N5' ? readStorage(`${key}:${day}`, fallback) : fallback);

export function useStudyProgress(words: Word[], level: string = 'N5') {
  const studyWords = useMemo(() => words.filter((word) => word.jlptLevel === level), [level, words]);
  const [day, setDay] = useState(todayKey);
  const [known, setKnown] = useState<string[]>(() => readStorage('known', []));
  const [bookmarkIds, setBookmarkIds] = useState<string[]>(() => {
    const savedIds = readStorage<unknown>('bookmarkIds', null);
    if (Array.isArray(savedIds) && savedIds.every((id) => typeof id === 'string')) {
      return savedIds;
    }

    return readStorage<Word[]>('bookmarks', [])
      .map((word) => word.id)
      .filter(Boolean);
  });
  const [progress, setProgress] = useState<Record<string, WordProgress>>(() =>
    readStorage('wordProgress', {}),
  );
  const questKey = `${level}:${day}`;
  const [quest, setQuest] = useState<string[]>(() => readLevelStorage('quest', level, todayKey(), []));
  const [seen, setSeen] = useState<string[]>(() =>
    readLevelStorage('seen', level, todayKey(), readLevelStorage('quest', level, todayKey(), [])),
  );
  const [index, setIndex] = useState(() => readLevelStorage('progress', level, todayKey(), 0));
  const [studied, setStudied] = useState(() =>
    readLevelStorage('studied', level, todayKey(), readLevelStorage('progress', level, todayKey(), 0)),
  );
  const [correctCount, setCorrectCount] = useState(() => readLevelStorage('correct', level, todayKey(), 0));

  useEffect(() => {
    const refreshDay = () => setDay((current) => (current === todayKey() ? current : todayKey()));
    const timer = window.setInterval(refreshDay, 60_000);
    window.addEventListener('focus', refreshDay);
    document.addEventListener('visibilitychange', refreshDay);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', refreshDay);
      document.removeEventListener('visibilitychange', refreshDay);
    };
  }, []);

  useEffect(() => {
    setQuest(readLevelStorage('quest', level, day, []));
    setSeen(readLevelStorage('seen', level, day, readLevelStorage('quest', level, day, [])));
    setIndex(readLevelStorage('progress', level, day, 0));
    setStudied(readLevelStorage('studied', level, day, readLevelStorage('progress', level, day, 0)));
    setCorrectCount(readLevelStorage('correct', level, day, 0));
  }, [day, level]);

  useEffect(() => {
    if (quest.length || !words.length) return;
    const nextQuest = pickQuest(studyWords, known, progress, seen, day);
    const nextSeen = [...new Set([...seen, ...nextQuest])];
    setQuest(nextQuest);
    setSeen(nextSeen);
    writeStorage(`quest:${questKey}`, nextQuest);
    writeStorage(`seen:${questKey}`, nextSeen);
  }, [day, known, progress, quest.length, seen, studyWords]);

  const bookmarks = useMemo(
    () => words.filter((word) => bookmarkIds.includes(word.id)),
    [bookmarkIds, words],
  );
  const levelSummaries = useMemo(
    () =>
      (['N5', 'N4', 'N3'] as const).map((jlptLevel) => {
        const levelWords = words.filter((item) => item.jlptLevel === jlptLevel);
        return {
          level: jlptLevel,
          total: levelWords.length,
          learned: levelWords.filter(({ id }) => progress[id]?.correctCount || progress[id]?.wrongCount)
            .length,
          dueReviews: levelWords.filter(
            ({ id }) => progress[id]?.nextReviewAt && progress[id].nextReviewAt <= day,
          ).length,
        };
      }),
    [day, progress, words],
  );
  const word = studyWords.find((item) => item.id === quest[index]);

  const advance = () => {
    const nextIndex = index + 1;
    const nextStudied = studied + 1;
    setIndex(nextIndex);
    setStudied(nextStudied);
    writeStorage(`progress:${questKey}`, nextIndex);
    writeStorage(`studied:${questKey}`, nextStudied);
  };

  const recordAnswer = (correct: boolean) => {
    if (!word) return;
    if (correct) {
      setCorrectCount((current) => {
        const next = current + 1;
        writeStorage(`correct:${questKey}`, next);
        return next;
      });
    }
    const nextKnown = correct
      ? [...new Set([...known, word.id])]
      : known.filter((id) => id !== word.id);
    setKnown(nextKnown);
    writeStorage('known', nextKnown);

    setProgress((current) => {
      const previous = current[word.id] || { correctCount: 0, wrongCount: 0 };
      const next = {
        ...current,
        [word.id]: {
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

  const toggleBookmark = () => {
    if (!word) return;
    const nextIds = bookmarkIds.includes(word.id)
      ? bookmarkIds.filter((id) => id !== word.id)
      : [...bookmarkIds, word.id];
    setBookmarkIds(nextIds);
    writeStorage('bookmarkIds', nextIds);
  };

  const removeBookmark = (id: string) => {
    const nextIds = bookmarkIds.filter((bookmarkId) => bookmarkId !== id);
    setBookmarkIds(nextIds);
    writeStorage('bookmarkIds', nextIds);
  };

  const startAnotherQuest = () => {
    const nextQuest = pickQuest(studyWords, known, progress, seen, day);
    if (!nextQuest.length) return;
    const nextSeen = [...new Set([...seen, ...nextQuest])];
    setQuest(nextQuest);
    setSeen(nextSeen);
    setIndex(0);
    setCorrectCount(0);
    writeStorage(`quest:${questKey}`, nextQuest);
    writeStorage(`seen:${questKey}`, nextSeen);
    writeStorage(`progress:${questKey}`, 0);
    writeStorage(`correct:${questKey}`, 0);
  };

  return {
    bookmarks,
    levelSummaries,
    correctCount,
    index,
    quest,
    studied,
    word,
    recordAnswer,
    advance,
    toggleBookmark,
    removeBookmark,
    startAnotherQuest,
  };
}
