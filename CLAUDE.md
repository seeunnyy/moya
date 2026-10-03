# CLAUDE.md

## Project
2026 4호선톤 출품 MVP — 모야(Moya). 만 5~8세 아이를 위한 음성 어휘 학습 모바일 웹.
- 기획서 원본: 노션 '모야 기획서' (💻 4호선톤 / 백석대학교 2026 1학기). 기획 판단이 필요하면 먼저 확인한다.
- 역할: PM(기획·디자인) + 바이브코딩 구현. 팀: FE·BE 모집 중 (TBD)
- 일정: 11/5 1차 배포, 11/20 최종 배포 (상세는 planning/md-design/05_DELIVERY_PLAN.md)

## Product Idea
This app helps 글을 막 배우는 만 5~8세 아이 solve "철자를 몰라 모르는 단어를 찾을 수 없고, 기존 음성 AI는 아이 발음을 잘 못 알아듣는 문제" by 외계인 친구 '모야'에게 음성으로 묻고, 발음이 서툴면 되묻기로 단어를 찾아 아이 눈높이 설명을 듣는 것.
- 세계관: 모야는 '지구 번역기'로 아이와 함께 지구 말을 배워가는 외계인 친구.
- 핵심 차별점: 아이 발음이 부정확해도 되묻기와 상황 맥락으로 의도한 단어를 찾아 후보로 제시한다.

## Tech Stack
- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- Claude Code
- GitHub

## Current Stage
Session 3: OpenSpec `add-word-question-mvp` 구현 중 — 21/32 완료(그룹 1~7, 외부 API 없이 핵심 흐름 관통 끝). 다음: 작업 8.1 예시 버튼 (상세는 planning/HANDOFF.md)

## Working Rules
- Read relevant files before suggesting changes.
- Explain the plan before editing files.
- Keep changes small.
- Do not add unnecessary dependencies.
- Update docs when project direction changes.
- Summarize changed files before commit.
- 답변은 한국어로, 결론 먼저.
- 새 기능을 제안할 때는 "MVP / 베타 / 나중" 중 어디인지 먼저 표시한다.
- 새 API·라이브러리가 필요하면 이유와 대안을 먼저 말하고 확인받는다.
- 코드는 바로 실행 가능한 단위로 주고, 수정 시 바뀐 부분과 이유를 짧게 설명한다.
- 모바일 세로 화면(375px 폭)·터치·마이크 권한 흐름을 기준으로 만들고 검토한다.
- 시연 안정성 우선: 음성 인식 실패·네트워크 오류 시 폴백(텍스트 입력, 예시 단어)을 항상 고려한다.
- 링크·파일·노션 페이지를 못 읽었으면 추측하지 말고 못 읽었다고 말한다.
- API 사양·요금처럼 바뀔 수 있는 정보는 검색해서 확인한다.
- 아이에게 보여줄 단어 설명은 사전 뜻풀이 범위를 벗어나지 않는다. 해커톤에서는 미리 검수한 단어 데이터(src/data)만 쓴다.
- 외부 API는 src/lib/services 어댑터를 거쳐 서버(src/app/api)에서만 호출한다. API 키는 .env.local에만 두고 클라이언트에 노출하지 않는다.
- 되묻기 로직(src/lib/pronunciation)은 외부 API 없이 동작하는 순수 함수로 유지한다.

## Moya Response Rules
- 말투: TBD (예: 호기심 많고 다정한 반말, 짧은 문장)
- 설명 형식: 아이 눈높이의 한두 문장 정의 + 일상 예문 1개
- 아이에게 부적절한 단어(욕설·성적·폭력적 표현 등)는 설명하지 않고 "엄마·아빠한테 물어보자"로 안내한다.
- 음성 녹음·개인정보는 최소로 수집하고, 무엇을 저장하는지 화면에서 명확히 보여준다.

## Hackathon Focus
- 심사에서 보여줄 핵심 장면(아이가 엉성하게 물어도 모야가 맞춰주는 순간)이 잘 드러나는 쪽을 우선한다.
- 발표·피칭 자료는 '맥락 기반 단어 유추' 차별점을 중심으로 한다.

## Boundaries
Do not add:
- payment (부모 구독은 베타 단계에서)
- complex authentication (MVP는 로그인 없이 시작)
- real-time collaboration
- large file upload
- 아이 음성 원본 저장 (인식된 텍스트만 저장)
- 해커톤에서 음성인식 외의 외부 API. 음성 출력은 브라우저 내장 speechSynthesis를 쓴다. 사전 API·LLM 실시간 설명·LLM 재순위는 베타 (MVP의 맥락 단서는 상황 버튼 + 단어 데이터의 상황 태그로 처리). 연동은 mock으로 흐름을 먼저 확인한 뒤 실제 API로 교체한다.

## References
- Follow docs/PRD.md for scope.
- Follow docs/DESIGN.md for UI direction.
- Follow docs/ARCHITECTURE.md for project structure.
- 상세 설계 (planning/md-design/):
  - 01_PRODUCT_BRIEF.md — 문제, 사용자, 가치, 범위
  - 02_REQUIREMENTS_SPEC.md — FR/NFR, 인수조건, 추적표
  - 03_UX_UI_SPEC.md — 화면(S/E), 컴포넌트, 상호작용, 접근성
  - 04_TECHNICAL_DESIGN.md — route, source structure, data model, state, storage
  - 05_DELIVERY_PLAN.md — 일정, 오늘 범위, 수동 QA
- Next.js 16 버전별 규칙 (create-next-app 생성, `next dev`가 자동 갱신): @AGENTS.md
