export type Word = {
  id: string;
  jp: string;
  reading: string;
  meaningKo: string;
  meaningEn?: string;
  partOfSpeech?: string;
  jlptLevel?: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
  example?: { japanese: string; reading?: string; korean: string };
};

export type WordProgress = {
  correctCount: number;
  wrongCount: number;
  lastStudiedAt: string;
  nextReviewAt: string;
};
