# 04. Technical Design

> **이 문서의 책임:** 어떻게 구현하는가. 아키텍처, 모듈, 데이터, API, 외부 연동, 기술 결정.
> **다루지 않음:** 무엇을 만들지(→ 02), 화면 모습(→ 03), 일정·담당(→ 05)

| 항목 | 내용 |
|---|---|
| 문서 상태 | Draft |
| 기술 스택 | Next.js (App Router), React, TypeScript, Tailwind CSS |
| 관련 문서 | docs/ARCHITECTURE.md (폴더 구조 요약) |
| 최종 수정일 | TODO |

## 1. System Overview
TODO: 구성 요소와 데이터 흐름을 그린다.

```
TODO 예시:
[Browser]
  ├─ 마이크 녹음 ──▶ /api/stt ──▶ stt adapter ──▶ (STT API)
  ├─ 후보 계산 ──▶ src/lib/pronunciation (순수 함수)
  ├─ 설명 요청 ──▶ /api/explain ──▶ dictionary + llm adapter
  ├─ 음성 재생 ◀── /api/tts ──▶ tts adapter
  └─ 카드 저장 ──▶ localStorage
```

## 2. Module Design
| 모듈 | 위치 | 책임 | 의존성 |
|---|---|---|---|
| pronunciation | src/lib/pronunciation | TODO (예: 자모 분해, 발음 역규칙, 후보 거리 계산) | 없음 (순수 함수) |
| services | src/lib/services | TODO (예: stt / llm / dictionary / tts 어댑터, mock 포함) | 외부 API |
| storage | src/lib/storage | TODO | localStorage |
| components | src/components | TODO | - |

### 2.1 되묻기 알고리즘
TODO: 입력, 처리 단계, 출력, 임계값을 적는다.
- 입력: TODO
- 처리 단계: TODO
- 거리 계산 방식: TODO (예: 자모 단위 편집 거리, 가중치)
- 후보 개수와 임계값: TODO
- 발음 역규칙 데이터 위치: TODO (예: src/data/)

## 3. Data Model
```ts
// TODO: 필드를 확정한다. 실제 코드는 구현 단계에서 src/types/에 만든다.
type WordCard = {
  id: string;
  word: string;            // TODO
  definition: string;      // 사전 뜻풀이
  kidExplanation: string;  // TODO
  example: string;         // TODO
  context: string;         // 들은 상황 — TODO
  heardAs: string;         // 아이가 처음 말한 발음(인식 텍스트)
  createdAt: string;
  // TODO (P1): nextReviewAt
};
```

## 4. API Design
| Method | Path | 요청 | 응답 | 호출하는 외부 서비스 |
|---|---|---|---|---|
| POST | /api/stt | TODO | TODO | TODO |
| POST | /api/candidates | TODO | TODO | TODO (예: 사전 표제어 조회) |
| POST | /api/explain | TODO | TODO | TODO |
| POST | /api/tts | TODO | TODO | TODO |

- 오류 응답 형식: TODO

## 5. External Services
| 용도 | 후보 | 선택 | 선택 이유 | 비용·한도 | 환경변수 |
|---|---|---|---|---|---|
| STT | TODO | TODO | TODO | TODO | STT_API_KEY |
| LLM | TODO | TODO | TODO | TODO | LLM_API_KEY |
| 사전 | TODO (예: 국립국어원 사전 오픈 API) | TODO | TODO | TODO | DICTIONARY_API_KEY |
| TTS | TODO | TODO | TODO | TODO | TTS_API_KEY |

- 연동 순서: TODO (mock → 실제 API, 한 번에 하나씩)

## 6. LLM Guardrails
- 프롬프트 원칙: TODO (예: 사전 뜻풀이를 입력으로 주고 그 범위 안에서만 쉽게 바꾼다)
- 출력 검증: TODO (예: 사전 뜻에 없는 정보가 들어갔는지 확인하는 방법)
- 실패 시 대체 동작: TODO (예: 사전 뜻을 그대로 보여준다)

## 7. Security & Privacy
- API 키 관리: TODO
- 음성 데이터 처리: TODO (예: 인식 후 원본은 저장하지 않는다)
- 저장 데이터: TODO

## 8. Testing Strategy
| 대상 | 종류 | 도구 | 우선순위 |
|---|---|---|---|
| pronunciation | 단위 테스트 | TODO | 1순위 |
| services (mock) | 통합 테스트 | TODO | TODO |
| 핵심 시나리오 | E2E / 수동 | TODO | TODO |

- 되묻기 테스트 데이터: TODO (예: 아이 녹음 → 인식 텍스트 → 기대 단어 표)

## 9. Technical Decisions (ADR)
| # | 결정 | 대안 | 이유 | 날짜 |
|---|---|---|---|---|
| ADR-01 | TODO (예: MVP 저장소로 localStorage 사용) | TODO | TODO | TODO |
| ADR-02 | TODO | TODO | TODO | TODO |
