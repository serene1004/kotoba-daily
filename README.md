# ことば · Kotoba Daily

JLPT N5·N4·N3 중 공부할 레벨을 골라 일본어 단어를 학습하는 React 앱입니다. 한 세트 최대 10개 단어를 공부하고, 헷갈리는 단어는 단어장에 저장할 수 있습니다.

배포별 변경 사항은 [`CHANGELOG.md`](CHANGELOG.md)에서 확인할 수 있습니다.

## 주요 기능

- 대시보드에서 JLPT 레벨을 선택해 학습을 시작하거나 진행 중인 세트를 이어서 학습
- 레벨별 학습 단어와 복습 예정 단어 수 확인
- 선택 레벨 또는 전체 레벨의 학습량을 월간 달력과 최근 7일 차트로 확인
- 복습 단어와 아직 학습하지 않은 단어를 섞어 한 세트 최대 10개 출제
- 정답 횟수에 따라 복습 간격을 3일·7일·14일로 조정
- 학습 중 화면을 나갈 때 진행을 저장하고, 돌아와 이어서 학습
- 후리가나 표시 토글과 Jisho 사전 링크
- 기억나지 않는 단어를 대시보드 단어장에 저장·재확인
- 라이트·다크 모드 전환 및 테마 저장
- 학습 기록과 단어장을 LocalStorage에 저장

## 단어 데이터

앱 실행 중 외부 요청 없이 `public/data/n5.json`, `n4.json`, `n3.json`을 사용합니다. 레벨별 원본 CSV는 `src/n5.csv`, `src/n4.csv`, `src/n3.csv`이며, 아래처럼 앱용 JSON으로 변환할 수 있습니다.

```bash
pnpm prepare:data -- src/n5.csv public/data/n5.json
pnpm prepare:data -- src/n4.csv public/data/n4.json
pnpm prepare:data -- src/n3.csv public/data/n3.json
```

현재 N5 718개, N4 666개, N3 2,139개 단어가 포함되어 있습니다. 원본 CSV의 뜻은 영어이며, 읽는 법이 없는 행은 변환 시 제외합니다. JLPT 단어 목록은 공개된 커뮤니티 자료를 바탕으로 하므로 공식 출제 범위로 간주하지 마세요.

레벨별 원본 CSV는 [elzup/jlpt-word-list](https://github.com/elzup/jlpt-word-list)의 `src/n5.csv`, `src/n4.csv`, `src/n3.csv`에서 가져왔으며, 원본 저장소의 MIT 라이선스는 `LICENSE.jlpt-word-list`에 포함했습니다.

전체 N5 데이터를 AI로 보강하려면 서버 키를 노출하지 않도록 로컬에서 다음을 실행합니다. 이 명령은 원본 CSV를 가져오고, OpenAI Responses API로 한국어 뜻·품사·예문을 만든 뒤, JSON Schema 검증을 통과한 경우에만 `public/data/n5.json`을 덮어씁니다.

```bash
Copy-Item .env.example .env.local
# .env.local에 발급받은 키를 입력
pnpm enrich:data
```

N4 또는 N3도 같은 방식으로 보강할 수 있습니다. API 사용 비용이 발생할 수 있습니다.

```bash
pnpm enrich:data -- N4
pnpm enrich:data -- N3
```

`OPENAI_MODEL`, `ENRICH_BATCH_SIZE`, `ENRICH_CONCURRENCY` 환경변수로 모델·배치 크기·동시 요청 수를 조정할 수 있습니다. API 키는 `.env.local`에만 저장하며 Git에 커밋하지 않습니다.

보강 중 오류가 발생하면 `scripts/.cache/<level>-enrichment-progress.json`에 완료된 배치를 저장합니다. 같은 레벨과 설정으로 다시 실행하면 완료된 배치는 건너뛰고 중단된 배치부터 재개합니다. 전체 생성이 끝나면 체크포인트는 자동 삭제됩니다.

오답으로 기록한 단어는 다음 날 복습 대상으로 선정되고, 정답 단어는 정답 횟수에 따라 3일·7일·14일 뒤 복습 대상으로 선정됩니다. 복습 일정은 단어장 저장 여부와 별도로 관리됩니다.

## 화면 구성

- `/`: 대시보드와 단어장
- `/study`: 선택한 JLPT 레벨의 단어 학습

## 기술 구성

- React 19 + TypeScript + Vite
- React Router
- pnpm
- ESLint Airbnb 규칙 + Prettier
- Docker + Nginx

## 시작하기

사전 요구 사항: Node.js 22 이상, pnpm 11 이상

```bash
pnpm install
pnpm dev
```

개발 서버는 [http://localhost:9080](http://localhost:9080)에서 실행됩니다.

## Docker 실행

```bash
docker compose up --build
```

Docker 프런트엔드는 [http://localhost:9090](http://localhost:9090)에서 실행됩니다. Nginx가 SPA 라우팅을 처리하므로 `/`, `/study` 주소로 직접 진입해도 정상 동작합니다. 빌드 이미지는 `kotoba-daily:latest`로 등록되며, 컨테이너는 Docker Desktop 재시작 후에도 자동으로 다시 시작됩니다.

## GitHub Pages

이 프로젝트는 GitHub Actions로 빌드하고 GitHub Pages로 배포합니다.

[현재 배포된 데모](https://serene1004.github.io/kotoba-daily/)

## 명령어

| 명령어              | 설명                          |
| ------------------- | ----------------------------- |
| `pnpm dev`          | 9080 포트에서 개발 서버 실행  |
| `pnpm build`        | 타입 검사와 프로덕션 빌드     |
| `pnpm preview`      | 프로덕션 빌드 미리보기        |
| `pnpm prepare:data` | CSV를 기본 JSON 형식으로 변환 |
| `pnpm check:data`   | 단어 데이터 검증 (기본 N5)    |
| `pnpm enrich:data`  | 지정한 레벨의 단어 데이터를 AI로 보강 (기본 N5) |
| `pnpm lint`         | ESLint 검사                   |
| `pnpm format`       | Prettier로 전체 포맷          |
| `pnpm format:check` | 포맷 적용 여부 검사           |

## 코드 규칙

Prettier와 ESLint는 세미콜론 사용을 기본 규칙으로 강제합니다. 화면별 스타일은 CSS Module로 컴포넌트 옆에 두고, 공통 스타일만 `src/styles/global.css`에서 관리합니다.

## 데이터 저장

별도 백엔드나 데이터베이스 없이 브라우저 LocalStorage를 사용합니다. 브라우저 데이터를 지우면 학습 기록과 단어장도 함께 초기화됩니다.

## 향후 계획

현재는 빠른 사용성 검증을 위한 프런트엔드 프로토타입입니다. 서비스 방향이 정리되면 백엔드와 데이터베이스를 추가해 계정별 학습 기록, 단어장, 기기 간 동기화를 지원할 예정입니다.
