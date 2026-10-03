# ARCHITECTURE.md

## Service Structure
User → Landing Page → App Page → UI Components → State → Data → Tests → Deploy

## Core Flow (MVP)
1. 묻기: 아이 음성 → 음성인식 → 문장("○○이 뭐야?")에서 대상 단어 추출
2. 되묻기: 자모 분해 → 발음 역규칙 적용 → 사전 표제어와 거리 비교
   - 후보 1개: 확인 질문
   - 후보 여러 개: 맥락 질문 후 LLM으로 재순위 → 2~3개 제시
   - 후보 0개: '물어볼 단어'로 저장
3. 단어 카드: 사전 뜻풀이 → LLM이 아이 눈높이로 변환(사전 범위 안에서만) → 음성 합성 → 카드 저장

## Planned Routes
- /: Landing page
- /app: 묻기·되묻기·설명 (메인)
- /app/cards: 단어 카드 모음
- /parent: 부모 리포트 (2순위)
- /api/*: 외부 API를 호출하는 서버 라우트 (키 보호용)

## Source Structure
- src/app/: 라우트 (페이지 + api)
- src/components/: UI 컴포넌트 (MoyaCharacter, MicButton, CandidatePicker, WordCard)
- src/lib/pronunciation/: 되묻기 핵심 로직 — 자모 분해, 발음 역규칙, 후보 거리 비교 (외부 API 없이 동작)
- src/lib/services/: 외부 API 어댑터 — stt, llm, dictionary, tts (처음엔 mock)
- src/lib/storage/: 단어 카드 저장 (MVP: localStorage)
- src/data/: 발음 역규칙 표, 테스트용 단어 목록 (코드와 분리해 아이 녹음 테스트 결과로 갱신)
- src/types/: 공통 타입
- docs/: project documents
- tests/: test code (되묻기 로직이 1순위 테스트 대상)

## Data (MVP)
- WordCard: 단어, 사전 뜻, 아이 눈높이 설명, 예문, 들은 상황, 아이가 처음 말한 발음(인식 텍스트), 만든 날짜
- (2순위) 다음 복습일

## External Services (TBD)
- 음성인식(STT): 미정
- LLM: 미정
- 사전: 미정 (예: 국립국어원 사전 오픈 API)
- 음성합성(TTS): 미정
- 모두 .env.local의 키로 서버에서만 호출한다.
