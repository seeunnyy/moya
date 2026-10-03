# 04. Technical Design

> **이 문서의 책임:** route, source structure, data model, state, storage.
> **다루지 않음:** 요구사항과 인수조건(→ 02), 화면·컴포넌트 역할(→ 03), 일정·오늘 범위(→ 05)

| 항목 | 내용 |
|---|---|
| 문서 상태 | Draft |
| 기술 스택 | Next.js 16 (App Router), React, TypeScript, Tailwind CSS |
| 최종 수정일 | 2026-10-03 |

## 1. Route
### 페이지
| 경로 | 화면 (03) | 비고 |
|---|---|---|
| / | S0 | |
| /app | S1~S6, E1, E2 | 한 페이지 안에서 상태로 전환 (§4) |
| /app/cards | S7 | |
| /parent | S8 | 베타, 자리만 |

### API (서버 전용, 키 보호)
| Method | Path | 역할 | 단계 |
|---|---|---|---|
| POST | /api/stt | 음성 → 인식 텍스트. MVP 초기에는 mock 응답 | 해커톤 |
| POST | /api/rerank | 맥락으로 후보 재순위 | 베타 |
| POST | /api/explain | 사전 조회 + 실시간 쉬운 설명 생성 | 베타 |

- 해커톤에서 쓰는 외부 API는 음성인식 하나다. STT 서비스 선정은 TBD.
- 음성 출력(FR-08)은 브라우저 내장 `speechSynthesis`를 쓰므로 API 라우트가 없다. iOS Safari 동작은 확인이 필요하다 (TBD).

## 2. Source Structure
| 위치 | 내용 |
|---|---|
| src/app/ | 라우트 (페이지 + api) |
| src/components/ | 03 §2의 컴포넌트 |
| src/lib/pronunciation/ | 되묻기 핵심 로직. 외부 API·라이브러리 없이 순수 함수로 만든다. |
| src/lib/services/ | 외부 서비스 어댑터. 해커톤은 `stt`만 둔다. 같은 인터페이스로 mock과 실제 구현을 두고 환경변수로 전환한다. 음성 출력은 `speech`(speechSynthesis 래퍼)로 둔다. |
| src/lib/storage/ | 단어 카드와 물어볼 단어 저장 (§5) |
| src/lib/config.ts | 되묻기 설정값 (거리 임계값, 최대 후보 수) |
| src/data/ | 발음 역규칙 표, 검수된 단어 데이터(`WordEntry[]`), mock 단어 데이터 |
| src/types/ | 공통 타입 (§3) |

### src/lib/pronunciation/
| 파일 | 역할 |
|---|---|
| jamo.ts | 한글 음절의 자모 분해·조합 |
| rules.ts | 발음 역규칙 적용. 입력 단어 하나로 '원래 이 단어였을 수 있는' 변형 목록을 만든다. |
| distance.ts | 자모 단위 편집거리 |
| candidates.ts | 입력과 역규칙 변형들 중 가장 가까운 거리로 단어 데이터를 정렬해 후보를 만들고, 1개 / 여러 개 / 0개로 분기한다 (`CandidateResult`). |
| extract.ts | 인식 텍스트에서 대상 단어 추출 ("○○이 뭐야", "○○가 뭐야", "○○ 뭐야" 등) |

### 단어 데이터
- 거리 비교 대상은 `src/data`의 **검수된 단어 데이터**다. 사전 API는 철자가 맞아야 검색되므로 후보 검색에 쓰지 않는다.
- 쉬운 설명, 예문, 힌트는 실행 중에 만들지 않는다. LLM 초안을 사전 뜻과 대조해 검수한 뒤 단어 데이터에 미리 넣는다. 이 검수 과정은 오프라인 작업이며 앱 코드에 포함하지 않는다.
- 동음이의어는 뜻별로 별도 항목(`senseId`)으로 나누고, 힌트로 구분한다.
- 목표: 50~100개 (10/29까지). 단어 선정 기준과 출처는 TBD.

## 3. Data Model
```ts
// 검수된 단어 데이터 (src/data)
type WordEntry = {
  id: string;               // 예: "jeogeumtong-1"
  word: string;             // 표제어
  senseId: number;          // 동음이의어 구분
  hint: string;             // 확인 질문·후보 카드에 붙는 짧은 힌트
  kidExplanation: string;   // 아이 눈높이 설명 (한두 문장)
  example: string;          // 일상 예문 1개
  dictDefinition: string;   // 사전 뜻풀이 (검수 기준)
  source: string;           // 사전 출처
  reviewed: boolean;        // 검수 완료 여부
};

// 저장되는 단어 카드
type WordCard = {
  id: string;
  wordEntryId: string;
  word: string;
  dictDefinition: string;
  kidExplanation: string;
  example: string;
  heardContext?: string;    // 들은 상황 (맥락 질문의 답)
  spokenAs: string;         // 아이가 처음 말한 발음 (인식 텍스트)
  createdAt: string;        // ISO 8601
  nextReviewAt?: string;    // 베타
  reviewStep?: number;      // 베타 (1·3·7일)
};

// 물어볼 단어
type PendingWord = {
  id: string;
  spokenAs: string;
  heardContext?: string;
  createdAt: string;
};

type Candidate = {
  entry: WordEntry;
  distance: number;
  score?: number;           // 베타 (맥락 재순위)
};

type CandidateResult =
  | { kind: "confirm"; candidate: Candidate }        // 후보 1개
  | { kind: "choose"; candidates: Candidate[] }      // 후보 2~3개
  | { kind: "unknown" };                             // 후보 0개

type PronunciationRule = {
  from: string;
  to: string;
  position: "초성" | "중성" | "종성";
  note: string;
};
```

## 4. State
`/app`은 `useReducer` 상태 기계 하나로 관리한다. 상태 관리 라이브러리는 추가하지 않는다.

```
idle → listening → thinking ─┬→ confirm ──────────┬→ explaining → saved → idle
                             ├→ context → choose ─┘
                             └→ unknown → idle
오류: micDenied, sttFailed
```

- confirm이나 choose에서 [아니야] / [다 아니야]를 고르면 `retryCount`가 0일 때 idle로 돌아가 다시 말하게 한다. `retryCount`가 1이면 unknown으로 간다.

| 상태 | 화면 (03) | MoyaCharacter |
|---|---|---|
| idle | S1 | idle |
| listening | S2 | listening |
| thinking | S2 | thinking |
| confirm | S3 | speaking |
| context | S4 (맥락 질문) | speaking |
| choose | S4 (후보 고르기) | confused |
| unknown | S6 | confused |
| explaining | S5 | speaking |
| saved | S5 (저장 완료 표시) | happy |
| micDenied | E1 | confused |
| sttFailed | E2 | confused |

## 5. Storage
- MVP는 `localStorage`를 쓴다. 키에 버전을 넣는다: `moya.cards.v1`, `moya.pending.v1`
- 음성 원본은 저장하지 않는다. 인식 텍스트(`spokenAs`)만 저장한다.
- 읽기와 쓰기는 try/catch로 감싸서, 실패해도 화면이 깨지지 않게 한다. 실패하면 빈 목록으로 처리한다.
- 서버 DB와 인증은 BE가 합류한 뒤 결정한다. (TBD)

### 설정값 (src/lib/config.ts 한 곳에 모은다)
| 이름 | 값 | 비고 |
|---|---|---|
| MAX_DISTANCE | 2 | 잠정. 10/16~22 녹음 테스트 후 보정 |
| MAX_CANDIDATES | 3 | |
| MAX_RETRY | 1 | 다시 말하기 횟수 |
