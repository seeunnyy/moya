# CLAUDE.md

## Project
4호선톤 해커톤 MVP — 모야(Moya). 만 5~8세 아이를 위한 음성 어휘 학습 모바일 웹.

## Product Idea
This app helps 글을 막 배우는 만 5~8세 아이 solve "철자를 몰라 모르는 단어를 찾을 수 없고, 기존 음성 AI는 아이 발음을 잘 못 알아듣는 문제" by 외계인 친구 '모야'에게 음성으로 묻고, 발음이 서툴면 되묻기로 단어를 찾아 아이 눈높이 설명을 듣는 것.

## Tech Stack
- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- Claude Code
- GitHub

## Current Stage
Session 1: project setup and context design. (기능 구현 전)

## Working Rules
- Read relevant files before suggesting changes.
- Explain the plan before editing files.
- Keep changes small.
- Do not add unnecessary dependencies.
- Update docs when project direction changes.
- Summarize changed files before commit.
- 모바일 세로 화면(375px 폭)을 기준으로 만든다.
- 아이에게 보여줄 단어 설명은 사전 뜻풀이 범위를 벗어나지 않는다. LLM이 사전에 없는 내용을 지어내지 않게 한다.
- 외부 API는 src/lib/services 어댑터를 거쳐 서버(src/app/api)에서만 호출한다. API 키는 .env.local에만 두고 클라이언트에 노출하지 않는다.
- 되묻기 로직(src/lib/pronunciation)은 외부 API 없이 동작하는 순수 함수로 유지한다.

## Boundaries
Do not add:
- payment (부모 구독은 베타 단계에서)
- complex authentication (MVP는 로그인 없이 시작)
- real-time collaboration
- large file upload
- 아이 음성 원본 저장 (인식된 텍스트만 저장)
- 음성인식·LLM·사전·음성합성 4종 외의 외부 API. 연동은 한 번에 하나씩, mock으로 흐름을 먼저 확인한 뒤 실제 API로 교체한다.

## References
- Follow docs/PRD.md for scope.
- Follow docs/DESIGN.md for UI direction.
- Follow docs/ARCHITECTURE.md for project structure.
- Next.js 16 버전별 규칙 (create-next-app 생성, `next dev`가 자동 갱신): @AGENTS.md
