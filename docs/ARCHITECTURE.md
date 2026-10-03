# ARCHITECTURE.md

## Service Structure
User → Landing Page → App Page → UI Components → State → Data → Tests → Deploy

## Core Flow (MVP)
1. 묻기: 아이 음성 → 음성인식 → 문장("○○이 뭐야?")에서 대상 단어 추출
2. 되묻기: 자모 분해 → 발음 역규칙 적용 → 검수된 단어 데이터와 거리 비교
   - 후보 1개: 확인 질문
   - 후보 여러 개: 맥락 질문(답은 들은 상황으로 기록) → 힌트와 함께 2~3개 제시 (맥락 재순위는 베타)
   - 후보 0개: '물어볼 단어'로 저장
3. 단어 카드: 미리 검수한 단어 데이터의 쉬운 설명·예문 → 브라우저 음성합성으로 읽기 → 카드 저장
   - 단어 데이터는 LLM 초안을 사전 뜻과 대조해 검수한 뒤 src/data에 미리 넣는다 (사전 범위 밖 금지)

## Planned Routes
- /: Landing page
- /app: 묻기·되묻기·설명 (메인)
- /app/cards: 단어 카드 모음
- /parent: 부모 리포트 (2순위)
- /api/stt: 음성인식 서버 라우트 (키 보호용). /api/rerank, /api/explain은 베타

## Source Structure
- src/app/: 라우트 (페이지 + api)
- src/components/: UI 컴포넌트 (MoyaCharacter, MicButton, CandidatePicker, WordCard)
- src/lib/pronunciation/: 되묻기 핵심 로직 — 자모 분해, 발음 역규칙, 후보 거리 비교 (외부 API 없이 동작)
- src/lib/services/: 외부 서비스 어댑터 — 해커톤은 stt(처음엔 mock)와 speech(브라우저 speechSynthesis). llm, dictionary는 베타
- src/lib/storage/: 단어 카드 저장 (MVP: localStorage)
- src/data/: 발음 역규칙 표, 검수된 단어 데이터 50~100개(힌트·쉬운 설명·예문 포함), mock 데이터 (코드와 분리해 아이 녹음 테스트 결과로 갱신)
- src/types/: 공통 타입
- docs/: project documents
- tests/: test code (되묻기 로직이 1순위 테스트 대상)

## Data (MVP)
- WordCard: 단어, 사전 뜻, 아이 눈높이 설명, 예문, 들은 상황, 아이가 처음 말한 발음(인식 텍스트), 만든 날짜
- (2순위) 다음 복습일

## External Services
- 해커톤: 음성인식(STT) 하나만 쓴다. 서비스는 미정 (TBD). .env.local의 키로 서버에서만 호출한다.
- 음성 출력: 브라우저 내장 speechSynthesis (외부 API 아님)
- 베타: 사전 API(예: 국립국어원 사전 오픈 API), LLM (실시간 설명, 맥락 재순위)
- 상세: planning/md-design/04_TECHNICAL_DESIGN.md
