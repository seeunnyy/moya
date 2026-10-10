# 04. Technical Design

> **이 문서의 책임:** route, source structure, data model, state, storage.
> **다루지 않음:** 요구사항과 인수조건(→ 02), 화면·컴포넌트 역할(→ 03), 일정·오늘 범위(→ 05)

| 항목 | 내용 |
|---|---|
| 문서 상태 | Draft |
| 기술 스택 | Next.js 16 (App Router), React, TypeScript, Tailwind CSS |
| 최종 수정일 | 2026-10-11 (완성 피그마 적용 그룹 3: 라우트·상태 기계·저장) |

## 1. Route
화면 번호는 완성 피그마(openspec `apply-hifi-design` design.md "화면 목록"). 그룹 3에서는 뼈대(화면 번호·이름)만 있고 화면 속은 그룹 4~11에서 만든다.

### 페이지
| 경로 | 화면 | 들어가기 조건·비고 |
|---|---|---|
| / | 1-1 시작 | 로그인된 계정이 있으면 /app으로 |
| /login | 1-0 로그인 | 저장된 계정이 있을 때만 2-1로 (그룹 9) |
| /signup | 1-2 보호자 가입 | 카카오·이메일 모두 기기 저장 mock |
| /terms | 1-2a 약관 보기 | "확인했어요"·"<"는 브라우저 뒤로 |
| /signup/profile | 1-3 아이 프로필 | |
| /signup/consent | 1-4 음성 수집 동의 | `?from=settings`면 철회 후 재동의 |
| /signup/pin | 1-5 / 1-5a | 만들기 → 확인은 컴포넌트 상태 |
| /signup/mic | 1-6 마이크 권한 안내 | 1-7은 브라우저 권한 창 |
| /signup/done | 1-8 아이 모드 시작 | |
| /app | 2-1 홈 + 2-0, 2-2~2-14, E-1, E-2 | 계정 필요. 묻기 흐름은 이 주소의 askFlow 상태(§4). 새로고침하면 2-1 |
| /app/dictionary | 3-1 지구 사전 | 계정 필요 |
| /app/dictionary/[cardId] | 3-2 ~ 3-2e 카드 상세 | 없는 id면 3-1로 (T15) |
| /app/today | 3-3 / 3-3a 오늘의 단어 | |
| /app/me | 3-4 내 정보 | |
| /app/me/stars | 3-5 내 별과 로켓 | |
| /parent | 5-1 / 5-1a 보호자 비밀번호 | 계정 필요. "×"는 /app/me |
| /parent/reset | 5-1b 재설정 | 메일 발송 없이 /parent로 |
| /parent/home | 5-2 보호자 홈 | 잠금 해제 필요, 아니면 /parent |
| /parent/words | 5-3 / 5-3a | 잠금 해제 필요 |
| /parent/settings | 5-4 / 5-4a, 5-7·5-8·5-9 확인 창 | 잠금 해제 필요 |
| /parent/settings/profile | 5-5 | 잠금 해제 필요 |
| /parent/settings/pin | 5-6 | 잠금 해제 필요 |
| /dev/components, /dev/seed | 개발용 부품 모음·시드 | 운영 빌드 404, 링크 없음 |

- 들어가기 조건은 `src/components/gates.tsx`에 둔다. 계정은 `src/app/app/layout.tsx`·`src/app/parent/layout.tsx`의 `RequireAccount`, 보호자 잠금은 `src/app/parent/(locked)/layout.tsx`의 `RequireParentUnlock`(`(locked)`는 주소에 나오지 않는 묶음 폴더). localStorage는 브라우저에서만 읽으므로 읽기 전에는 아무것도 그리지 않는다.
- 보호자 잠금 해제는 `/parent` 레이아웃의 React 상태(메모리)에만 둔다. 새로고침하거나 보호자 주소를 벗어나면(예: [아이 모드로 돌아가기]) 레이아웃이 사라져 다시 잠긴다.
- 옛 주소 `/app/ask`, `/app/mic`, `/app/cards`, `/app/cards/[id]`는 그룹 12에서 지운다(지금은 계정이 있어야 열림). `/app`의 옛 홈과 `/parent`의 옛 저장·전송 고지 화면은 새 뼈대로 바뀌었다.

### API (서버 전용, 키 보호)
| Method | Path | 역할 | 단계 |
|---|---|---|---|
| POST | /api/stt | 음성 → 인식 후보. 지금은 mock | 해커톤 |
| GET | /api/stt | 지금 쓰는 STT 이름(`{ provider }`)만. mock일 때만 자동 넘김 시간을 흉내 내려고 화면이 묻는다 | 해커톤 |
| POST | /api/rerank | LLM으로 후보 재순위 | 베타 |
| POST | /api/explain | 사전 조회 + 실시간 쉬운 설명 생성 | 베타 |

- 해커톤에서 쓰는 외부 API는 음성인식 하나다.
- `/api/stt` 응답은 인식 후보 배열(`transcripts: string[]`, 확률 높은 순)로 둔다. 후보를 하나만 주는 STT여도 길이 1인 배열로 맞춘다.
- 화면 쪽 어댑터 `src/lib/services/recognize.ts`가 /api/stt를 부른다. 네트워크 오류(fetch 실패)는 한 번 다시 시도하고 그래도 실패하면 `network`(→ E-1), 서버 실패 응답·빈 결과는 다시 시도 없이 `empty`(→ 2-7). mock STT일 때만 듣는 중 2.5초 뒤 자동 종료(`listenLimitMs`), 생각 중 최소 1.5초.

### STT 선정
- **전제 검증:** 되묻기는 STT가 아이 발음을 그대로 적어 준다고 가정한다. 범용 STT는 실제 단어로 교정해 돌려줄 수 있으므로 (추정), 녹음 테스트에서 이를 먼저 확인한다.
- **비교 대상:** 브라우저 내장 음성인식 1종 + 클라우드 STT 2종 (서비스명 TBD, 10/15까지 선정, 잠정)
- **비교 방법:** 10/16~22 녹음 테스트의 같은 녹음을 세 STT에 넣고, 후보별로 아래 비율을 잰다.
  - 발음 그대로 적힘 (예: "두박")
  - 다른 실제 단어로 교정됨 (예: "두부")
  - 인식 실패
- **선정 기준:** ① 인식 후보를 여러 개 주는지(n-best) ② 한국어 아동 발화에서 "발음 그대로 + 정답 단어" 비율 ③ 음성 데이터를 보관하지 않거나 보관 기간이 명시돼 있는지 (NFR-04) ④ 비용과 무료 한도
- **교정 성향이 강할 때의 대안:** n-best 후보 전부를 되묻기 입력으로 쓴다 (FR-01, FR-03). 그래도 맞는 단어가 후보에 오르지 않으면, 역규칙 표를 '교정된 단어 → 원래 단어' 쌍까지 넓히는 방안을 녹음 테스트 뒤 검토한다.
- 음성 출력(FR-08)은 브라우저 내장 `speechSynthesis`를 쓰므로 API 라우트가 없다. iOS Safari 동작은 확인이 필요하다 (TBD).

## 2. Source Structure
| 위치 | 내용 |
|---|---|
| src/app/ | 라우트 (페이지 + api) |
| src/components/ui/ | 완성 피그마 공통 부품 (03 §2) |
| src/components/ | 화면 조립, 들어가기 조건(`gates.tsx`), 저장소 읽기 훅(`useStored.ts`), 라우트 뼈대(`ScreenSkeleton.tsx`, 화면이 생기면 지움). 옛 화면 부품은 그룹 12에서 지움 |
| src/lib/askFlow.ts | 아이 묻기 흐름 상태 기계 (§4). `askFlow.legacy.ts`는 옛 `/app/ask` 전용, 그룹 12에서 지움 |
| src/lib/progress.ts | 별·미션·로켓 도장·연속 학습·오늘의 단어 계산 (순수 함수, §5) |
| src/lib/pronunciation/ | 되묻기 핵심 로직. 저장소·외부 API·라이브러리 없이 순수 함수로 만든다. |
| src/lib/services/ | 서비스 어댑터. `stt`(서버, 외부 STT), `recognize`(화면 → /api/stt, 재시도·mock 타이밍), `speech`(speechSynthesis 래퍼) |
| src/lib/storage/ | 기기 저장 (§5) |
| src/lib/devSeed.ts | 개발·시연용 시드 (`/dev/seed`에서만) |
| src/lib/config.ts | 되묻기·타이밍 설정값 |
| src/data/ | 발음 역규칙 표, 검수된 단어 데이터(`WordEntry[]`), mock 단어, 예시 문장·mock STT 순서, 부적절 단어 목록 |
| src/types/ | 공통 타입 (§3) |

### src/lib/pronunciation/
| 파일 | 역할 |
|---|---|
| jamo.ts | 한글 음절의 자모 분해·조합 |
| rules.ts | 발음 역규칙 적용. 입력 단어 하나로 '원래 이 단어였을 수 있는' 변형 목록을 만든다. |
| distance.ts | 자모 단위 편집거리 |
| candidates.ts | 대상 단어(1개 이상)와 역규칙 변형들 중 가장 가까운 거리로 단어 데이터를 정렬해 후보를 최대 3개 만든다. 후보마다 가장 가깝게 맞은 대상 단어(`spokenAs`, 카드의 '내가 말한 소리')를 남긴다. 보호자가 알려 준 연결(`TaughtLinks`, 인자로 받음)에 있는 말이면 그 단어를 거리 0의 맨 앞 후보(`taught`)로 둔다. `orderByContext`는 2-5에서 고른 들은 곳으로 같은 거리 후보를 다시 정렬한다(알려 준 단어는 맨 앞 유지). |
| extract.ts | 인식 텍스트에서 대상 단어 추출 ("○○이 뭐야", "○○가 뭐야", "○○ 뭐야" 등) |

### 단어 데이터
- 거리 비교 대상은 `src/data`의 **검수된 단어 데이터**다. 사전 API는 철자가 맞아야 검색되므로 후보 검색에 쓰지 않는다.
- 쉬운 설명, 예문, 힌트는 실행 중에 만들지 않는다. LLM 초안을 사전 뜻과 대조해 검수한 뒤 단어 데이터에 미리 넣는다. 이 검수 과정은 오프라인 작업이며 앱 코드에 포함하지 않는다.
- 동음이의어는 뜻별로 별도 항목(`senseId`)으로 나누고, 힌트로 구분한다.
- 단어마다 들은 곳 태그(`contextTags`: home·school·tv·book·outside)를 1개 이상 붙인다. 아이가 그 단어를 주로 어디서 들을지를 기준으로 작성자가 정한다.
- **담당:** BE가 합류하기 전까지 PM이 만든다. BE가 합류하면 함께 검수한다.
- **순서:**
  1. 녹음 테스트 단어 10개를 `WordEntry` 형식으로 먼저 만든다 (10/15까지, 잠정). 이 10개가 mock 데이터를 대체한다.
  2. 나머지를 채워 50~100개를 10/29까지 완성한다.
- **검수 체크리스트:** 05 §6
- 단어 선정 기준과 출처 사전은 TBD다.

## 3. Data Model
```ts
// 들은 곳 (2-5 버튼: 집 · 유치원·학교 · TV·영상 · 책 · 밖에서). 옛 값 "adult"는 읽을 때 버린다
type HeardContext = "home" | "school" | "tv" | "book" | "outside";

// 검수된 단어 데이터 (src/data)
type WordEntry = {
  id: string;                   // 예: "jeogeumtong-1"
  word: string;                 // 표제어
  senseId: number;              // 동음이의어 구분
  image: string;                // 단어 그림 (public 경로)
  hint: string;                 // 2-4·2-6 카드 힌트
  contextTags: HeardContext[];  // 아이가 이 단어를 주로 듣는 곳
  bubbleExplanation?: string;   // 2-9 말풍선 설명 (없으면 kidExplanation)
  kidExplanation: string;       // 카드(2-10, 3-2, 3-3) 설명
  example: string;              // 카드 예문
  english?: string;             // 데이터에만 (화면에 안 씀)
  dictDefinition: string;       // 사전 뜻풀이 (검수 기준)
  source: string;
  reviewed: boolean;
};

type CardStatus = "new" | "reviewing" | "mastered"; // 3-2 아래 버튼. 반복 학습이 베타라 새 카드는 모두 new

// 저장되는 단어 카드 (moya.cards.v1)
type WordCard = {
  id: string;
  wordEntryId: string;
  word: string;
  dictDefinition: string;
  kidExplanation: string;
  example: string;
  heardContext?: HeardContext;  // 2-5에서 고른 들은 곳
  spokenAs: string;             // '내가 말한 소리' (이 단어와 맞은 인식 대상 단어, 오늘의 단어 카드는 "")
  createdAt: string;            // ISO 8601
  status?: CardStatus;          // 없으면 new (옛 카드 호환)
  nextReviewAt?: string;        // 베타
  reviewStep?: number;          // 베타
};

// 물어볼 단어 (moya.pending.v1)
type PendingWord = { id: string; spokenAs: string; heardContext?: HeardContext; createdAt: string; taughtWordId?: string };

type Candidate = {
  entry: WordEntry;
  distance: number;
  spokenAs?: string;      // 이 후보와 맞은 대상 단어
  taught?: boolean;       // 보호자가 알려 준 단어
  contextMatch?: boolean; // 들은 곳 태그 일치
  score?: number;         // 베타 (LLM 재순위)
};

// 저장소 값 (src/lib/storage)
type Account = { method: "email" | "kakao"; email?: string; loggedIn: boolean; createdAt: string }; // 비밀번호 저장 안 함
type Profile = { nickname: string; age: 5 | 6 | 7 | 8; createdAt: string };
type Consent = { required: boolean; optional: boolean; updatedAt: string };
type Settings = { weeklyReport: boolean };
type StarRecord = { reason: "card" | "today" | "mission"; amount: number; at: string; word?: string };
type Mission = { date: string; collectedCount: number; completed: boolean; stampDates: string[] }; // 로컬 YYYY-MM-DD
type TodayWord = { date: string; wordEntryId: string; opened: boolean; added: boolean };
type TaughtLinks = Record<string, string>; // 아이가 한 말 → WordEntry.id

type PronunciationRule = { from: string; to: string; position: "초성" | "중성" | "종성"; note: string };
```
- `CandidateResult`(confirm/choose/unknown)와 `inferWord`는 옛 화면용으로 남아 있고, 새 흐름의 화면 분기에는 쓰지 않는다.

## 4. State
`/app`은 `useReducer` 상태 기계 하나(`src/lib/askFlow.ts`, `createAskReducer(entries, { blockedWords, taught })`)로 관리한다. 상태 관리 라이브러리는 추가하지 않는다. 저장·별 계산은 reducer 밖(progress.ts)에서 하고 결과를 `cardCollected`로 알린다. 보호자가 알려 준 연결(`taught`)이 바뀌면 reducer를 다시 만든다.

```
idle(2-1) → listening(2-2/2-11) → thinking(2-3/2-12) ─┬→ confirm(2-4) ─[맞아!]→ explaining(2-9) ─[알았어!]→ collected(2-10 / 2-13 → 2-14)
                                                      │      └[아니야]→ context(2-5) ─들은 곳·잘 모르겠어→ choose(2-6) ─카드→ explaining
                                                      │                                                    └[다 아니야]→ unknown(2-8)
                                                      ├→ unknown(2-8)        후보 0개
                                                      ├→ retry(2-7)          빈 결과·대상 단어 없음 ([글자 카드로 고를래] → fallback)
                                                      ├→ blocked             부적절 단어
                                                      └→ networkError(E-1)   한 번 다시 시도한 뒤에도 네트워크 오류
micOff(E-2): 마이크를 쓸 수 없음. idle·retry·micOff에서는 폴백 글자 입력(recognized)을 받는다.
```

| 상태 | 화면 | 주요 액션 |
|---|---|---|
| idle | 2-1 | startListening, recognized(폴백), micUnavailable |
| listening | 2-2 / 2-11 | stopListening (마이크 다시 누름·최대 녹음 시간·mock 2.5초) |
| thinking | 2-3 / 2-12 | recognized(transcripts), recognitionFailed(network / empty) |
| confirm { spokenAs, candidates } | 2-4 (candidates[0]) | answerYes, answerNo |
| context { candidates } | 2-5 | pickContext(들은 곳 또는 null) |
| choose { candidates, heardContext? } | 2-6 (최대 3, 2-4에서 아니라고 한 단어 포함) | pickCandidate, noneOfThese |
| retry { fallback } | 2-7 | startListening, chooseByLetters, recognized(폴백) |
| unknown { spokenAs } | 2-8 (열릴 때 물어볼 단어 저장) | goHome, startListening |
| explaining { entry, spokenAs, heardContext? } | 2-9 | cardCollected |
| collected { entry, spokenAs, cardId, isNew, missionCompleted, missionSuccessOpen } | 2-10 / 2-13, 2-14 | openMissionSuccess(1.5초 뒤), startListening, goHome |
| blocked | 부적절 단어 안내 | startListening, goHome |
| networkError | E-1 | startListening, goHome |
| micOff | E-2 | startListening(권한 허용 뒤), recognized(폴백) |

- 마이크를 다시 누르는 `startListening`은 듣는 중·생각 중이 아니면 어느 상태에서나 받는다. 그 상태에 맞지 않는 액션은 무시한다.
- `spokenAs`(카드의 '내가 말한 소리')는 고른 후보와 맞은 인식 대상 단어다(저울이면 "저욷"). [다 아니야] → 2-8은 첫 대상 단어.
- 이미 있는 단어로 `cardCollected(isNew: false)`가 오면 미션 성공으로 보지 않는다(T10).
- 2-7은 인식에 실패해서 오므로 고를 후보가 없다. [글자 카드로 고를래]는 글자 입력·예시 버튼 폴백(`fallback: true`, 잠정 T3).
- 아이 묻기 화면에는 "<"가 없다. 탭·[처음으로] 등은 `goHome`. 없앤 것: `review`, `open*`, `showRetryGuide`, `back`, `retryCount`(MAX_RETRY는 옛 흐름 전용).

## 5. Storage
- 모두 `localStorage`, 키마다 버전(`moya.<이름>.v1`). 읽기 실패·손상된 값 → 기본값(목록은 깨진 항목만 버림), 쓰기 실패 → `false`, 예외 없음. 같은 탭에서 저장하면 `moya-storage` 이벤트로 화면(`useStored`)이 다시 읽는다.
- 음성 원본은 저장하지 않는다. 인식 텍스트(`spokenAs`)만 저장하고, 카드·물어볼 단어는 정해진 필드만 골라 저장한다.

| 키 | 내용 | 기본값 |
|---|---|---|
| `moya.cards.v1` | WordCard[] (옛 카드 그대로 읽음, `status` 없으면 new, 옛 들은 곳은 버림) | [] |
| `moya.pending.v1` | PendingWord[] (`taughtWordId` 추가) | [] |
| `moya.account.v1` | Account (가짜 가입, 비밀번호 없음) | null |
| `moya.profile.v1` | Profile | null |
| `moya.consent.v1` | Consent | null |
| `moya.pin.v1` | 보호자 4자리 (기기 잠금, 보안 수단 아님, 평문) | null |
| `moya.settings.v1` | Settings | { weeklyReport: true } |
| `moya.stars.v1` | StarRecord[] (합계는 계산) | [] |
| `moya.mission.v1` | Mission (로컬 날짜가 다르면 오늘 0으로 봄, 도장 목록은 유지) | 빈 미션 |
| `moya.today.v1` | TodayWord (그날 값으로 고정) | null |
| `moya.taught.v1` | TaughtLinks | {} |

### 별·미션·로켓 계산 (src/lib/progress.ts, 순수 함수)
- 날짜는 기기의 로컬 날짜(YYYY-MM-DD). 자정이 지나면 다른 날이다.
- 새 카드 별 +1, 미션 +1. 미션은 "오늘 물어서 새로 모은 카드 수"(오늘의 단어 카드·이미 있던 단어 제외). 3이 되는 순간 하루 한 번 별 +3과 오늘 로켓 도장.
- 오늘의 단어 넣기는 별 +1, 미션에는 세지 않는다.
- 연속 학습 = 오늘(또는 어제)까지 끊기지 않은 도장 일수. 이번 주 도장은 월~일. "모야랑 ○일째"는 프로필 만든 날이 1일째.
- 헤더 미션 별 칸 = min(오늘 모은 카드 수, 3).
- 오늘의 단어: 오늘 이미 정했으면 그대로(넣은 뒤에도), 아니면 지구 사전에 없는 단어 중 날짜 문자열 해시로 하나. 없으면 null(선물 버튼 숨김). 단어 데이터가 아직 모두 `reviewed: false`(검수 전)라 지금은 reviewed로 거르지 않는다.

### 개발·시연용 시드 (`/dev/seed`, src/lib/devSeed.ts)
- 버튼: 처음 상태로 되돌리기 / 가입 끝난 상태로 홈 보기 / 미션 직전(오늘 2장) / 카드 3장 모은 상태 / 피그마 화면 상태(지구 사전 6장·별 24·연속 3일). 누르면 moya 키를 모두 지운 뒤 넣고 그 화면으로 새로 연다.
- 시드 계정: parent@moya.test, 보호자 비밀번호 1234, 아이 "지우"(만 7세). 운영 빌드에서는 404.
- 서버 DB와 인증은 BE가 합류한 뒤 결정한다. (TBD)

### 설정값 (src/lib/config.ts 한 곳에 모은다)
| 이름 | 값 | 비고 |
|---|---|---|
| MAX_DISTANCE | 2 | 잠정. 10/16~22 녹음 테스트 후 보정 |
| MAX_CANDIDATES | 3 | |
| MAX_RECORDING_MS | 8000 | 최대 녹음 시간 (잠정) |
| MOCK_LISTEN_MS / MOCK_THINK_MS | 2500 / 1500 | mock STT일 때만 |
| MISSION_SUCCESS_DELAY_MS | 1500 | 2-13 → 2-14 (실제로도) |
| MAX_RETRY | 1 | 옛 흐름 전용 (그룹 12에서 지움) |
