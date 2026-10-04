# 모야 인수인계 (2026-10-04 기준, 그룹 13 완료 시점)

> 이 문서를 읽는 AI에게: 이 프로젝트를 이어받아 구현을 계속한다.
> 먼저 이 문서 → `CLAUDE.md` → `openspec/changes/add-word-question-mvp/tasks.md`(그룹 11) → `design.md` "Figma 와이어프레임 전면 적용 (2차)"·Open Questions 순으로 읽고,
> 아래 "8. 시작 절차"대로 상태를 확인한 뒤 사용자에게 짧게 보고하고 작업을 시작한다.

---

## 1. 한눈에 보기

| 항목 | 내용 |
|---|---|
| 서비스 | 모야 — 만 5~8세 아이가 "○○이 뭐야?"라고 물으면, 서툰 발음도 되물어 단어를 찾고 아이 눈높이로 설명하는 모바일 웹 (2026 4호선톤 출품 MVP) |
| 저장소 | `github.com/seeunnyy/moya`, 브랜치 `main` / 로컬: `C:\Users\arong\moya` (Windows) |
| 스택 | Next.js 16.3.8 (App Router), React 19.2.8, TypeScript, Tailwind CSS 4. 추가 의존성 없음 |
| 테스트 | Node 내장 러너 `npm test` (`node --test "tests/**/*.test.ts"`). 81개 통과 (그룹 13 시점) |
| 작업 방식 | OpenSpec spec-driven. 진행 중인 change는 `add-word-question-mvp` 하나 |
| 진행률 | 그룹 1~9, 12, 13, 10.1~10.4 완료 (47/50). 남은 것: 11.1~11.2, 10.5(보류) |
| 다음 할 일 | **11.1 랜딩(S0)** → 11.2 실기기 데모 |

미커밋 변경: 없음 (그룹 13 코드·문서 커밋 직후 기준). `git status`로 다시 확인할 것.

> 코드와 문서 모두 Figma 와이어프레임 구조다. 그룹 13 구현 중 정한 세부는 design.md Open Questions "작업 13.2~13.10 구현 중 정한 부분"에 있다.

---

## 2. 그룹 13에서 확정된 결정 (다시 묻지 말 것)

상세는 `design.md` "Figma 와이어프레임 전면 적용 (2차)", 화면별 구성은 `03_UX_UI_SPEC.md` §1, 값은 §5.

- **기준**: Figma 와이어프레임 Section 1(https://www.figma.com/design/rJZjG6ik2Q2ffj1BiK20U8/?node-id=1271-481)과 화면 구성·버튼·이동·스타일을 똑같이. 이동 기준 ① Figma 연결 ② Manyfast '새 플로우 1' ③ design.md. 화면마다 Figma MCP `get_design_context`로 값을 읽는다(그 전에 `skill://figma/figma-design-to-code/SKILL.md`를 읽어야 함).
- **되묻기 화면(S12)**: 인식 성공 시 항상 거친다. **결과에 맞는 버튼 하나만** 보인다(후보 2~3 [후보 단어 고르기] / 1 "단어 확인 질문 보기" / 0 "물어볼 단어 안내 보기"). 후보 0개면 "혹시 이 말이야?" 영역 숨김. 미리보기 카드 폭은 1/3로 고정.
- **맥락 질문 제거**: `context` 단계·상황 버튼·`ContextPicker`·`heardContext.ts`를 없앤다. `orderByContext`와 그 테스트는 남긴다(화면에서 안 씀). `WordCard.heardContext` 타입은 데이터 호환용으로 남긴다.
- **텍스트·예시 입력은 마이크를 못 쓸 때만**(권한 거부·마이크 없음·미지원·http) 음성 녹음 화면의 [녹음 시작] 아래에 보인다. 평소엔 숨김.
- **[아니에요]·[여기 없어요]는 한 번 다시 말하기**: 첫 번째 → 음성 녹음, 두 번째 → 물어볼 단어 안내 (기존 retry 규칙).
- **후보 카드 선택(S4)**: 카드 자체를 누르면 확정. [들어보기]는 소리만. 눈에 보이는 고르기 버튼 없음. 후보 단어는 **20 Bold**(Figma 값).
- **음성 녹음(S1)**: 듣는 중·생각 중은 같은 화면에서 버튼 글자만 [녹음 시작] → [그만하기] → "생각 중…"(비활성). [녹음 시작]에서 권한 미확인이면 /app/mic. 홈 [모야한테 물어보기]는 바로 /app/ask.
- **화면 글자는 Figma 문구뿐**. 모야 대사는 sr-only aria-live + 자동 음성.
- **저장 결과는 버튼 글자로만**: 단어 카드 "저장했어!"/"다시 저장하기", 물어볼 단어 "적어 뒀어!"/"다시 저장하기". [또 물어보기]·예문·들은 상황은 화면에서 뺀다.
- **영어 표기**: `WordEntry.english?` 추가, mock 10개 채움, 없으면 숨김. 카드 상세는 `wordEntryId`로 데이터에서 찾는다(저장 형식은 그대로).
- **목록**: "학습 상태" Select + 칩 [전체][새 단어][복습 중][완료] 같은 값 공유. 모든 카드 "새 단어".
- **저장·전송 안내는 /parent로만**. /parent는 Figma 헤더("<" → 홈) + 안내.
- **계획 확인 1~4 (기본값 확정)**: ① 후보 단어 20 Bold ② Figma에 없는 화면 헤더 이름: 부적절 단어 "부적절 단어 안내 화면", /parent "보호자 화면", 카드 상세 "단어 카드 화면" ③ 줄 간격 토큰 고정(아래 표) ④ 비교는 새 패키지 없이 headless Chrome 스크린샷 + 나란히 붙인 HTML 스크린샷, 위치는 DOM 좌표 vs Figma 메타데이터.
- **줄 간격 토큰** (Noto Sans KR 기본 줄 간격이 Inter보다 커서 Figma 높이로 고정. PM이 Figma 글꼴을 바꿀 때 Figma에도 같은 px를 넣는다):

| 토큰 | 크기 | 줄 간격 |
|---|---|---|
| `text-word` | 28px | 34px |
| `text-title` | 20px | 24px |
| `text-body` | 16px | 19px |
| `text-button` | 14px | 17px |
| `text-caption` | 12px | 15px |
| `text-label` | 11px | 13px |

- **스타일 기타**: Noto Sans KR(next/font/google, Geist 제거), 다크 모드 제거, 앱 틀 최대 390px 가운데, 버튼 보이는 크기 Figma 그대로 + `::before`로 누르는 영역 48px, "<"는 글자 없이 aria-label("이전 화면"/"홈으로").
- **askFlow 변경안**: `review` 추가, `openConfirm`·`openChoose`·`openUnknown`·`showRetryGuide`·`back`(각 상태의 `from`) 추가, `context`·`pickContext`·`micDenied`·`stopListening` 제거. 04 §4 다이어그램 참고.

### 반드시 지킬 것 (CLAUDE.md 요약)

- 답변은 한국어, 결론 먼저. 파일 수정 전에 계획을 먼저 말한다(그룹 13은 계획 확인 완료).
- **새 의존성·새 API는 이유와 대안을 말하고 사용자 확인을 받은 뒤에만.** 픽셀 비교 도구도 설치 전에 묻는다.
- 해커톤 외부 API는 음성인식(STT) 하나뿐. 음성 출력은 브라우저 `speechSynthesis`.
- 아이에게 보여주는 설명은 `src/data`의 단어 데이터만. 아이 음성 원본은 저장하지 않는다.
- `src/lib/pronunciation`·`storage`·`services`는 그룹 13에서 건드리지 않는다.
- Next 16은 학습 데이터와 다를 수 있다. 코드 작성 전 `node_modules/next/dist/docs/`의 관련 문서를 확인한다 (`AGENTS.md`).

### 사용자와 정한 진행 리듬

1. `/opsx:apply add-word-question-mvp` 로 진행하되, 사용자가 범위를 정해 준다.
2. 그룹이 끝나고 `npm test`·`npm run lint`·`npm run build`가 통과하면 **묻지 말고 커밋**한 뒤, 다음 그룹 시작 전에 멈추고 리포트한다.
3. 리포트에는 반드시: **"tasks.md(또는 Figma)와 다르게 한 부분"**, **"문서에 없어서 내가 정한 부분"**, 바뀐 파일. 그룹 13은 화면별 결과표(일치 / 폰트 차이 / 그 밖의 차이)와 줄 간격 토큰 표도.
4. 구현 중 정한 잠정 해석은 `design.md` Open Questions에 기록한다.
5. 문서 커밋과 코드 커밋은 분리한다. 메시지 형식: `feat: … (작업 x.y~x.z)`, `docs(openspec): …`
6. 빌드할 때는 묻지 않고 localhost:3000 개발 서버를 끄고 `npm run build` 후 개발 서버를 다시 켜 둔다(서버가 떠 있는 채로 빌드하면 개발 서버가 깨진다). **단, 사용자가 "개발 서버는 켜지 마"라고 하면 다시 켜지 않는다.** 메모리 부족으로 개발 서버가 종료된 적이 있다(2026-10-04).
7. 브라우저 확인에 띄운 headless Chrome·임시 서버(`next start -p 3123` 등)는 끝나면 바로 정리한다.

---

## 3. 문서 지도

| 파일 | 내용 | 언제 보나 |
|---|---|---|
| `CLAUDE.md` | 프로젝트 규칙, 경계(Boundaries) | 항상 |
| `openspec/changes/add-word-question-mvp/tasks.md` | 구현 체크리스트. **그룹 13** | 작업 시작 전 |
| `openspec/changes/add-word-question-mvp/design.md` | 결정과 이유. **"Figma 와이어프레임 전면 적용 (2차)"**, Open Questions | 결정이 애매할 때 |
| `openspec/changes/add-word-question-mvp/specs/*/spec.md` | 7개 capability의 요구사항·시나리오 | 동작을 확인할 때 |
| `planning/md-design/03_UX_UI_SPEC.md` | **화면별 구성·이동(§1), 컴포넌트(§2), Visual 값·토큰(§5)** | 화면 만들 때 |
| `planning/md-design/04_TECHNICAL_DESIGN.md` | 라우트, 데이터 모델(§3), **상태 기계(§4)**, 저장(§5) | 구조 확인 |
| `planning/md-design/05_DELIVERY_PLAN.md` | 일정(§1), **수동 QA(§4, QA-01~14)**, 데모 시나리오(§5) | QA·일정 |
| `planning/md-design/02_REQUIREMENTS_SPEC.md` | FR/NFR ID, 인수조건, 추적표 | 요구사항 ID 확인 |
| `docs/PRD.md`, `docs/DESIGN.md`, `docs/ARCHITECTURE.md` | 요약판 | 참고 |

---

## 4. 지금 코드 (그룹 13 후)

| 파일 | 역할 |
|---|---|
| `src/types/index.ts` | WordEntry(`english?` 포함), WordCard, PendingWord, Candidate 등 |
| `src/lib/config.ts` | MAX_DISTANCE=2, MAX_CANDIDATES=3, MAX_RETRY=1, MAX_RECORDING_MS=8000 |
| `src/lib/pronunciation/*` | 자모·거리·역규칙·추출·후보(`inferWord`. `orderByContext`는 화면에서 안 씀) |
| `src/data/words.mock.ts` | mock 단어 10개 (검수 전, 영어 표기 포함) |
| `src/data/{examplePrompts,blocklist,rules}.ts` | 예시 문장 3개, 부적절 단어 mock "나쁜말", 역규칙 |
| `src/lib/storage/index.ts` | `moya.cards.v1`, `moya.pending.v1` |
| `src/lib/services/stt/*`, `src/app/api/stt/route.ts` | STT 어댑터(mock: 두박 → 가바 → 뿌잉뿌잉 순), `POST /api/stt` |
| `src/lib/services/speech.ts` | speechSynthesis 래퍼 |
| `src/lib/askFlow.ts` + `tests/askFlow.test.ts` | 묻기 흐름 reducer (review·open*·showRetryGuide·back, 각 상태의 `from`) |
| `src/app/globals.css`, `src/app/layout.tsx` | `@theme` 토큰(색·모서리·글자/줄 간격), `touch-target` 유틸, Noto Sans KR, 앱 틀 390px |
| `src/components/{Button,ImageSlot,Header,BottomTabs,ScreenHeading,SoundButton,styles}` | Figma 공통 컴포넌트 (버튼 3종, 이미지 자리, 헤더, 하단 탭, 카드 박스) |
| `src/components/AskScreen.tsx` | `/app/ask` 전 화면(S1·E1·E2·E3·S12·S3·S4·S5·S6). 녹음·STT·저장·소리 연결 |
| `src/components/{HomeScreen,MicPermissionScreen,CandidatePicker,WordCardView,CardsScreen,CardDetailScreen,QuestionForm,ExamplePrompts,PrivacyNotice,useSavedWords,microphone}` | 화면·도우미 |
| `src/app/parent/page.tsx` | 보호자 화면: 저장·전송 안내 |
| `public/chevron.svg` | Figma Select 화살표 에셋 |

코드 규칙:
- `src/lib`, `src/data`, `src/types`끼리는 **`.ts` 확장자가 붙은 상대 경로**로 import (Node 테스트 러너). 컴포넌트에서는 `@/` 별칭.
- 저장은 reducer 밖(`AskScreen`의 `saveCard`·`savePending`)에서 하고 결과를 `cardSaved`/`pendingSaved` 액션으로 알린다. 비동기 콜백은 `current` ref로 최신 상태를 읽는다.
- ID는 `crypto.randomUUID` 대신 직접 만든다 (http 접속 대비).
- 화면 전환 시 h1로 포커스 이동(`ScreenHeading`의 `focusKey`).

---

## 5. 남은 작업

| 작업 | 내용 | 메모 |
|---|---|---|
| **11.1~11.2** | 랜딩 S0, 실기기 데모 시나리오 통합 확인 | **다음 작업**. 05 §5 |
| 10.5 | 실제 STT 연동 | **보류**. STT 확정(~10/22) 후 |

검증 방법 메모(13.10에서 사용): Figma 메타데이터(node 좌표)는 `get_metadata`(node 1271:481)로 얻는다. 비교 이미지는 scratchpad 같은 커밋하지 않는 폴더에 둔다. 비교할 때 홈은 카드 3개를 넣은 상태로 본다(0개면 배너가 숨겨져 위치가 달라짐). Chrome 확장이 연결되지 않으면 headless Chrome + Node 내장 WebSocket(CDP)으로 확인할 수 있다(이전 세션에서 사용). 13.10 결과: 화면 10개 주요 요소가 Figma 좌표와 ±1px, 예외는 확인 질문(S3) 힌트 글자 높이로 아래가 4px 밀림(의도). 375px 가로 넘침 없음.

---

## 6. 이후 작업에 걸리는 Open Questions (design.md에 기본값 있음)

| 질문 | 기본값 |
|---|---|
| 모야 말투, 반말·존댓말 통일, 확인 질문 틀 2~3종 | Figma 문구 그대로, 틀 1종 "○○ 말하는 거야? <힌트>!" |
| [그만하기] 버튼 이름 | 유지, 말투 정할 때 다시 |
| 부적절 단어 목록·판별 기준 | mock 1개, 정확히 같을 때만 |
| STT 서비스 | mock 어댑터 |
| 최대 녹음 시간 | 8초 (실기기에서 조정) |
| 지시어만 있는 질문("이게 뭐야") | "이게"를 단어로 꺼냄 → 물어볼 단어 |
| 같은 거리 후보 순서 | 데이터 순서 ("가바" → 가방 먼저) |
| 단어장 정렬·중복 카드 | 최근 저장 순, 중복 제거 없음 |
| 고지 문구 최종안 | 03 §3 잠정 문구 |
| 배포 환경 | 미정 (11/5 전 결정) |

---

## 7. 일정과 코드 밖 할 일 (05 §1)

| 날짜 | 내용 | 코드 영향 |
|---|---|---|
| ~10/15 | STT 후보 3종 선정, 녹음 테스트 단어 10개를 `WordEntry`로 작성 (PM) | `words.mock.ts` 교체 준비 |
| 10/16~10/22 | 아이 녹음 테스트, 역규칙 보정 | `src/data/rules.ts`, `config.ts` 값 조정 |
| ~10/22 | STT 확정 | 10.5 시작 가능 |
| 10/29 | 검수된 단어 데이터 50~100개, 핵심 화면 UI 전달 | 데이터 교체, 디자인 입히기 |
| 11/5 | **1차 배포** | 13·11 그룹 완료 필요 |
| 11/6~11/12 | 사용성 테스트 | — |
| 11/20 | 최종 배포, 발표 | — |

PM 할 일: Figma 글꼴 교체 시 §2의 줄 간격 토큰 px를 Figma에도 넣는다.

---

## 8. 시작 절차 (새 세션의 AI가 할 일)

1. 이 문서, `CLAUDE.md`, `tasks.md` 그룹 13, `design.md` "Figma 와이어프레임 전면 적용 (2차)"를 읽는다.
2. `git status`, `git log --oneline -5`로 커밋 상태를 확인한다.
3. `npm test`, `npm run lint`를 실행한다. (`npm run build`는 개발 서버 규칙(§2-6)을 지킨다)
4. 결과를 사용자에게 3줄 이내로 보고한다 (통과 여부, 미커밋 변경, 다음 작업 = 11.1).
5. 사용자가 진행을 요청하면 `/opsx:apply add-word-question-mvp`로 11.1부터 시작한다.
