# 02. Requirements Spec

> **이 문서의 책임:** 시스템이 무엇을 해야 하는가. 기능·비기능 요구사항과 수용 기준.
> **다루지 않음:** 왜 필요한가(→ 01), 어떻게 보이는가(→ 03), 어떻게 구현하는가(→ 04), 언제 하는가(→ 05)

| 항목 | 내용 |
|---|---|
| 문서 상태 | Draft |
| 기준 Brief | 01_PRODUCT_BRIEF.md |
| 최종 수정일 | TODO |

## 1. Priority
- **P0 (MVP):** 해커톤 데모에 반드시 필요
- **P1:** 시간이 남으면
- **P2:** 이후 로드맵

## 2. User Stories
형식: `[US-번호] <사용자>로서, <목적>을 위해 <행동>하고 싶다.`

| ID | User Story | 우선순위 | 관련 FR |
|---|---|---|---|
| US-01 | TODO (예: 아이로서, 들은 단어의 뜻을 알기 위해 모야에게 말로 묻고 싶다) | P0 | FR-01 |
| US-02 | TODO (예: 아이로서, 내 발음이 틀려도 원하는 단어를 찾기 위해 후보 중에서 고르고 싶다) | P0 | FR-02 |
| US-03 | TODO (예: 아이로서, 배운 단어를 다시 보기 위해 카드로 모아두고 싶다) | P0 | FR-03 |
| US-04 | TODO | P1 | TODO |
| US-05 | TODO | P1 | TODO |

## 3. Functional Requirements
각 FR마다 아래 블록을 복사해 작성한다.

### FR-01. TODO 기능명 (예: 음성으로 묻기)
- **우선순위:** P0
- **설명:** TODO
- **입력:** TODO (예: 아이 음성)
- **출력:** TODO (예: 인식 텍스트, 추출된 대상 단어)
- **규칙:**
  - TODO (예: "○○이 뭐야?" 형태에서 ○○을 대상 단어로 추출)
- **예외:**
  - TODO (예: 음성이 인식되지 않으면 다시 말해달라고 안내)
- **수용 기준 (Given / When / Then):**
  - Given TODO, When TODO, Then TODO

### FR-02. TODO 기능명 (예: 되묻기로 단어 찾기)
- **우선순위:** P0
- **설명:** TODO
- **규칙:**
  - TODO (예: 후보 1개면 확인 질문, 여러 개면 2~3개 제시, 0개면 '물어볼 단어'로 저장)
- **예외:** TODO
- **수용 기준:**
  - Given TODO, When TODO, Then TODO

### FR-03. TODO 기능명 (예: 단어 카드 저장)
- **우선순위:** P0
- **설명:** TODO
- **저장 항목:** TODO (데이터 구조 자체는 04에서 정의)
- **규칙:**
  - TODO (예: 설명은 사전 뜻풀이 범위를 벗어나지 않는다)
- **수용 기준:**
  - Given TODO, When TODO, Then TODO

## 4. Non-Functional Requirements
| ID | 분류 | 요구사항 | 기준 |
|---|---|---|---|
| NFR-01 | 성능 | TODO (예: 묻기 → 설명까지 응답 시간) | TODO (예: 5초 이내) |
| NFR-02 | 개인정보 | TODO (예: 아이 음성 원본을 저장하지 않는다) | TODO |
| NFR-03 | 보안 | TODO (예: API 키를 클라이언트에 노출하지 않는다) | TODO |
| NFR-04 | 콘텐츠 안전 | TODO (예: 아동에게 부적절한 설명을 차단한다) | TODO |
| NFR-05 | 호환성 | TODO (예: 지원할 모바일 브라우저) | TODO |
| NFR-06 | 접근성 | TODO | TODO |

## 5. Out of Scope
| 항목 | 제외 이유 | 재검토 시점 |
|---|---|---|
| TODO (예: 결제·구독) | TODO | TODO |
| TODO (예: 회원가입) | TODO | TODO |
| TODO (예: 아이 음성 원본 저장) | TODO | TODO |

## 6. Traceability
| FR | 해결하는 문제 (01) | 화면 (03) | 모듈 (04) | 작업 (05) |
|---|---|---|---|---|
| FR-01 | TODO (P1~P3) | TODO (SCR-xx) | TODO | TODO (T-xx) |
| FR-02 | TODO | TODO | TODO | TODO |
| FR-03 | TODO | TODO | TODO | TODO |
