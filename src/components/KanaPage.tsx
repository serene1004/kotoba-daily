import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { RotateCcw } from 'lucide-react';
import { kanaGroups, kanaList } from '../data/kana';
import type { KanaGroup, KanaItem } from '../data/kana';
import { readStorage, writeStorage } from '../lib/study';
import styles from './KanaPage.module.css';

type Stroke = { d: string; transform?: string };
type Guide = { viewBox: string; strokes: Stroke[] };
type Script = 'hiragana' | 'katakana';
type StudyStages = Record<string, number>;

const progressKey = (script: Script, id: string) => `${script}:${id}`;

const readStudyStages = (): StudyStages => {
  const saved = readStorage<unknown>('kanaStudyStages', {});
  const stages: StudyStages = {};
  if (saved && typeof saved === 'object' && !Array.isArray(saved)) {
    Object.entries(saved).forEach(([key, value]) => {
      if (typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 3) {
        stages[key] = value;
      }
    });
  }

  (['hiragana', 'katakana'] as const).forEach((script) => {
    kanaList
      .filter((item) => item.group === 'voiced' || item.group === 'youon')
      .forEach((item) => {
        const currentKey = progressKey(script, item.id);
        if (stages[currentKey] !== undefined) return;

        if (item.group === 'voiced') {
          const previousGroup = item.romaji.startsWith('p') ? 'handakuten' : 'dakuten';
          const previousKey = progressKey(script, `${previousGroup}-${item.hiragana}`);
          if (stages[previousKey] !== undefined) stages[currentKey] = stages[previousKey];
          return;
        }

        const previousKeys = Array.from(item.hiragana, (glyph) =>
          progressKey(script, `youon-${glyph}`),
        );
        const previousStages = previousKeys.map((key) => stages[key]);
        if (previousStages.every((value): value is number => value !== undefined)) {
          stages[currentKey] = Math.min(...previousStages);
        }
      });
  });

  const legacy = readStorage<unknown>('kanaCompleted', []);
  if (Array.isArray(legacy)) {
    const completed = new Set(legacy.filter((item): item is string => typeof item === 'string'));
    (['hiragana', 'katakana'] as const).forEach((script) => {
      kanaList.forEach((item) => {
        const key = progressKey(script, item.id);
        if (!stages[key] && Array.from(item[script]).every((glyph) => completed.has(glyph))) {
          stages[key] = 1;
        }
      });
    });
  }
  return stages;
};

function KanaPad({
  guide,
  character,
  script,
  stage,
  isYouon,
  resetSignal,
  onDrawingChange,
}: {
  guide?: Guide;
  character: string;
  script: Script;
  stage: number;
  isYouon: boolean;
  resetSignal: number;
  onDrawingChange: (hasDrawing: boolean) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const moved = useRef(false);
  const [strokeIndex, setStrokeIndex] = useState(0);
  const [showGuide, setShowGuide] = useState(true);
  const arrowId = useId();
  const showBaseGlyph = stage === 0;
  const showStrokeGuide = stage <= 1;

  const point = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    return {
      x: (event.clientX - bounds.left) * (event.currentTarget.width / bounds.width),
      y: (event.clientY - bounds.top) * (event.currentTarget.height / bounds.height),
    };
  };

  const start = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const context = event.currentTarget.getContext('2d');
    if (!context) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drawing.current = true;
    moved.current = false;
    setShowGuide(false);
    context.strokeStyle =
      getComputedStyle(event.currentTarget).getPropertyValue('--accent').trim() || '#e47760';
    const { x, y } = point(event);
    context.beginPath();
    context.moveTo(x, y);
  };

  const move = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const context = event.currentTarget.getContext('2d');
    if (!context) return;
    const { x, y } = point(event);
    moved.current = true;
    context.lineTo(x, y);
    context.lineWidth = 8;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.stroke();
  };

  const stop = () => {
    if (drawing.current && moved.current) {
      onDrawingChange(true);
      if (guide) setStrokeIndex((current) => Math.min(current + 1, guide.strokes.length));
    }
    drawing.current = false;
    setShowGuide(true);
  };
  const cancel = () => {
    drawing.current = false;
    setShowGuide(true);
  };
  const clear = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (canvas && context) context.clearRect(0, 0, canvas.width, canvas.height);
    setStrokeIndex(0);
    setShowGuide(true);
    onDrawingChange(false);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (canvas && context) context.clearRect(0, 0, canvas.width, canvas.height);
    setStrokeIndex(0);
    setShowGuide(true);
  }, [resetSignal]);

  return (
    <div className={styles.pad}>
      <div className={styles['pad-guide']} aria-hidden="true">
        <span className={styles['guide-vertical']} />
        <span className={styles['guide-horizontal']} />
        {showBaseGlyph && (
          <span className={`${styles['guide-character']} ${isYouon ? styles.youonCharacter : ''}`}>
            {isYouon ? (
              <>
                {Array.from(character)[0]}
                <small>{Array.from(character)[1]}</small>
              </>
            ) : (
              character
            )}
          </span>
        )}
        {showStrokeGuide && guide && (
          <svg
            className={isYouon ? styles.combinedGuide : undefined}
            viewBox={guide.viewBox}
            role="presentation"
          >
            <defs>
              <marker
                id={arrowId}
                markerWidth="10"
                markerHeight="10"
                refX="8.5"
                refY="5"
                orient="auto"
                markerUnits="userSpaceOnUse"
              >
                <path className={styles['guide-arrowhead']} d="M0 0 L10 5 L0 10 L2.5 5 Z" />
              </marker>
            </defs>
            {showGuide && (
              <>
                {guide.strokes.slice(0, strokeIndex).map((stroke) => (
                  <path
                    key={`${stroke.transform || 'base'}-${stroke.d}`}
                    className={styles['guide-completed']}
                    d={stroke.d}
                    transform={stroke.transform}
                  />
                ))}
                {guide.strokes[strokeIndex] && (
                  <path
                    className={styles['guide-active']}
                    d={guide.strokes[strokeIndex].d}
                    transform={guide.strokes[strokeIndex].transform}
                    markerEnd={`url(#${arrowId})`}
                  />
                )}
              </>
            )}
          </svg>
        )}
      </div>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        width={300}
        height={300}
        aria-label={`${character} 필기 연습 영역`}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={stop}
        onPointerCancel={cancel}
      />
      <button
        className={styles.clear}
        type="button"
        onClick={clear}
        aria-label={`${character} 필기 지우기`}
      >
        <RotateCcw aria-hidden="true" size={16} /> 지우기
      </button>
      <span className={styles.srOnly}>
        {script === 'hiragana' ? '히라가나' : '가타카나'} {character}
      </span>
    </div>
  );
}

export function KanaPage() {
  const [script, setScript] = useState<Script>(() => {
    const saved = readStorage<string>('kanaScript', 'hiragana');
    return saved === 'katakana' ? 'katakana' : 'hiragana';
  });
  const [group, setGroup] = useState<KanaGroup>(() => {
    const saved = readStorage<string>('kanaGroup', 'basic');
    if (saved === 'dakuten' || saved === 'handakuten') return 'voiced';
    return kanaGroups.some(({ id }) => id === saved) ? (saved as KanaGroup) : 'basic';
  });
  const [selectedId, setSelectedId] = useState(() => {
    const saved = readStorage<string>('kanaLastId', 'basic-あ');
    return saved.startsWith('dakuten-') || saved.startsWith('handakuten-')
      ? `voiced-${saved.slice(saved.indexOf('-') + 1)}`
      : saved;
  });
  const [studyStages, setStudyStages] = useState<StudyStages>(readStudyStages);
  const [guides, setGuides] = useState<Record<string, Guide | null>>({});
  const [writtenState, setWrittenState] = useState<{ key: string; hasDrawing: boolean }>({
    key: '',
    hasDrawing: false,
  });
  const [resetSignal, setResetSignal] = useState(0);
  const filtered = useMemo(() => {
    const seen = new Set<string>();
    return kanaList.filter((item) => {
      if (item.group !== group) return false;
      const glyph = item[script].normalize('NFC');
      if (seen.has(glyph)) return false;
      seen.add(glyph);
      return true;
    });
  }, [group, script]);
  const active = filtered.find((item) => item.id === selectedId) ?? filtered[0];
  const character = (item: KanaItem) => item[script];
  const glyphs = Array.from(character(active).normalize('NFC'));
  const stage = studyStages[progressKey(script, active.id)] || 0;
  const practiceKey = progressKey(script, active.id);
  const hasDrawing = writtenState.key === practiceKey && writtenState.hasDrawing;
  const canComplete = stage < 3 && hasDrawing;
  const activeGuide = useMemo(() => {
    const loaded = glyphs.map((glyph) => guides[glyph]);
    if (loaded.some((guide) => !guide)) return undefined;
    const resolved = loaded as Guide[];
    if (active.group !== 'youon') return resolved[0];
    return {
      viewBox: '0 0 180 109',
      strokes: resolved.flatMap((guide, index) =>
        guide.strokes.map((stroke) => ({
          ...stroke,
          transform: index === 0 ? undefined : 'translate(101 30) scale(0.72)',
        })),
      ),
    };
  }, [active.group, glyphs.join(''), guides]);
  const completeCount = kanaList.filter(
    (item) => (studyStages[progressKey(script, item.id)] || 0) >= 3,
  ).length;

  useEffect(() => writeStorage('kanaScript', script), [script]);
  useEffect(() => writeStorage('kanaGroup', group), [group]);
  useEffect(() => writeStorage('kanaLastId', active.id), [active.id]);
  useEffect(() => writeStorage('kanaStudyStages', studyStages), [studyStages]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const missing = [...new Set(glyphs)].filter((glyph) => !(glyph in guides));
      if (missing.length === 0) return;
      const loaded = await Promise.all(
        missing.map(async (glyph) => {
          const filename = glyph.codePointAt(0)!.toString(16).padStart(5, '0');
          try {
            const response = await fetch(`${import.meta.env.BASE_URL}kana/strokes/${filename}.svg`);
            if (!response.ok) return [glyph, null] as const;
            const xml = new DOMParser().parseFromString(await response.text(), 'image/svg+xml');
            const root = xml.documentElement;
            const paths = [...xml.querySelectorAll('[id^="kvg:StrokePaths_"] path')];
            if (!paths.length) return [glyph, null] as const;
            return [
              glyph,
              {
                viewBox: root.getAttribute('viewBox') || '0 0 109 109',
                strokes: paths
                  .map((path) => ({ d: path.getAttribute('d') || '' }))
                  .filter(({ d }) => d),
              },
            ] as const;
          } catch {
            return [glyph, null] as const;
          }
        }),
      );
      if (!cancelled)
        setGuides((current) => ({
          ...current,
          ...Object.fromEntries(loaded),
        }));
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [active.id, glyphs.join(''), guides]);

  const markComplete = () => {
    if (!canComplete) return;
    setStudyStages((current) => {
      const key = progressKey(script, active.id);
      return { ...current, [key]: Math.min((current[key] || 0) + 1, 3) };
    });
    setWrittenState({ key: practiceKey, hasDrawing: false });
    setResetSignal((current) => current + 1);
  };

  const handleDrawingChange = (hasDrawing: boolean) => {
    setWrittenState({ key: practiceKey, hasDrawing });
  };

  const hint =
    stage === 0
      ? '기본 글자와 획 안내를 보며 써 보세요.'
      : stage === 1
        ? '획 안내를 따라 써 보세요.'
        : stage === 2
          ? '획 안내 없이 기억해서 써 보세요.'
          : '이 글자의 3단계 연습을 마쳤어요.';

  return (
    <section className={styles.page}>
      <div className="page-heading">
        <p className="eyebrow">HIRAGANA &amp; KATAKANA</p>
        <h1>가나 학습</h1>
      </div>
      <div className={styles.scriptBar}>
        <div className={styles.tabs} role="group" aria-label="문자 종류">
          {(['hiragana', 'katakana'] as const).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={script === option}
              className={script === option ? styles.selected : ''}
              onClick={() => setScript(option)}
            >
              {option === 'hiragana' ? '히라가나' : '가타카나'}
            </button>
          ))}
        </div>
        <span className={styles.topline}>
          {completeCount} / {kanaList.length}자 학습 완료
        </span>
      </div>
      <div className={styles.groups} role="group" aria-label="글자 묶음">
        {kanaGroups.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={group === item.id}
            className={group === item.id ? styles.selected : ''}
            onClick={() => {
              setGroup(item.id);
              setSelectedId(kanaList.find(({ group: g }) => g === item.id)!.id);
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className={styles.layout}>
        <section className={styles.practice} aria-label="글자 필기 연습">
          <div className={styles.character}>
            <div className={styles['character-heading']}>
              <div className={styles['character-name']}>
                <strong>{character(active)}</strong>
                <span>({active.romaji})</span>
              </div>
            </div>
            <KanaPad
              key={`${script}-${active.id}`}
              guide={activeGuide}
              character={character(active).normalize('NFC')}
              script={script}
              stage={stage}
              isYouon={active.group === 'youon'}
              resetSignal={resetSignal}
              onDrawingChange={handleDrawingChange}
            />
          </div>
          <p className={styles.hint}>{hint}</p>
          {stage < 3 && (
            <div className={styles.actions}>
              <button
                className={styles.completeButton}
                type="button"
                disabled={!canComplete}
                onClick={markComplete}
              >
                연습 완료 · {stage + 1}/3
              </button>
            </div>
          )}
        </section>
        <section className={styles.chart} aria-label="글자 선택">
          <h2>{kanaGroups.find(({ id }) => id === group)?.label}</h2>
          <div className={`${styles.grid} ${group === 'youon' ? styles.youonGrid : ''}`}>
            {filtered.map((item) => {
              const selected = item.id === active.id;
              const itemStage = studyStages[progressKey(script, item.id)] || 0;
              const stageLabel = itemStage >= 3 ? '학습 완료' : `${itemStage}/3단계`;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-label={`${character(item)} ${item.romaji}, ${stageLabel}`}
                  aria-pressed={selected}
                  className={selected ? styles.current : ''}
                  onClick={() => {
                    setSelectedId(item.id);
                  }}
                >
                  <strong>{character(item).normalize('NFC')}</strong>
                  <span className={styles.progress} aria-hidden="true">
                    {[0, 1, 2].map((step) => (
                      <i key={step} className={step < itemStage ? styles.filled : ''} />
                    ))}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      </div>
      <p className={styles.attribution}>
        획순 자료:{' '}
        <a href="https://github.com/KanjiVG/kanjivg" target="_blank" rel="noreferrer">
          KanjiVG
        </a>{' '}
        ·{' '}
        <a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" rel="noreferrer">
          CC BY-SA 3.0
        </a>
      </p>
    </section>
  );
}
