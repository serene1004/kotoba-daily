export type KanaGroup = 'basic' | 'voiced' | 'youon';

export type KanaItem = {
  id: string;
  hiragana: string;
  katakana: string;
  romaji: string;
  group: KanaGroup;
};

const rows: [string, string[]][] = [
  [
    'basic',
    [
      'あいうえお|a,i,u,e,o',
      'かきくけこ|ka,ki,ku,ke,ko',
      'さしすせそ|sa,shi,su,se,so',
      'たちつてと|ta,chi,tsu,te,to',
      'なにぬねの|na,ni,nu,ne,no',
      'はひふへほ|ha,hi,fu,he,ho',
      'まみむめも|ma,mi,mu,me,mo',
      'やゆよ|ya,yu,yo',
      'らりるれろ|ra,ri,ru,re,ro',
      'わをん|wa,o,n',
    ],
  ],
  [
    'voiced',
    [
      'がぎぐげご|ga,gi,gu,ge,go',
      'ざじずぜぞ|za,ji,zu,ze,zo',
      'だぢづでど|da,ji,zu,de,do',
      'ばびぶべぼ|ba,bi,bu,be,bo',
      'ぱぴぷぺぽ|pa,pi,pu,pe,po',
    ],
  ],
  [
    'youon',
    [
      'きゃきゅきょ|kya,kyu,kyo',
      'ぎゃぎゅぎょ|gya,gyu,gyo',
      'しゃしゅしょ|sha,shu,sho',
      'じゃじゅじょ|ja,ju,jo',
      'ちゃちゅちょ|cha,chu,cho',
      'にゃにゅにょ|nya,nyu,nyo',
      'ひゃひゅひょ|hya,hyu,hyo',
      'びゃびゅびょ|bya,byu,byo',
      'ぴゃぴゅぴょ|pya,pyu,pyo',
      'みゃみゅみょ|mya,myu,myo',
      'りゃりゅりょ|rya,ryu,ryo',
    ],
  ],
];

const toKatakana = (text: string) =>
  Array.from(text, (character) => String.fromCharCode(character.charCodeAt(0) + 0x60)).join('');

export const kanaList: KanaItem[] = rows.flatMap(([group, groupRows]) =>
  groupRows.flatMap((row) => {
    const [characters, romanizations] = row.split('|');
    const glyphs = Array.from(characters);
    const units =
      group === 'youon'
        ? Array.from({ length: glyphs.length / 2 }, (_, index) =>
            glyphs.slice(index * 2, index * 2 + 2).join(''),
          )
        : glyphs;

    return units.map((hiragana, index) => ({
      id: `${group}-${hiragana}`,
      hiragana,
      katakana: toKatakana(hiragana),
      romaji: romanizations.split(',')[index],
      group: group as KanaGroup,
    }));
  }),
);

export const kanaGroups: { id: KanaGroup; label: string }[] = [
  { id: 'basic', label: '기본 46자' },
  { id: 'voiced', label: '탁음/반탁음' },
  { id: 'youon', label: '요음' },
];
