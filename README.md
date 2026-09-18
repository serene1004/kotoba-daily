# ことば · Kotoba Daily

부담 없이 하루 10개씩 일본어 단어를 학습하는 React 앱입니다. 뜻을 직접 입력해 확인하고, 헷갈리는 단어는 단어장에 저장할 수 있습니다.

배포별 변경 사항은 [`CHANGELOG.md`](CHANGELOG.md)에서 확인할 수 있습니다.

## 주요 기능

- 홈 대시보드에서 오늘의 학습 현황, 달력, 주간 차트 확인
- 정적 JSON에서 매일 일본어 단어 10개 학습
- 복습 단어 최대 3개와 신규 단어 최대 7개를 섞어 출제
- 정답 횟수에 따라 복습 간격을 3일·7일·14일로 조정
- 후리가나 표시 토글과 Jisho 사전 링크
- 기억나지 않는 단어를 대시보드 단어장에 저장·재확인
- 라이트·다크 모드 전환 및 테마 저장
- 학습 기록과 단어장을 LocalStorage에 저장

## 단어 데이터

앱 실행 중 외부 CSV를 요청하지 않고 `public/data/n5.json`을 사용합니다. 원본 CSV를 갱신한 뒤에는 다음 명령으로 기본 JSON을 다시 만들 수 있습니다.

```bash
pnpm prepare:data -- src/n5.csv public/data/n5.json
```

현재 `public/data/n5.json`에는 718개의 N5 단어가 한국어 뜻·품사·예문과 함께 포함되어 있습니다.

전체 N5 데이터를 AI로 보강하려면 서버 키를 노출하지 않도록 로컬에서 다음을 실행합니다. 이 명령은 원본 CSV를 가져오고, OpenAI Responses API로 한국어 뜻·품사·예문을 만든 뒤, JSON Schema 검증을 통과한 경우에만 `public/data/n5.json`을 덮어씁니다.

```bash
Copy-Item .env.example .env.local
# .env.local에 발급받은 키를 입력
pnpm enrich:data
```

`OPENAI_MODEL`, `ENRICH_BATCH_SIZE`, `ENRICH_CONCURRENCY` 환경변수로 모델·배치 크기·동시 요청 수를 조정할 수 있습니다. API 키는 `.env.local`에만 저장하며 Git에 커밋하지 않습니다.

보강 중 오류가 발생하면 `scripts/.cache/n5-enrichment-progress.json`에 완료된 배치를 저장합니다. 같은 명령을 다시 실행하면 완료된 배치는 건너뛰고 중단된 배치부터 재개합니다. 전체 생성이 끝나면 체크포인트는 자동 삭제됩니다.

학습 결과는 `wordProgress`에 저장합니다. 단어장에 저장한 오답은 다음 날, 정답 단어는 정답 횟수에 따라 3일·7일·14일 뒤 복습 대상으로 선정됩니다.

## 화면 구성

- `/`: 대시보드와 단어장
- `/study`: 오늘의 일본어 단어 학습

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

`master` 브랜치에 푸시하면 GitHub Actions가 정적 사이트를 빌드해 배포합니다. 최초 배포 전에는 GitHub 저장소의 **Settings → Pages → Build and deployment**에서 Source를 **GitHub Actions**로 선택하세요.

배포 주소: [https://serene1004.github.io/kotoba-daily/](https://serene1004.github.io/kotoba-daily/)

## 명령어

| 명령어              | 설명                          |
| ------------------- | ----------------------------- |
| `pnpm dev`          | 9080 포트에서 개발 서버 실행  |
| `pnpm build`        | 타입 검사와 프로덕션 빌드     |
| `pnpm preview`      | 프로덕션 빌드 미리보기        |
| `pnpm prepare:data` | CSV를 기본 JSON 형식으로 변환 |
| `pnpm enrich:data`  | N5 전체 데이터를 AI로 보강    |
| `pnpm lint`         | ESLint 검사                   |
| `pnpm format`       | Prettier로 전체 포맷          |
| `pnpm format:check` | 포맷 적용 여부 검사           |

## 코드 규칙

Prettier와 ESLint는 세미콜론 사용을 기본 규칙으로 강제합니다. 화면별 스타일은 CSS Module로 컴포넌트 옆에 두고, 공통 스타일만 `src/styles/global.css`에서 관리합니다.

## 데이터 저장

별도 백엔드나 데이터베이스 없이 브라우저 LocalStorage를 사용합니다. 브라우저 데이터를 지우면 학습 기록과 단어장도 함께 초기화됩니다.

## 향후 계획

현재는 빠른 사용성 검증을 위한 프런트엔드 프로토타입입니다. 서비스 방향이 정리되면 백엔드와 데이터베이스를 추가해 계정별 학습 기록, 단어장, 기기 간 동기화를 지원할 예정입니다.
