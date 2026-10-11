# ARCHITECTURE.md

> 요약판. 자세한 내용은 `planning/md-design/04_TECHNICAL_DESIGN.md`, 화면·이동은 `openspec/changes/apply-hifi-design/design.md`.

## Service Structure
보호자 가입(이 기기 저장) → 아이 모드(묻기·지구 사전·내 정보) ↔ 보호자 모드(비밀번호 잠금). 서버는 음성인식 라우트 하나.

## Core Flow (MVP)
1. 묻기: 아이 음성 → `/api/stt`(서버에서만 STT 호출, 지금은 mock) → 인식 후보들에서 대상 단어 추출
2. 되묻기 (`src/lib/pronunciation`, 외부 API 없는 순수 함수): 자모 분해 → 발음 역규칙 → 검수 단어와 거리 비교
   - 후보 순서: 보호자가 알려 준 단어 → 발음 거리 → 들은 곳(2-5) → 데이터 순
   - 2-4 확인 질문(첫 후보) → [아니야] → 2-5 어디서 들었어? → 2-6 후보 고르기 (최대 3)
   - 후보 0개 → 2-8 물어볼 단어(보호자가 5-3에서 알려 줄 수 있음) · 인식 실패 → 2-7 · 네트워크 → E-1 · 마이크 불가 → E-2(+ 글자 입력 폴백)
3. 뜻 알려주기(2-9) → 카드 획득(2-10): 설명·예문은 `src/data` 검수 데이터만. 별·미션·로켓 도장은 이 기기에 저장
4. 음성 출력은 브라우저 `speechSynthesis`. 아이 음성 원본은 저장하지 않는다(인식 글자만)

## Routes
- `/` 1-1 시작 · `/login` 1-0 · `/signup`·`/signup/{profile,consent,pin,mic,done}` 1-2~1-8 · `/terms` 1-2a
- `/app` 아이 묻기 전부(2-0~2-14, E-1, E-2 — askFlow 상태) · `/app/dictionary`·`/app/dictionary/[cardId]` 3-1·3-2 · `/app/today` 3-3 · `/app/me`·`/app/me/stars` 3-4·3-5
- `/parent` 5-1 잠금 · `/parent/reset` 5-1b · `/parent/{home,words,settings,settings/profile,settings/pin,settings/consent}` 5-2~5-9
- `/api/stt` 음성인식(서버 전용) · `/dev/components`·`/dev/seed` 개발용(운영 빌드 404)

## Source Structure
- `src/app/`: 라우트 (페이지 + api)
- `src/components/ui/`: 완성 피그마 공통 부품 · `src/components/*Screen.tsx`: 화면 조립 · `gates.tsx`: 들어가기 조건
- `src/lib/askFlow.ts`: 아이 묻기 상태 기계 · `progress.ts`·`cardView.ts`·`parent.ts`·`onboarding.ts`: 순수 계산
- `src/lib/pronunciation/`: 되묻기 핵심 로직 (외부 API 없음)
- `src/lib/services/`: `stt`(서버) · `recognize`(화면 → /api/stt) · `speech`(speechSynthesis)
- `src/lib/storage/`: localStorage 저장 (키마다 버전)
- `src/data/`: 검수(현재 mock) 단어 데이터·역규칙·예시 문장·부적절 단어
- `tests/`: Node 내장 테스트 러너 (`npm test`)

## External Services
- 해커톤: 음성인식(STT) 하나만. 서비스는 10/22까지 확정. `.env.local`의 키로 서버에서만 호출한다.
- 음성 출력: 브라우저 내장 speechSynthesis (외부 API 아님)
- 베타: 사전 API, LLM(실시간 설명·맥락 재순위), 서버 계정·카카오·메일
