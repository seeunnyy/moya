# 모야 인수인계 (2026-10-03 20:00 기준)

> 이 문서를 읽는 AI에게: 이 프로젝트를 이어받아 구현을 계속한다.
> 먼저 이 문서 → `CLAUDE.md` → `openspec/changes/add-word-question-mvp/tasks.md` 순으로 읽고,
> 아래 "8. 시작 절차"대로 상태를 확인한 뒤 사용자에게 짧게 보고하고 작업을 시작한다.

---

## 1. 한눈에 보기

| 항목 | 내용 |
|---|---|
| 서비스 | 모야 — 만 5~8세 아이가 "○○이 뭐야?"라고 물으면, 서툰 발음도 되물어 단어를 찾고 아이 눈높이로 설명하는 모바일 웹 (2026 4호선톤 출품 MVP) |
| 저장소 | `github.com/seeunnyy/moya`, 브랜치 `main` / 로컬: `C:\Users\arong\moya` (Windows) |
| 스택 | Next.js 16.3.8 (App Router), React 19.2.8, TypeScript, Tailwind CSS 4. 추가 의존성 없음 |
| 테스트 | Node 내장 러너 `npm test` (`node --test "tests/**/*.test.ts"`). 64개 전부 통과 (인수인계 시점 사본으로 확인) |
| 작업 방식 | OpenSpec spec-driven. 진행 중인 change는 `add-word-question-mvp` 하나 |
| 진행률 | tasks.md 32개 중 **19개 완료** (그룹 1~5) |
| 커밋 | 그룹 5까지 커밋됨. 마지막 커밋: `feat: /app 묻기 흐름 상태 기계와 S1~S6·E2 화면 (작업 5.1~5.7)` |
| 다음 할 일 | **작업 6.1 단어장(`/app/cards`)** → 7.1 오늘 범위 통합 확인 |

미커밋 변경: 파일 수정 시각으로 보면 마지막 커밋 이후 바뀐 소스는 없다. `git status`로 다시 확인할 것.

---

## 2. 반드시 지킬 것

`CLAUDE.md`가 기준이다. 그중 구현에 직접 걸리는 것만 다시 적는다.

- 답변은 한국어, 결론 먼저. 파일 수정 전에 계획을 먼저 말한다.
- **새 의존성·새 API는 이유와 대안을 말하고 사용자 확인을 받은 뒤에만** 추가한다.
- 해커톤 외부 API는 음성인식(STT) 하나뿐. 음성 출력은 브라우저 `speechSynthesis`. 사전 API·LLM은 베타.
- 아이에게 보여주는 설명은 `src/data`의 단어 데이터만 쓴다. 실행 중 생성 금지.
- **아이 음성 원본은 저장하지 않는다.** 인식 텍스트만 localStorage에 저장한다.
- 외부 API는 `src/lib/services` 어댑터를 거쳐 서버(`src/app/api`)에서만 호출. 키는 `.env.local`의 `STT_API_KEY`.
- `src/lib/pronunciation`은 외부 의존 없는 순수 함수로 유지한다.
- Next 16은 학습 데이터와 다를 수 있다. 코드 작성 전 `node_modules/next/dist/docs/`의 관련 문서를 확인한다 (`AGENTS.md`).
- **스타일은 최소로.** 모야 캐릭터·색·폰트는 Figma 시안 확정 후 입힌다 (design.md Non-Goals). 지금은 점선 박스 + 상태 글자.

### 사용자와 정한 진행 리듬

1. `/opsx:apply add-word-question-mvp` 로 진행하되, 사용자가 "작업 N 그룹 끝까지만"처럼 범위를 정해 준다.
2. 그룹이 끝나고 `npm test`·`npm run lint`·`npm run build`가 통과하면 **묻지 말고 커밋**한 뒤, 다음 그룹 시작 전에 멈추고 리포트한다.
3. 리포트에는 반드시 두 가지를 넣는다: **"tasks.md와 다르게 한 부분"**, **"문서에 없어서 내가 정한 부분"**.
4. 구현 중 정한 잠정 해석은 `design.md` Open Questions에 기록한다.
5. 문서(design.md 등) 커밋과 코드 커밋은 분리한다.
6. 커밋 메시지 형식: `feat: … (작업 x.y~x.z)`, `docs(openspec): …`

---

## 3. 문서 지도

| 파일 | 내용 | 언제 보나 |
|---|---|---|
| `CLAUDE.md` | 프로젝트 규칙, 경계(Boundaries) | 항상 |
| `openspec/changes/add-word-question-mvp/tasks.md` | 구현 체크리스트 32개 | 작업 시작 전 |
| `openspec/changes/add-word-question-mvp/design.md` | 구현 결정과 이유, **Open Questions(잠정값)** | 결정이 애매할 때 |
| `openspec/changes/add-word-question-mvp/specs/*/spec.md` | 7개 capability의 요구사항·시나리오 | 동작을 확인할 때 |
| `openspec/changes/add-word-question-mvp/proposal.md` | 범위와 범위 밖 | 범위 판단 |
| `planning/md-design/02_REQUIREMENTS_SPEC.md` | FR/NFR ID, 인수조건, 추적표 | 요구사항 ID 확인 |
| `planning/md-design/03_UX_UI_SPEC.md` | 화면 S0~S8, E1·E2, 컴포넌트, 고지 문구(§3) | 화면 만들 때 |
| `planning/md-design/04_TECHNICAL_DESIGN.md` | 라우트, 데이터 모델(§3), 상태(§4), 저장(§5) | 구조 확인 |
| `planning/md-design/05_DELIVERY_PLAN.md` | 일정(§1), 오늘 범위(§2), mock 단어(§3), **수동 QA(§4)**, 데모 시나리오(§5) | QA·일정 |
| `planning/reviews/md-design-review.md` | 기획 리뷰. [필수] 5개는 반영됨, [권장] 1~7은 미반영 | 참고 |
| `docs/PRD.md`, `docs/DESIGN.md`, `docs/ARCHITECTURE.md` | 요약판 | 참고 |

---

## 4. 구현된 것 (코드 지도)

### 데이터 흐름

```
텍스트 입력(QuestionForm)
  → askReducer "recognized"
    → extractTargets()  "두박이 뭐야?" → ["두박"]       (못 꺼내면 E2)
    → inferWord()       역규칙 변형 + 자모 거리 → confirm / choose / unknown
  → confirm(S3) ─[응]──────────────────────────→ explaining(S5) → 카드 저장 → saved
  → context(S4) ─상황 버튼→ choose ─[이거야!]──→ explaining(S5)
  → unknown(S6) → 물어볼 단어 저장
  [아니야]/[다 아니야]: 첫 번째는 S1로 돌아가 다시 묻기, 두 번째는 S6
```

### 파일

| 파일 | 역할 | 작업 |
|---|---|---|
| `src/types/index.ts` | WordEntry, WordCard, PendingWord, Candidate, CandidateResult, PronunciationRule, HeardContext | 1.1 |
| `src/lib/config.ts` | MAX_DISTANCE=2, MAX_CANDIDATES=3, MAX_RETRY=1 (다른 모듈은 이 값만 참조) | 1.2 |
| `src/lib/pronunciation/jamo.ts` | 자모 분해·조합 | 2.1 |
| `src/lib/pronunciation/distance.ts` | 자모 편집거리 | 2.2 |
| `src/data/rules.ts`, `src/lib/pronunciation/rules.ts` | R1·R3 역규칙 표, 변형 생성 | 2.3 |
| `src/lib/pronunciation/extract.ts` | "○○이 뭐야" 대상 단어 추출 | 2.4 |
| `src/lib/pronunciation/candidates.ts` | 후보 찾기·분기, 상황 동점 정렬(`orderByContext`) | 2.5 |
| `src/data/words.mock.ts` | mock 단어 10개 (**검수 전**, 순서가 동점 정렬에 영향) | 3.1 |
| `src/data/examplePrompts.ts` | 데모 문장 3개 — **아직 화면에 연결 안 됨** (8.1에서 연결) | 3.2 |
| `src/data/blocklist.ts` | 부적절 단어 mock 1개 — **아직 흐름에 연결 안 됨** (8.3에서 연결) | 3.2 |
| `src/lib/storage/index.ts` | `moya.cards.v1`, `moya.pending.v1` 읽기·추가. 실패 시 빈 목록/false. 정해진 필드만 저장 | 4.1~4.2 |
| `src/lib/askFlow.ts` | `/app` 상태 기계 reducer (순수 함수, 단어 데이터 주입) | 5.1 |
| `src/components/AskScreen.tsx` | `/app` 화면. 상태별 S1~S6·E2 표시, S5·S6 진입 시 한 번 저장 | 5.2~5.7 |
| `src/components/{Button,QuestionForm,ContextPicker,CandidatePicker,heardContext}` | 최소 스타일 UI. 버튼 48px 이상, 글자 필수 | 5.x |
| `src/app/app/page.tsx` | `<AskScreen />` | 5.x |
| `src/app/app/cards/page.tsx` | **h1만 있는 빈 화면** → 6.1에서 구현 | — |
| `src/app/page.tsx`, `src/app/parent/page.tsx` | h1만 (S0은 11.1, S8은 베타) | — |
| `tests/**` | jamo, distance, rules, extract, candidates, words.mock, examplePrompts, storage, askFlow, config | — |

### 코드 규칙 (기존 패턴 유지)

- `src/lib`, `src/data`, `src/types`끼리는 **`.ts` 확장자가 붙은 상대 경로**로 import한다 (Node 테스트 러너 때문, tsconfig `allowImportingTsExtensions`). 컴포넌트에서는 `@/` 별칭을 쓴다.
- 저장은 reducer 밖에서 한다. `AskScreen`의 `send()`가 다음 상태를 미리 계산해 S5·S6 진입 시점에 저장하고, 결과를 `cardSaved`/`pendingSaved` 액션으로 알린다.
- ID는 `crypto.randomUUID` 대신 직접 만든다 (휴대폰에서 http 개발 서버 접속 시 없을 수 있음).
- 화면 전환 시 h1로 포커스 이동, 모야 대사는 `aria-live="polite"`.

---

## 5. 남은 작업

| 작업 | 내용 | 시점 | 메모 |
|---|---|---|---|
| **6.1** | `/app/cards`: 카드 목록, 물어볼 단어 목록, 빈 상태 (QA-07, QA-08) | 오늘 범위 | `readCards()`/`readPending()` 사용. localStorage는 클라이언트에서만 읽어야 하므로 서버 렌더링과 어긋나지 않게 처리(클라이언트 컴포넌트 + 마운트 후 읽기). 스펙: `specs/word-cards/spec.md` |
| **7.1** | 375px에서 S1~S7 가로 스크롤 없음(QA-09) + test·lint·build | 오늘 범위 | 수동 QA-01~10을 이때 함께 확인 (아래 6번 참고) |
| 8.1 | S1·E1·E2에 예시 버튼 (QA-11) | 11/5 전 | `EXAMPLE_PROMPTS` 연결 |
| 8.2 | S1·S7 저장·전송 고지 (QA-12) | 11/5 전 | 문구는 03 §3 잠정안 |
| 8.3 | 부적절 단어 → "엄마·아빠한테 물어보자", 저장 안 함 | 11/5 전 | `BLOCKED_WORDS` 연결 |
| 9.1 | speechSynthesis 래퍼 (ko-KR, 미지원 시 무동작) | 11/5 전 | 모야 대사·설명·후보·[다시 듣기] |
| 10.1~10.4 | STT 어댑터(mock), `POST /api/stt`, MicButton(MediaRecorder), E1 | 11/5 전 | mock으로 먼저 |
| 10.5 | 실제 STT 연동 | **보류** | STT 확정(~10/22) 전에는 하지 않는다 |
| 11.1~11.2 | 랜딩 S0, 실기기 데모 시나리오 통합 확인 | 11/5 전 | 05 §5 |

오늘 범위(05 §2)는 6.1과 7.1만 남았다.

---

## 6. 확인이 필요한 것

1. **브라우저 수동 QA 기록이 없다.** tasks.md 5.2~5.7은 "브라우저에서 확인"으로 체크돼 있지만, 사람이 실제로 눌러 봤다는 기록은 없다. 7.1에서 `npm run dev`를 띄워 QA-01~QA-10을 사용자와 함께 확인한다.
2. **빌드 재확인.** 그룹 5에서 처음으로 페이지가 `src/lib`를 import했다(`.ts` 확장자 import가 Next 빌드와 충돌할 수 있는 지점). 커밋 규칙상 빌드 통과 후 커밋된 것으로 보이지만, 시작할 때 `npm run build`로 다시 확인한다. 충돌하면 design.md Risks대로 확장자 없는 import로 되돌리고 사용자에게 보고한다.
3. **문서가 실제와 어긋난 곳** (고치기 전에 사용자 확인):
   - `CLAUDE.md` "Current Stage"가 아직 "Session 2: 설계 문서 작성 완료"다.
   - 05 §2는 "단위 테스트 도구 설치 안 함, 수동 QA만"이라고 돼 있지만 실제로는 Node 내장 러너로 테스트를 만들었다(새 패키지 없음, design.md에 결정 기록).
   - tasks.md 1.3의 test 스크립트(`node --test tests/`)와 실제(`node --test "tests/**/*.test.ts"`)가 다르다. Node 26에서 폴더 지정이 실패해서 바꿨다.
4. **readiness-check 스킬은 없다.** 설계 질문만 오갔고 `.claude/skills/`에 파일이 생기지 않았다. 있는 스킬: `planning-review`, `md-to-openspec`, `openspec-*`.

### 이후 작업에 걸리는 Open Questions (design.md에 기본값 있음)

| 질문 | 기본값 | 걸리는 작업 |
|---|---|---|
| 고지 문구 최종안 | 03 §3 잠정 문구 | 8.2 |
| 부적절 단어 목록·판별 기준 | 빈 목록 + mock 1개 | 8.3 |
| 모야 말투, 확인 질문 틀 2~3종 | 틀 1종 "○○ 말하는 거야? <힌트>!" | 9.1, 전반 |
| 녹음 자동 종료 기준 | [그만하기] + 최대 녹음 시간 | 10.3 |
| STT 서비스 | mock 어댑터 | 10.x |
| 지시어만 있는 질문("이게 뭐야", "저거 뭐야") | 지금은 "이게"를 단어로 꺼내 물어볼 단어로 저장됨 | 녹음 테스트 후 |
| 같은 거리 후보 순서 | 데이터 순서 ("가바" → 가방 먼저) | 데이터 교체 시 |
| '이'로 끝나는 단어(고양이) 추출 | 예외 처리 없음 | 데이터 교체 시 |
| 배포 환경 | 미정 | 11/5 전 결정 |

---

## 7. 일정과 코드 밖 할 일 (05 §1)

| 날짜 | 내용 | 코드 영향 |
|---|---|---|
| ~10/15 | STT 후보 3종 선정, 녹음 테스트 단어 10개를 `WordEntry`로 작성 (PM) | `words.mock.ts` 교체 준비 |
| 10/16~10/22 | 아이 녹음 테스트, 역규칙 보정 | `src/data/rules.ts`, `config.ts` 값 조정 |
| ~10/22 | STT 확정 | 10.5 시작 가능 |
| 10/19 | 기획 확정, BE 작업 시작 (팀원 모집 중) | — |
| 10/29 | 검수된 단어 데이터 50~100개, 핵심 화면 UI 전달 | 데이터 교체, 디자인 입히기 |
| 11/5 | **1차 배포** (보호자 동의서 확정 포함) | 8~11 그룹 완료 필요 |
| 11/6~11/12 | 사용성 테스트 | — |
| 11/12 | 기능 동결 | — |
| 11/20 | 최종 배포, 발표 | — |

---

## 8. 시작 절차 (새 세션의 AI가 할 일)

1. 이 문서, `CLAUDE.md`, `tasks.md`를 읽는다.
2. `git status`, `git log --oneline -5`로 커밋 상태를 확인한다.
3. `npm test`, `npm run lint`, `npm run build`를 실행한다.
4. 결과를 사용자에게 3줄 이내로 보고한다 (통과 여부, 미커밋 변경, 다음 작업).
5. 사용자가 진행을 요청하면 작업 6.1부터 시작하고, 2번의 "진행 리듬"을 따른다.
