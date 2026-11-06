# AI 프로젝트 프로필

## 프로젝트

- 목적: JLPT N5·N4·N3 일본어 단어 학습 React 앱
- 언어 / 프레임워크 / 런타임: TypeScript, React 19, Vite 8, Node.js 22 이상
- 패키지 관리자 / 버전: pnpm 11.17.0 (`package.json`의 `packageManager`)
- 주요 디렉터리: `src/components` UI, `src/hooks` 상태·동작, `src/data` 데이터 접근, `src/lib` 공통 로직, `src/styles` 스타일, `public/data` 앱에서 쓰는 단어 JSON, `scripts` 데이터 도구
- 아키텍처와 데이터 흐름: 클라이언트 앱이며 학습 기록과 단어장은 LocalStorage에 저장됩니다. 앱은 런타임에 `public/data`의 JSON을 사용하고 외부 요청은 하지 않습니다.

## 소유권과 경계

- 자동 생성 파일 및 원본 정의: `public/data/n*.json`은 `src/n*.csv`에서 `pnpm prepare:data`로 생성합니다. AI 보강 스크립트 `pnpm enrich:data`는 OpenAI API 비용이 발생할 수 있고 대상 JSON을 갱신하므로 사용자 요청 없이 실행하지 않습니다.
- API / DB 스키마 / 마이그레이션 규칙: 백엔드·DB 없음. 단어 오류 제안은 GitHub 이슈 양식으로 전달됩니다.
- 인증·권한·민감 데이터 경계: 앱에는 서버 인증이 없습니다. API 키는 `.env.local`에만 보관하고 커밋하지 않습니다. `.env*` 파일은 Git에서 제외됩니다.
- 이 저장소에서 금지하거나 주의할 작업: 에이전트가 변경과 1차 확인 결과를 전달하면 사용자가 직접 검증한 뒤 별도로 요청할 때 커밋·푸시·배포를 진행합니다. 데이터 보강은 유료 외부 API 호출이므로 명시 요청이 필요합니다. 생성 JSON을 직접 편집하지 말고 CSV와 변환 절차를 확인합니다.

## 검증 명령

| 범위        | 명령                                                  | 비고                                                             |
| ----------- | ----------------------------------------------------- | ---------------------------------------------------------------- |
| 전체 검증   | `pnpm verify`                                         | 린트, 포맷, N5·N4·N3 데이터 검사, 프로덕션 빌드                  |
| 포맷 / 린트 | `pnpm format:check` / `pnpm lint`                     | 포맷 검사 범위는 스크립트 glob 기준                              |
| 타입 검사   | `pnpm build`                                          | TypeScript 프로젝트 빌드와 Vite 프로덕션 빌드를 함께 수행        |
| 단위 테스트 | 미확인                                                | `package.json`에 테스트 스크립트 없음                            |
| 통합 / E2E  | 미확인                                                | `package.json`에 E2E 스크립트 없음                               |
| 빌드        | `pnpm build`                                          | `DEPLOY_TARGET=github`는 GitHub Pages 경로 설정이 필요할 때 사용 |
| 데이터 검사 | `pnpm check:data public/data/n5.json`                 | N4/N3도 같은 방식으로 검사. `pnpm verify`는 세 레벨 모두 검사    |
| 데이터 생성 | `pnpm prepare:data -- src/n5.csv public/data/n5.json` | N4/N3도 같은 형식으로 실행. 생성 대상 덮어쓰기를 확인            |

## 참고할 기존 예시

- 대표적인 기능 구현: `src/App.tsx`, `src/components`, `src/hooks`
- 폼·오류 처리 예시: 미확인
- API / DB 접근 예시: 백엔드·DB 없음
- UI 컴포넌트 또는 서버 모듈 패턴: `src/components`, `src/styles`

## 완료 기준

- 사용자 요청별 완료 조건: 요청한 동작과 저장소 내 기존 UX 패턴을 충족
- 변경별 필수 검사: 코드 변경은 `pnpm verify`, 문서만 변경한 경우는 관련 문서 검사
- 알려진 기존 실패 또는 기술 부채: 미확인
- 사용 중인 생성·검증 도구가 이미 보고하는 항목: ESLint, Prettier, TypeScript, Vite, `scripts/check-data.mjs`
