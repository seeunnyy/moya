# 03. UX / UI Spec

> **이 문서의 책임:** 사용자가 무엇을 보고 어떻게 움직이는가. 플로우, 화면, 상태, 문구, 시각 규칙.
> **다루지 않음:** 기능 규칙·수용 기준(→ 02), 컴포넌트 구현 방식·상태 관리(→ 04)

| 항목 | 내용 |
|---|---|
| 문서 상태 | Draft |
| 디자인 시안 링크 | TODO (Figma URL) |
| 기준 화면 | 모바일 세로 375px |
| 최종 수정일 | TODO |

## 1. UX Principles
TODO: 3~5개의 원칙을 적는다. 화면을 설계하다 판단이 갈릴 때 이 원칙을 기준으로 삼는다.
1. TODO (예: 한 화면에 한 가지 행동)
2. TODO (예: 글을 못 읽어도 쓸 수 있게 아이콘 + 짧은 글자 + 음성 안내를 함께 쓴다)
3. TODO

## 2. User Flow
TODO: 핵심 시나리오를 단계별로 적는다.

```
TODO 예시:
[묻기] → 마이크 누르기 → [듣는 중] → [생각 중]
   ├─ 후보 1개 → [확인 질문] → [설명]
   ├─ 후보 여러 개 → [후보 고르기] → [설명]
   └─ 후보 0개 → [나중에 물어볼게]
[설명] → 카드 저장 → [카드 모음]
```

## 3. Screen Inventory
| ID | 화면 | 경로 | 대상 | 목적 | 관련 FR |
|---|---|---|---|---|---|
| SCR-01 | TODO (예: 랜딩) | / | TODO (예: 부모·심사위원) | TODO | - |
| SCR-02 | TODO (예: 묻기) | /app | 아이 | TODO | FR-01 |
| SCR-03 | TODO (예: 후보 고르기) | TODO | 아이 | TODO | FR-02 |
| SCR-04 | TODO (예: 단어 설명) | TODO | 아이 | TODO | FR-03 |
| SCR-05 | TODO (예: 카드 모음) | /app/cards | 아이 | TODO | FR-03 |
| SCR-06 | TODO (예: 부모 리포트) | /parent | 부모 | TODO | TODO |

## 4. Screen Detail
각 화면마다 아래 블록을 복사해 작성한다.

### SCR-02. TODO 화면명
- **진입 경로:** TODO
- **주요 요소:** TODO (예: 모야 캐릭터, 마이크 버튼)
- **주요 행동 (1개):** TODO
- **상태별 화면:**

| 상태 | 모야의 표정·동작 | 화면 문구 | 음성 안내 |
|---|---|---|---|
| 대기 | TODO | TODO | TODO |
| 듣는 중 | TODO | TODO | TODO |
| 생각 중 | TODO | TODO | TODO |
| 말하는 중 | TODO | TODO | TODO |
| 오류 | TODO | TODO | TODO |

- **다음 화면:** TODO

## 5. Copy & Voice
- 모야의 말투: TODO (예: 반말, 짧은 문장, 친구처럼)
- 핵심 문구:

| 상황 | 문구 |
|---|---|
| 첫 인사 | TODO |
| 다시 말해달라고 할 때 | TODO |
| 후보를 고르게 할 때 | TODO |
| 모르는 단어일 때 | TODO |
| 칭찬 | TODO |

## 6. Visual System
> 시안 확정 전까지 TODO로 둔다. 확정되면 값을 채우고 docs/DESIGN.md와 맞춘다.

| 토큰 | 값 | 용도 |
|---|---|---|
| color.primary | TODO | TODO |
| color.background | TODO | TODO |
| font.family | TODO | TODO |
| font.size.body | TODO | TODO |
| touch.minSize | TODO (예: 48px 이상) | 버튼 최소 터치 영역 |
| radius | TODO | TODO |

## 7. Accessibility
- TODO (예: 터치 영역 최소 크기)
- TODO (예: 색만으로 상태를 구분하지 않는다)
- TODO (예: 모든 안내 문구를 음성으로도 들려준다)
