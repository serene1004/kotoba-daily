# ことば · Kotoba Daily

부담 없이 하루 10개씩 일본어 단어를 학습하는 React 앱입니다. 뜻을 직접 입력해 확인하고, 헷갈리는 단어는 단어장에 저장할 수 있습니다.

## 주요 기능

- 홈 대시보드에서 오늘의 학습 현황, 달력, 주간 차트 확인
- 매일 랜덤 일본어 단어 10개 학습
- 후리가나 표시 토글과 Jisho 사전 링크
- 기억나지 않는 단어를 대시보드 단어장에 저장·재확인
- 라이트·다크 모드 전환 및 테마 저장
- 학습 기록과 단어장을 LocalStorage에 저장

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

## 명령어

| 명령어              | 설명                         |
| ------------------- | ---------------------------- |
| `pnpm dev`          | 9080 포트에서 개발 서버 실행 |
| `pnpm build`        | 타입 검사와 프로덕션 빌드    |
| `pnpm preview`      | 프로덕션 빌드 미리보기       |
| `pnpm lint`         | ESLint 검사                  |
| `pnpm format`       | Prettier로 전체 포맷         |
| `pnpm format:check` | 포맷 적용 여부 검사          |

## 코드 규칙

Prettier와 ESLint는 세미콜론 사용을 기본 규칙으로 강제합니다. 화면별 스타일은 CSS Module로 컴포넌트 옆에 두고, 공통 스타일만 `src/styles/global.css`에서 관리합니다.

## 데이터 저장

별도 백엔드나 데이터베이스 없이 브라우저 LocalStorage를 사용합니다. 브라우저 데이터를 지우면 학습 기록과 단어장도 함께 초기화됩니다.

## 향후 계획

현재는 빠른 사용성 검증을 위한 프런트엔드 프로토타입입니다. 서비스 방향이 정리되면 백엔드와 데이터베이스를 추가해 계정별 학습 기록, 단어장, 기기 간 동기화를 지원할 예정입니다.
