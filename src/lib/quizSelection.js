export function chooseQuizQuestions(words, level, size, records, random = Math.random) {
  const remaining = words.filter((word) => word.jlptLevel === level);
  const selected = [];

  while (remaining.length && selected.length < size) {
    const weights = remaining.map((word) => (records[word.id]?.lastCorrect === true ? 2 : 8));
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let target = random() * totalWeight;
    const chosenIndex = weights.findIndex((weight) => {
      target -= weight;
      return target < 0;
    });
    selected.push(remaining.splice(chosenIndex < 0 ? remaining.length - 1 : chosenIndex, 1)[0]);
  }

  return selected;
}

export function recordQuizAnswer(records, wordId, isCorrect) {
  const previous = records[wordId];
  return {
    ...records,
    [wordId]: {
      correctCount: (Number(previous?.correctCount) || 0) + Number(isCorrect),
      wrongCount: (Number(previous?.wrongCount) || 0) + Number(!isCorrect),
      lastCorrect: isCorrect,
    },
  };
}
