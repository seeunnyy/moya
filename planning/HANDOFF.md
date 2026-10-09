# 모야 인수인계 (2026-10-09 기준, apply-hifi-design 제안 직후)

> 이 문서를 읽는 AI에게: 이 프로젝트를 이어받아 구현을 계속한다.
> 먼저 이 문서 → `CLAUDE.md` → `planning/prompts/design-v2-2026-10-09.md`(A: 결정·비교 기준, B: 피그마 노드 지도) → `openspec/changes/apply-hifi-design/` 의 tasks.md·design.md 순으로 읽고,
> 아래 "8. 시작 절차"대로 상태를 확인한 뒤 사용자에게 짧게 보고하고 작업을 시작한다.

---

## 1. 한눈에 보기

| 항목 | 내용 |
|---|---|
| 서비스 | 모야 — 만 5~8세 아이가 "○○이 뭐야?"라고 물으면, 서툰 발음도 되물어 단어를 찾고 아이 눈높이로 설명하는 모바일 웹 (2026 4호선톤 출품 MVP) |
| 저장소 | `github.com/seeunnyy/moya` / 로컬: `C:\Users\arong\moya` (Windows). **작업 브랜치 `design-v2`** (main은 옛 와이어프레임 구조) |
| 스택 | Next.js 16.3.8 (App Router), React 19.2.8, TypeScript, Tailwind CSS 4. 추가 의존성 없음 |
| 테스트 | Node 내장 러너 `npm test` (`node --test "tests/**/*.test.ts"`). 81개 통과 (옛 그룹 13 시점) |
| 작업 방식 | OpenSpec spec-driven. 이전 change `add-word-question-mvp`는 2026-10-09 archive(기준 스펙 `openspec/specs/` 7개). **진행 중 change는 `apply-hifi-design`** |
| 디자인 기준 | 완성 피그마 `U3GaTLJGAbLj5qgTTJiodv` '디자인' 페이지(`180:5325`), 64장, 프레임 402×874 |
| 진행률 | apply-hifi-design 제안·문서 교체 완료, 구현 0/13 그룹 |
| 다음 할 일 | **그룹 1 재료 준비** (토큰·글꼴·에셋·mock 데이터·앱 틀). 프롬프트는 design-v2 문서 C의 "프롬프트 2" |

> 코드는 아직 옛 회색 와이어프레임 구조다(§4). 새 화면·주소·상태는 apply-hifi-design design.md의 "화면 목록", "버튼 → 이동할 화면", "화면 ↔ 주소·상태" 표를 따른다.

---

## 2. 확정된 결정 (다시 묻지 말 것)

기준 문서 `planning/prompts/design-v2-2026-10-09.md` A가 우선한다. 옛 와이어프레임 시기의 결정(되묻기 화면 S12, 맥락 질문 제거, 저장 버튼, 예문 숨김, 390px, 줄 간격 토큰 등)은 **더 이상 유효하지 않다.** 대체 내역은 apply-hifi-design design.md "옛 결정 중 이 change로 대체되는 것".

PM 확정 (A-2):
1. **보호자 가입·로그인·카카오·비밀번호** (1-0, 1-2, 1-5, 1-5a, 5-1, 5-1a, 5-1b, 5-6): 화면은 피그마와 똑같이, 동작은 이 기기(localStorage)에만 저장하는 가짜 가입 [MVP]. 카카오 연동·메일 발송·서버 계정은 [베타].
2. **녹음 듣기·음성 기록 삭제·목소리 활용 동의** (1-4, 5-3, 5-4, 5-7, 5-8): 화면은 두되 '녹음 듣기'는 숨기고 인식된 글자만. 아이 음성 원본 저장 안 함. 원본 저장은 [나중].
3. **"어디서 들었어?"(2-5) 맥락 질문 되살리기** [MVP]. `orderByContext` 다시 연결.
4. **카드에 예문 보여주기** (2-10, 3-2) [MVP]. 예문은 `src/data` 검수 데이터에서만.
5. **별·미션·로켓** (헤더 미션 별 3칸·별 개수, 2-0, 2-13, 2-14, 3-5) [MVP]. 이 기기에 저장.
6. **보호자가 단어 알려주기** (5-3, 5-3a) [MVP]. 검수된 단어만, 연결은 이 기기에 저장, 다음에 같은 말이 들리면 후보 맨 앞. `src/lib/pronunciation`은 순수 함수 유지.
7. **④ 베타 8장(4-1~4-6) 제외** [베타]. 베타 표시 항목은 보이기만 한다.

화면·비교 기준 (A-3):
- 기준 폭 402px(앱 틀 최대 402). 402px에서 피그마와 일치, 375·390px에서는 넘침·잘림 없음.
- 상태바(위 62px)·홈 인디케이터는 만들지 않음. 하단 탭바 아래 여백(46px)은 유지(실기기는 safe-area).
- 1-7 마이크 권한 팝업은 진짜 브라우저 권한 창.
- 비교: 피그마 프레임에서 위 62px를 뺀 402×812 vs 브라우저 402×812. 숫자는 피그마 그대로, 위치 ±1px, 글자 렌더링 차이는 표로 보고.
- 피그마 프로토타입의 2.5초/1.5초 자동 넘김은 mock STT일 때만 흉내 낸다.

OpenSpec 정리 (2026-10-09 PM 확인):
- `add-word-question-mvp`의 11.1 랜딩 → 새 1-1(그룹 9), 11.2 실기기 데모 → 그룹 12, 10.5 실제 STT → 그룹 12.1(보류 유지)로 이관하고 archive.
- 새 change는 `openspec/specs/` 기준 델타(ADDED/MODIFIED/REMOVED)로 쓴다.

**잠정 결정 T1~T15** (PM 확인 전 기본값, apply-hifi-design design.md): 내가 말한 소리 TTS, 아이 화면 베타 연결 표시만, 2-7 후보 없으면 폴백, 부적절 안내·폴백 유지, 5-7 삭제 범위, 5-4a 문구, 5-1 × → 3-4, 철회 후 재동의 → 5-4, E-2 재시도 후 이동, 같은 단어 재획득, 빈 지구 사전, 5-3 입력 안내, 입력 오류 문구, 1-4 선택 동의 문구, 없는 카드 id. 바뀌면 `/opsx:update apply-hifi-design`.

### 반드시 지킬 것 (CLAUDE.md 요약)

- 답변은 한국어, 결론 먼저. 파일 수정 전에 계획을 먼저 말한다.
- **새 의존성·새 API는 이유와 대안을 말하고 사용자 확인을 받은 뒤에만.** 글꼴 파일(NanumSquareRound)·픽셀 비교 도구도 넣기 전에 묻는다.
- 해커톤 외부 API는 음성인식(STT) 하나뿐. 음성 출력은 브라우저 `speechSynthesis`.
- 아이에게 보여주는 설명·예문·힌트는 `src/data`의 단어 데이터만. 아이 음성 원본은 저장하지 않는다.
- `get_design_context` 전에 `figma-design-to-code` 스킬을 읽는다. 피그마 에셋 URL은 7일 임시라 받는 즉시 `public/`에 저장하고 코드에 남기지 않는다. 페이지 노드(180:5325) 전체 `get_metadata`는 너무 크니 섹션·프레임 노드로 나눠 읽는다.
- 피그마에 없는 상태가 필요하면 만들기 전에 묻는다.
- Next 16은 학습 데이터와 다를 수 있다. 코드 작성 전 `node_modules/next/dist/docs/`의 관련 문서를 확인한다 (`AGENTS.md`).

### 사용자와 정한 진행 리듬

1. `/opsx:apply apply-hifi-design`으로 진행하되, 사용자가 범위(그룹)를 정해 준다. 한 세션에 한 그룹.
2. 그룹이 끝나고 `npm test`·`npm run lint`·`npm run build`가 통과하면 **묻지 말고 커밋**한 뒤, 다음 그룹 시작 전에 멈추고 리포트한다.
3. 리포트에는 반드시: **"피그마·문서와 다르게 한 부분"**, **"문서에 없어서 내가 정한 부분"**, 바뀐 파일. 화면 그룹은 화면별 결과표(일치 / 글자 렌더링 차이 / 그 밖의 차이).
4. 구현 중 정한 잠정 해석은 apply-hifi-design design.md에 기록한다.
5. 문서 커밋과 코드 커밋은 분리한다. 메시지 형식: `feat: … (작업 x.y~x.z)`, `docs(openspec): …`, `docs: …`
6. 빌드할 때는 묻지 않고 localhost:3000 개발 서버를 끄고 `npm run build` 후 개발 서버를 다시 켜 둔다. **단, 사용자가 "개발 서버는 켜지 마"라고 하면 다시 켜지 않는다.**
7. 브라우저 확인에 띄운 headless Chrome·임시 서버는 끝나면 바로 정리한다.

---

## 3. 문서 지도

| 파일 | 내용 | 언제 보나 |
|---|---|---|
| `CLAUDE.md` | 프로젝트 규칙, 경계(Boundaries) | 항상 |
| `planning/prompts/design-v2-2026-10-09.md` | **PM 결정(A-2), 비교 기준(A-3), 피그마 노드 지도(B), 그룹별 프롬프트(C)** | 작업 시작 전 |
| `openspec/changes/apply-hifi-design/tasks.md` | 구현 체크리스트 (그룹 1~13) | 작업 시작 전 |
| `openspec/changes/apply-hifi-design/design.md` | **화면 목록 64장, 버튼 → 이동할 화면, 화면 ↔ 주소·상태**, 결정, 잠정 결정 T1~T15 | 화면·이동 만들 때 |
| `openspec/changes/apply-hifi-design/specs/*/spec.md` | 11개 capability 델타 (수정 7, 신규 4) | 동작 확인 |
| `openspec/specs/*/spec.md` | archive된 기준 스펙(옛 구조) | 델타 비교 |
| `planning/md-design/03_UX_UI_SPEC.md` | 화면·컴포넌트·값 — **옛 구조. 각 화면 그룹에서 고친다** | 화면 만들 때 |
| `planning/md-design/04_TECHNICAL_DESIGN.md` | 라우트·데이터 모델·상태 기계·저장 — **옛 구조. 그룹 3에서 고친다** | 구조 확인 |
| `planning/md-design/05_DELIVERY_PLAN.md` | 일정, 수동 QA, 데모 시나리오 — **그룹 12에서 고친다** | QA·일정 |
| `planning/md-design/02_REQUIREMENTS_SPEC.md` | FR/NFR, 추적표 — **그룹 3에서 고친다** | 요구사항 ID |
| `docs/PRD.md`, `docs/DESIGN.md`, `docs/ARCHITECTURE.md` | 요약판 (DESIGN은 새 기준으로 갱신됨) | 참고 |

---

## 4. 지금 코드 (옛 와이어프레임 구조, apply-hifi-design 그룹 1 시작 전)

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

| 그룹 | 내용 | 메모 |
|---|---|---|
| **1** | 재료 준비: 토큰·글꼴·에셋·mock 데이터·앱 틀 | **다음 작업**. NanumSquareRound 파일은 확인 후 |
| 2 | 공통 부품 | 개발용 부품 모음 주소로 피그마 비교 |
| 3 | 이동 설계·상태 기계·저장 | askFlow 재작성, 저장 키 추가, 04·02 문서 |
| 4~11 | 바로 알아들음 / 헷갈릴 때 / 모르는 단어·못 알아들음 / 오늘의 미션 / 지구 사전·오늘의 단어·내 정보 / 온보딩 / 보호자·설정 / 예외 | 그룹마다 03 문서의 해당 화면 수정 |
| 12 | 전체 비교 검증·실기기 데모 | 12.1 실제 STT는 **보류**(STT 확정 ~10/22 후) |
| 13 | 모션 | 범위는 그때 확인 (180:9283) |

검증 방법 메모: 피그마 좌표는 프레임 노드 `get_metadata`(y − 62). 비교 이미지는 scratchpad 같은 커밋하지 않는 폴더에. Chrome 확장이 연결되지 않으면 headless Chrome + Node 내장 WebSocket(CDP)으로 402×812 캡처.

---

## 6. 이후 작업에 걸리는 Open Questions (옛 change에서 이어짐)

| 질문 | 기본값 |
|---|---|
| 모야 말투·문구 | 새 피그마 문구 그대로 |
| 부적절 단어 목록·판별 기준 | mock 1개, 정확히 같을 때만 |
| STT 서비스 | mock 어댑터 |
| 최대 녹음 시간 | 8초 (실기기에서 조정) |
| 지시어만 있는 질문("이게 뭐야") | "이게"를 단어로 꺼냄 → 물어볼 단어 |
| 같은 거리 후보 순서 | 들은 곳(2-5) → 데이터 순서 |
| 지구 사전 정렬·중복 카드 | 최근 순, 같은 단어는 카드 1장(T10) |
| 고지 문구 최종안 | 피그마 1-4·1-2a 문구 (T14 확인 필요) |
| 배포 환경 | 미정 (11/5 전 결정) |

---

## 7. 일정과 코드 밖 할 일 (05 §1)

| 날짜 | 내용 | 코드 영향 |
|---|---|---|
| ~10/15 | STT 후보 3종 선정, 녹음 테스트 단어 10개를 `WordEntry`로 작성 (PM) | `words.mock.ts` 교체 준비 |
| 10/16~10/22 | 아이 녹음 테스트, 역규칙 보정 | `src/data/rules.ts`, `config.ts` 값 조정 |
| ~10/22 | STT 확정 | 10.5 시작 가능 |
| 10/29 | 검수된 단어 데이터 50~100개, 핵심 화면 UI 전달 | 데이터 교체, 디자인 입히기 |
| 11/5 | **1차 배포** | apply-hifi-design 그룹 1~12 완료 필요 |
| 11/6~11/12 | 사용성 테스트 | — |
| 11/20 | 최종 배포, 발표 | — |

PM 할 일: 잠정 결정 T1~T15 확인, 그룹 1 전에 NanumSquareRound 파일 사용 확인.

---

## 8. 시작 절차 (새 세션의 AI가 할 일)

1. 이 문서, `CLAUDE.md`, `planning/prompts/design-v2-2026-10-09.md`, apply-hifi-design의 `tasks.md`·`design.md`를 읽는다.
2. 브랜치가 `design-v2`인지, `git status`, `git log --oneline -5`로 커밋 상태를 확인한다.
3. `npm test`, `npm run lint`를 실행한다. (`npm run build`는 개발 서버 규칙(§2-6)을 지킨다)
4. 결과를 사용자에게 3줄 이내로 보고한다 (통과 여부, 미커밋 변경, 다음 작업 = 그룹 1).
5. 사용자가 진행을 요청하면 `/opsx:apply apply-hifi-design`으로 그 그룹을 시작한다.
