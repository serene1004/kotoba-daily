import { useEffect, useMemo, useState } from 'react';
import type { Word, WordProgress } from '../types';
import { addDays, pickQuest, readStorage, reviewDelay, writeStorage } from '../lib/study';

const todayKey = () => new Date().toLocaleDateString('sv-SE');

export function useStudyProgress(words: Word[]) {
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
  const [quest, setQuest] = useState<string[]>(() => readStorage(`quest:${todayKey()}`, []));
  const [seen, setSeen] = useState<string[]>(() =>
    readStorage(`seen:${todayKey()}`, readStorage(`quest:${todayKey()}`, [])),
  );
  const [index, setIndex] = useState(() => readStorage(`progress:${todayKey()}`, 0));
  const [studied, setStudied] = useState(() =>
    readStorage(`studied:${todayKey()}`, readStorage(`progress:${todayKey()}`, 0)),
  );

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
    setQuest(readStorage(`quest:${day}`, []));
    setSeen(readStorage(`seen:${day}`, readStorage(`quest:${day}`, [])));
    setIndex(readStorage(`progress:${day}`, 0));
    setStudied(readStorage(`studied:${day}`, readStorage(`progress:${day}`, 0)));
  }, [day]);

  useEffect(() => {
    if (quest.length || !words.length) return;
    const nextQuest = pickQuest(words, known, progress, seen, day);
    const nextSeen = [...new Set([...seen, ...nextQuest])];
    setQuest(nextQuest);
    setSeen(nextSeen);
    writeStorage(`quest:${day}`, nextQuest);
    writeStorage(`seen:${day}`, nextSeen);
  }, [day, known, progress, quest.length, seen, words]);

  const bookmarks = useMemo(
    () => words.filter((word) => bookmarkIds.includes(word.id)),
    [bookmarkIds, words],
  );
  const word = words.find((item) => item.id === quest[index]);

  const advance = () => {
    const nextIndex = index + 1;
    const nextStudied = studied + 1;
    setIndex(nextIndex);
    setStudied(nextStudied);
    writeStorage(`progress:${day}`, nextIndex);
    writeStorage(`studied:${day}`, nextStudied);
  };

  const recordAnswer = (correct: boolean) => {
    if (!word) return;
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
    const nextQuest = pickQuest(words, known, progress, seen, day);
    if (!nextQuest.length) return;
    const nextSeen = [...new Set([...seen, ...nextQuest])];
    setQuest(nextQuest);
    setSeen(nextSeen);
    setIndex(0);
    writeStorage(`quest:${day}`, nextQuest);
    writeStorage(`seen:${day}`, nextSeen);
    writeStorage(`progress:${day}`, 0);
  };

  return {
    bookmarks,
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
