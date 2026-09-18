export type Release = {
  version?: string;
  date: string;
  title: string;
  changes: string[];
};

export const releases: Release[] = [
  {
    version: '0.1.1',
    date: '2026.09.18',
    title: '학습 버튼 색상을 수정했어요',
    changes: ['배포 후 발견된 학습 버튼 색상 문제를 수정했어요.'],
  },
  {
    version: '0.1.0',
    date: '2026.09.18',
    title: '더 편하게 공부해요',
    changes: [
      '단어마다 한국어 뜻, 품사, 예문을 함께 확인할 수 있어요.',
      '새 단어와 다시 볼 단어를 섞어 매일 학습할 수 있어요.',
      '입력한 뜻과 사전 뜻을 비교하고, 헷갈리는 단어는 단어장에 저장할 수 있어요.',
    ],
  },
  {
    date: '2026.08.02',
    title: '처음 서비스를 배포했어요',
    changes: [
      'N5 단어를 랜덤으로 제공하는 기본 학습 기능을 시작했어요.',
      '후리가나 보기, 단어장 저장, 다크 모드를 추가했어요.',
    ],
  },
];
