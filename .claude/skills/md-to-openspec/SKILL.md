---
name: md-to-openspec
description: 기획서 Markdown(과 planning-review 리포트)을 OpenSpec 구조로 변환한다. openspec/config.yaml의 프로젝트 맥락, openspec/changes/<change-id>/ 아래 proposal.md·design.md·tasks.md와 GIVEN/WHEN/THEN 시나리오를 가진 델타 스펙을 만든다. "기획서를 스펙으로", "openspec으로 변환", "md to openspec", "스펙 만들어줘" 요청이나 planning-review 다음 단계로 사용한다. 코드 구현은 하지 않는다.
---

# MD → OpenSpec

기획서의 의도를 OpenSpec 변경(change) 하나로 옮겨서, 이후 `/opsx:apply`로 구현할 수 있게 만든다.
이 스킬은 문서만 만든다. 코드는 작성하지 않는다.

## 0. 사전 확인

1. **입력 확인**
   - 기획서 Markdown 경로 또는 본문. 노션 링크만 있으면 Notion 도구로 읽고, 못 읽으면 추측하지 말고 Markdown으로 내보내 달라고 요청한다.
   - `planning/reviews/*-review.md`에 planning-review 리포트가 있으면 함께 읽는다.
   - 리포트에 해결되지 않은 [필수] 항목이 있으면 변환 전에 사용자에게 알린다. 사용자가 그대로 진행하라고 하면 해당 항목을 proposal.md의 "Open Questions"에 남기고 진행한다.

2. **OpenSpec 설치·버전 확인**
   - `openspec --version`을 실행한다.
   - CLI가 있으면 `openspec templates`로 현재 스키마의 템플릿 경로를 확인하고, **설치된 템플릿의 섹션 구성이 이 문서의 예시와 다르면 설치된 템플릿을 따른다.**
   - CLI가 없으면 이 문서의 형식으로 수동 작성한다.

3. **프로젝트 상태 확인**
   - `openspec/` 폴더가 없으면 `openspec init` 실행 여부를 사용자에게 먼저 묻는다(대화형 설정이고 도구별 명령 파일을 설치한다). 원하지 않으면 아래 구조를 수동으로 만든다.
   - `openspec/specs/`에 기존 스펙이 있으면 모두 읽는다. 기존 요구사항과 겹치면 ADDED가 아니라 MODIFIED로 쓴다.
   - `openspec/changes/`에 진행 중인 변경이 있으면 겹치는지 확인하고, 겹치면 사용자에게 알린다.

## 1. 결과 구조

```
openspec/
├── config.yaml                      # 없을 때만 생성, 있으면 병합
└── changes/
    └── <change-id>/
        ├── proposal.md              # 왜, 무엇을, 범위
        ├── design.md                # 어떻게 (기술 결정)
        ├── tasks.md                 # 구현 체크리스트
        └── specs/
            └── <capability>/
                └── spec.md          # 델타 스펙
```

- `openspec/specs/`(source of truth)에는 직접 쓰지 않는다. 변경이 archive될 때 델타가 병합된다.
- `<change-id>`: 동사로 시작하는 kebab-case. 예) `add-voice-word-question-mvp`, `update-alien-explanation-tone`
- `<capability>`: 기능 영역 단위 kebab-case 명사. 예) `voice-question`, `word-inference`, `word-explanation`

## 2. 기획서 → OpenSpec 매핑

| 기획서 내용 | 옮길 곳 |
|---|---|
| 서비스 개요, 타겟, 기술 스택, 공통 제약 | `config.yaml`의 `context` |
| 문제 정의, 배경, 기대 효과 | proposal.md → Why |
| 이번에 만들 기능 (MVP) | proposal.md → What Changes + 델타 스펙 |
| 베타·나중 기능 | proposal.md → Out of Scope (스펙으로 만들지 않음) |
| 사용자 행동과 시스템 반응 | 델타 스펙의 Requirement / Scenario |
| 예외·실패 처리 | 해당 Requirement의 추가 Scenario |
| 화면 구성, 기술 선택, API, 데이터 구조 | design.md |
| 구현 순서 | tasks.md |
| 미정 사항 | proposal.md → Open Questions |

**변경 분할 기준**: 기본은 MVP 핵심 플로우 전체를 change 하나로 만든다. 서로 독립적으로 출시할 수 있는 기능 묶음이 있을 때만 change를 나누고, 나누기 전에 사용자에게 확인한다.

## 3. config.yaml

없으면 생성하고, 있으면 기존 값을 보존한 채 빠진 항목만 추가한다.

```yaml
schema: spec-driven

context: |
  서비스: <한 문장 설명>
  타겟: <주 사용자>
  형태: <예: 모바일 웹, 세로 화면 기준>
  기술 스택: <기획서·프로젝트에 있는 것만. 없으면 이 줄 생략>
  제약: <예: 외부 API 최소화, 해커톤 MVP>

rules:
  specs:
    - 본문은 한국어, Requirement/Scenario/SHALL/MUST/GIVEN/WHEN/THEN 키워드는 영어로 유지
    - 모든 Requirement에 Scenario를 1개 이상 작성
    - 라이브러리·함수명 등 구현 세부는 쓰지 않고 design.md로 보낸다
  tasks:
    - 각 작업 그룹 안에 확인 방법을 적는다
```

## 4. proposal.md

```markdown
# Proposal: <변경 제목>

## Why
<해결하려는 문제와 대상 사용자. 2~4문장>

## What Changes
- <사용자 관점에서 새로 생기는 동작>
- …

## Capabilities
- `<capability>`: <한 줄 설명> (신규)

## Out of Scope
- <베타·나중으로 미룬 기능> — <미룬 이유>

## Impact
- <영향받는 화면·외부 의존·데이터>

## Open Questions
- <미정 사항> — 기본 가정: <구현 시 임시로 따를 값>
```

## 5. 델타 스펙 (specs/<capability>/spec.md)

OpenSpec 파서가 읽는 형식이다. 헤더 레벨과 키워드를 정확히 지킨다.

```markdown
# Delta for <Capability 이름>

## Purpose
<새 capability일 때만. 이 영역이 무엇을 위한 것인지 1~2문장>

## ADDED Requirements

### Requirement: <요구사항 이름>
The system SHALL <관찰 가능한 동작을 한국어로 서술>.

#### Scenario: <정상 상황 이름>
- GIVEN <전제>
- WHEN <사용자 행동 또는 사건>
- THEN <관찰 가능한 결과>
- AND <추가 결과>

#### Scenario: <실패·예외 상황 이름>
- GIVEN …
- WHEN …
- THEN …
```

- 섹션: `## ADDED Requirements`(신규), `## MODIFIED Requirements`(기존 변경, 전체 내용을 다시 쓰고 바뀐 점을 괄호로 표기), `## REMOVED Requirements`(삭제, 이유 표기).
- 헤더 레벨: Requirement는 `###`, Scenario는 반드시 `####`.
- 강도: 반드시 지켜야 하면 SHALL/MUST, 권장이면 SHOULD, 선택이면 MAY.
- 스펙은 **행동 계약**이다. 사용자가 보거나 다른 시스템이 의존하는 입력·출력·오류만 쓴다. 구현이 바뀌어도 겉동작이 같다면 스펙에 넣지 않는다.
- 시나리오는 테스트로 확인할 수 있게 쓴다. "자연스럽게", "빠르게" 대신 확인 가능한 결과를 쓰고, 기획서에 없는 수치를 넣었다면 proposal의 Open Questions에 기록한다.
- 기획서에 예외 처리가 없는 기능은 최소한 실패 시나리오 하나를 추가하고, 추가했다는 사실을 최종 보고에 적는다.

## 6. design.md

```markdown
# Design: <변경 제목>

## Technical Approach
<전체 구조 3~5문장>

## Decisions
### Decision: <결정>
- 선택: …
- 이유: …
- 대안: … (택하지 않은 이유)

## Screens & Flow
<화면 목록과 이동 흐름>

## External Dependencies
| 항목 | 용도 | 실패 시 폴백 |
|---|---|---|

## Risks
- <리스크> → <대응·시연용 대체안>
```

기획서와 프로젝트에 없는 기술 스택은 확정하지 않는다. 필요하면 후보를 Decisions에 쓰고 Open Questions에 올린다.

## 7. tasks.md

```markdown
# Tasks

## 1. <작업 그룹>
- [ ] 1.1 <한 세션 안에 끝낼 수 있는 작업>
- [ ] 1.2 …
- [ ] 1.3 확인: <테스트, 명령, 또는 화면에서 보이는 결과>

## 2. <작업 그룹>
- [ ] 2.1 …
```

- 핵심 플로우가 가장 먼저 끝까지 동작하도록 순서를 잡는다(가장 얇은 버전 → 살 붙이기).
- 확인 작업은 마지막에 몰지 말고 각 그룹 안에 둔다.
- 시연을 위한 폴백(목업 응답, 예시 데이터 등)이 필요하면 별도 작업으로 넣는다.

## 8. 검증

1. CLI가 있으면 `openspec validate <change-id>`를 실행하고(옵션은 `openspec validate --help`로 확인), 오류를 고쳐 통과시킨다. `openspec status --change <change-id>`로 아티팩트 상태도 확인한다.
2. CLI가 없으면 직접 점검한다.
   - [ ] 모든 Requirement에 `#### Scenario:`가 1개 이상
   - [ ] 델타 섹션 헤더가 ADDED/MODIFIED/REMOVED 형식
   - [ ] MVP 기능이 모두 스펙 또는 Out of Scope 중 한 곳에 있음
   - [ ] 기획서에 없는 기능을 스펙에 추가하지 않았음
   - [ ] 스펙 본문에 라이브러리·파일명이 없음

## 9. 최종 보고

대화에 아래만 짧게 보고한다. 파일 내용을 다시 붙여넣지 않는다.

- 생성·수정한 파일 목록
- 기획서 기능 → capability / Requirement 매핑 표
- 기획서에 없어서 추가한 시나리오, Open Questions
- 검증 결과
- 다음 단계: 내용 확인 후 `/opsx:apply <change-id>`로 구현 (사용 중인 도구에 따라 명령 표기가 다를 수 있음)

## 모야 프로젝트 참고 맥락

기획서에 다르게 적혀 있으면 기획서를 따른다.

- 서비스: 아이가 모르는 단어를 "○○이 뭐야?"라고 음성으로 물으면, 외계인 친구가 쓰인 맥락과 함께 설명해주는 어휘 학습 모바일 웹 (2026 4호선톤 출품)
- capability 예시: `voice-question`(음성 질문 입력), `word-inference`(발음·맥락 기반 단어 유추), `word-explanation`(외계인 설명), `content-safety`(아이에게 부적절한 단어 처리)
- Out of Scope 기본값: 반복 학습, 부모 리포트(베타)
- 필수 실패 시나리오: 음성 인식 실패, 마이크 권한 거부, 단어를 유추하지 못함, 네트워크 오류
