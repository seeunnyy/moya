# 모야 인수인계 (2026-10-11 기준, apply-hifi-design 그룹 12 끝)

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
| 테스트 | Node 내장 러너 `npm test` (`node --test "tests/**/*.test.ts"`). 140개 통과 |
| 작업 방식 | OpenSpec spec-driven. **진행 중 change `apply-hifi-design`** (이전 change는 archive, 기준 스펙 `openspec/specs/`) |
| 디자인 기준 | 완성 피그마 `U3GaTLJGAbLj5qgTTJiodv` '디자인' 페이지(`180:5325`), 64장, 프레임 402×874 |
| 진행률 | 그룹 1~11·13 완료, 그룹 12는 12.2~12.4 완료·12.5 문서 완료(실기기 확인은 PM). 남은 것: **12.1 실제 STT(보류, ~10/22)**, 12.5 실기기 |
| 다음 할 일 | PM이 휴대폰으로 데모 확인(05 §6) → STT 확정되면 12.1 |

> ④ 베타(4-1~4-6)를 뺀 피그마 화면이 모두 코드로 있다. 화면·이동·주소는 design.md의 "화면 목록", "버튼 → 이동할 화면", "화면 ↔ 주소·상태" 표, 화면별 값은 03 §1-A.

---

## 2. 확정된 결정 (다시 묻지 말 것)

기준 문서 `planning/prompts/design-v2-2026-10-09.md` A가 우선한다. 옛 와이어프레임 시기의 결정은 더 이상 유효하지 않다(design.md "옛 결정 중 이 change로 대체되는 것").

PM 확정 (A-2):
1. **보호자 가입·로그인·카카오·비밀번호**: 화면은 피그마 그대로, 동작은 이 기기(localStorage)에만 저장하는 가짜 가입 [MVP]. 카카오 연동·메일 발송·서버 계정은 [베타].
2. **녹음 듣기·음성 기록 삭제·목소리 활용 동의**: '녹음 듣기'는 숨기고 인식된 글자만(TTS로 읽음). 아이 음성 원본 저장 안 함.
3. **"어디서 들었어?"(2-5)** [MVP]. `orderByContext`로 같은 거리 후보 정렬.
4. **카드에 예문 보여주기** (2-10, 3-2) [MVP]. 예문은 `src/data`에서만.
5. **별·미션·로켓** [MVP]. 이 기기에 저장.
6. **보호자가 단어 알려주기** (5-3, 5-3a) [MVP]. 검수 단어만, 다음에 같은 말이 들리면 첫 후보.
7. **④ 베타 8장 제외**. 베타 표시 항목은 보이기만 한다.

잠정 결정 T1~T15: 대부분 그룹 진행 중 PM 확인으로 확정(design.md "잠정 결정" 표의 **확정** 표시). 피그마에 없는 상태(빈 지구 사전, 폴백, 부적절 단어, 온보딩 E-2, 5-3 안내, 5-4a 문구 등)는 모두 PM이 고른 모양이다.

화면·비교 기준 (A-3):
- 기준 폭 402px(앱 틀 최대 402). 402px에서 피그마와 일치(위 62px 상태바 뺀 402×812, 위치 ±1px), 375·390px에서는 넘침·잘림 없음.
- 상태바·홈 인디케이터는 만들지 않음. 1-7은 진짜 브라우저 권한 창.
- 피그마 프로토타입의 2.5초/1.5초 자동 넘김은 mock STT일 때만 흉내 낸다(2-13 → 2-14 1.5초는 실제로도).

### 반드시 지킬 것 (CLAUDE.md 요약)
- 답변은 한국어, 결론 먼저. 파일 수정 전에 계획을 먼저 말한다.
- **새 의존성·새 API·새 도구는 이유와 대안을 말하고 확인받은 뒤에만.**
- 해커톤 외부 API는 음성인식(STT) 하나뿐. 음성 출력은 `speechSynthesis`. 외부 API는 `src/lib/services` 어댑터 → 서버(`src/app/api`)에서만.
- 아이에게 보여주는 설명·예문·힌트는 `src/data`만. 아이 음성 원본은 저장하지 않는다.
- `get_design_context` 전에 `figma-design-to-code` 스킬. 피그마 에셋 URL은 7일 임시라 받는 즉시 `public/`에 저장.
- 피그마에 없는 상태가 필요하면 만들기 전에 묻는다. 지울 것은 목록을 먼저 보여 준다.
- Next 16은 학습 데이터와 다를 수 있다. 코드 작성 전 `node_modules/next/dist/docs/` 확인 (`AGENTS.md`).

### 사용자와 정한 진행 리듬
1. `/opsx:apply apply-hifi-design`으로, 사용자가 범위(그룹)를 정해 준다. 한 세션에 한 그룹.
2. 그룹이 끝나고 `npm test`·`npm run lint`·`npm run build`가 통과하면 **묻지 말고 커밋**(코드·문서 커밋 분리)한 뒤 멈추고 리포트한다.
3. 리포트: 화면별 결과표(일치 / 글자 렌더링 차이 / 그 밖의 차이), **피그마와 다르게 한 부분**, **내가 정한 부분**, **직접 확인하는 방법**(어떤 주소·시드·버튼).
4. 정한 해석은 design.md의 그룹 절에 기록한다.
5. 커밋 메시지: `feat: … (작업 x.y~x.z)`, `docs: …`
6. 빌드할 때는 묻지 않고 localhost:3000 개발 서버를 끄고 `npm run build` 후 다시 켜 둔다. 사용자가 켜지 말라고 하면 켜지 않는다.
7. 브라우저 확인에 띄운 headless Chrome·임시 서버는 끝나면 바로 정리한다. 프로젝트 폴더에 임시 파일을 남기지 않는다.

---

## 3. 문서 지도

| 파일 | 내용 | 언제 보나 |
|---|---|---|
| `CLAUDE.md` | 프로젝트 규칙, 경계(Boundaries) | 항상 |
| `planning/prompts/design-v2-2026-10-09.md` | PM 결정(A-2), 비교 기준(A-3), 피그마 노드 지도(B) | 작업 시작 전 |
| `openspec/changes/apply-hifi-design/tasks.md` | 구현 체크리스트 (그룹 1~13) | 작업 시작 전 |
| `openspec/changes/apply-hifi-design/design.md` | 화면 목록·이동표·주소표, 결정, 잠정 결정 T1~T15, **그룹별 결과표와 정한 부분**(그룹 12에 전체 흐름·비교 모음) | 화면·이동 만들 때 |
| `planning/md-design/03_UX_UI_SPEC.md` | §1-A 화면별 구성·값(피그마 값), §2 부품 | 화면 고칠 때 |
| `planning/md-design/04_TECHNICAL_DESIGN.md` | 주소·데이터 모델·상태 기계·저장 키·설정값 | 구조 확인 |
| `planning/md-design/05_DELIVERY_PLAN.md` | 일정, **수동 QA·데모 시나리오·휴대폰 접속 방법(§6)** | QA·시연 |
| `planning/md-design/02_REQUIREMENTS_SPEC.md` | FR/NFR, 추적표 | 요구사항 ID |
| `docs/PRD.md`, `docs/DESIGN.md`, `docs/ARCHITECTURE.md` | 요약판 | 참고 |

---

## 4. 지금 코드

| 위치 | 역할 |
|---|---|
| `src/app/` | 주소: `/`(1-1) `/login` `/signup/*` `/terms` · `/app`(2-0~2-14, E-1, E-2) `/app/dictionary(/[cardId])` `/app/today` `/app/me(/stars)` · `/parent`(5-1) `/parent/reset` `/parent/(locked)/*`(5-2~5-9, 철회 뒤 1-4는 `/parent/settings/consent`) · `/api/stt` · `/dev/components` `/dev/seed`(개발용) |
| `src/components/ui/` | 완성 피그마 공통 부품 (03 §2) |
| `src/components/` | 화면: `KidAskScreen`(아이 묻기 전부), `OnboardingScreens`, `DictionaryScreen`·`DictionaryCardScreen`, `TodayScreen`, `MeScreen`, `StarsScreen`, `ParentScreens`, `MicOffBody`(E-2 가운데), `KidTop`(헤더 + 2-0 시트), `gates`(계정·보호자 잠금), `useStored`, `microphone` |
| `src/lib/askFlow.ts` | 아이 묻기 상태 기계 (순수 reducer + 테스트) |
| `src/lib/{progress,cardView,parent,onboarding}.ts` | 별·미션·로켓·오늘의 단어 / 카드 보이기 / 보호자 메뉴 / 가입 입력 — 순수 함수 + 테스트 |
| `src/lib/pronunciation/*` | 자모·거리·역규칙·추출·후보(보호자 연결 → 거리 → 들은 곳 → 데이터 순) |
| `src/lib/services/` | `stt`(서버 어댑터, 지금 mock), `recognize`(화면 → /api/stt, 네트워크 오류 한 번 다시 시도), `speech`(speechSynthesis) |
| `src/lib/storage/index.ts` | localStorage 키 `moya.*.v1` (04 §5) |
| `src/lib/devSeed.ts` | 시연 시드 (`/dev/seed`) |
| `src/data/` | mock 단어 9개(검수 전), 예시 문장·mock STT 차례, 역규칙, 부적절 단어 |
| `next.config.ts` | 개발 서버에 같은 와이파이 휴대폰이 접속하도록 사설망 `allowedDevOrigins` |

코드 규칙:
- `src/lib`, `src/data`, `src/types`끼리는 **`.ts` 확장자가 붙은 상대 경로**로 import (Node 테스트 러너). 컴포넌트에서는 `@/` 별칭.
- 저장은 reducer 밖에서 하고 결과를 액션으로 알린다. 비동기 콜백은 ref로 최신 상태를 읽는다.
- ID는 `src/lib/id.ts`의 `newId()` (http 접속에서 `crypto.randomUUID`가 없을 수 있음).
- 피그마에 없는 상태·문구는 PM 확인 뒤에만, 코드 주석에 "(PM 확인 날짜)"를 남긴다.

---

## 5. 남은 작업

| 그룹 | 내용 | 메모 |
|---|---|---|
| 12.1 | 실제 STT 어댑터 | **보류**(STT 확정 ~10/22 후). `src/lib/services/stt`에 어댑터 추가, 키는 `.env.local`, 클라이언트 빌드에 키가 없는지 확인 |
| 12.5 | 실기기 데모 | 문서·안내 완료(05 §5·§6). PM이 휴대폰으로 마이크·폴백 시나리오를 끝까지 진행 |

검증 방법 메모: 피그마 좌표는 프레임 노드 `get_metadata`(y − 62). 화면 비교는 headless Chrome + Node 내장 WebSocket(CDP)으로 402×812 캡처해 피그마 스크린샷(위 62px 잘라 냄)과 겹쳐 본다. 비교 이미지·스크립트는 커밋하지 않는 임시 폴더에. mock STT 차례는 개발 서버를 다시 켜면 처음부터.

---

## 6. 이후 작업에 걸리는 Open Questions

| 질문 | 기본값 |
|---|---|
| STT 서비스 | mock 어댑터 (10/22 확정) |
| 최대 녹음 시간 | 8초 (실기기에서 조정) |
| 부적절 단어 목록·판별 기준 | mock 1개, 정확히 같을 때만 |
| 동의 철회 뒤 다시 동의하지 않았을 때 | 지금은 아이 묻기를 막지 않음 (12.1 실제 STT 때 결정) |
| 5-2·5-3 "녹음을 듣고" 문구 | 피그마 그대로 (실제로는 인식 글자 TTS — 문구 검토) |
| 3-3a 375px에서 말풍선 4줄로 45px 길어짐 | 화면이 스크롤됨 (잘림 없음) |
| 배포 환경 | 미정 (11/5 전 결정, iPhone 마이크 확인에 https 필요) |

---

## 7. 일정과 코드 밖 할 일 (05 §1)

| 날짜 | 내용 | 코드 영향 |
|---|---|---|
| ~10/15 | STT 후보 3종 선정, 녹음 테스트 단어 10개를 `WordEntry`로 작성 (PM) | `words.mock.ts` 교체 준비 |
| 10/16~10/22 | 아이 녹음 테스트, 역규칙 보정 | `src/data/rules.ts`, `config.ts` 값 조정 |
| ~10/22 | STT 확정 | 12.1 시작 |
| 10/29 | 검수된 단어 데이터 50~100개 | 데이터 교체 (`src/data`), 시연 문장·mock 차례도 같은 패턴으로 |
| 11/5 | **1차 배포** | 배포 URL에서 05 QA·데모, iPhone 마이크 |
| 11/6~11/12 | 사용성 테스트 | — |
| 11/20 | 최종 배포, 발표 | — |

---

## 8. 시작 절차 (새 세션의 AI가 할 일)

1. 이 문서, `CLAUDE.md`, `planning/prompts/design-v2-2026-10-09.md`, apply-hifi-design의 `tasks.md`·`design.md`를 읽는다.
2. 브랜치가 `design-v2`인지, `git status`, `git log --oneline -5`로 커밋 상태를 확인한다.
3. `npm test`, `npm run lint`를 실행한다. (`npm run build`는 개발 서버 규칙(§2-6)을 지킨다)
4. 결과를 사용자에게 3줄 이내로 보고한다 (통과 여부, 미커밋 변경, 다음 작업).
5. 사용자가 진행을 요청하면 `/opsx:apply apply-hifi-design`으로 그 그룹을 시작한다.
