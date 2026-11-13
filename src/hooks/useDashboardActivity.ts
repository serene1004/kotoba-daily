import { readProgressByDate } from '../lib/study';

const weekdays = '일월화수목금토'.split('');
const dateKey = (date: Date) => date.toLocaleDateString('sv-SE');
const DAILY_GOAL = 10;

export function useDashboardActivity(selectedLevel?: 'N5' | 'N4' | 'N3') {
  const today = new Date();
  const progressByDate = readProgressByDate(selectedLevel);
  const studiedCount = Object.values(progressByDate).reduce((total, count) => total + count, 0);
  const todayStudied = progressByDate[dateKey(today)] || 0;
  const weeklyProgress = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    const key = dateKey(date);
    return { date: key, label: weekdays[date.getDay()], progress: progressByDate[key] || 0 };
  });
  const completedDates = new Set(
    Object.entries(progressByDate)
      .filter(([, count]) => count >= DAILY_GOAL)
      .map(([date]) => date),
  );
  const streak = (() => {
    let count = 0;
    const date = new Date(today);
    if (!todayStudied) date.setDate(date.getDate() - 1);
    while (progressByDate[dateKey(date)]) {
      count += 1;
      date.setDate(date.getDate() - 1);
    }
    return count;
  })();

  return {
    completedDates,
    progressByDate,
    studiedCount,
    streak,
    today,
    todayStudied,
    weeklyCount: weeklyProgress.reduce((total, day) => total + day.progress, 0),
    weeklyProgress,
  };
}
