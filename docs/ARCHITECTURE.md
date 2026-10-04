# ARCHITECTURE.md

## Service Structure
User → Landing Page → App Page → UI Components → State → Data → Tests → Deploy

## Core Flow (MVP)
1. 묻기: 아이 음성 → 음성인식 → 문장("○○이 뭐야?")에서 대상 단어 추출
2. 되묻기: 자모 분해 → 발음 역규칙 적용 → 검수된 단어 데이터와 거리 비교
   - 인식에 성공하면 항상 되묻기 화면을 거친다 (후보 미리보기 + 결과에 맞는 버튼 하나)
   - 후보 1개: 확인 질문
   - 후보 여러 개: 후보 카드 선택 (거리 순, 같으면 데이터 순). 맥락 질문은 와이어프레임에서 빠졌고 `orderByContext` 로직만 남김 (LLM 재순위는 베타)
   - 후보 0개: 물어볼 단어 안내 → [내 단어장에 저장하기]
3. 단어 카드: 미리 검수한 단어 데이터의 쉬운 설명·영어 표기 → 브라우저 음성합성으로 읽기 → [내 단어장에 저장하기]로 카드 저장 (예문은 데이터에만)
   - 단어 데이터는 LLM 초안을 사전 뜻과 대조해 검수한 뒤 src/data에 미리 넣는다 (사전 범위 밖 금지)

## Planned Routes
- /: Landing page
- /app: 아이 모드 홈 (하단 탭)
- /app/mic: 마이크 권한 안내
- /app/ask: 묻기·되묻기·단어 카드 (메인 흐름, 상태 기계)
- /app/cards: 단어 카드 목록 (하단 탭)
- /app/cards/[id]: 단어 카드 상세
- /parent: 보호자 화면 — 저장·전송 안내. 부모 리포트는 2순위
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
- WordEntry: 단어, 힌트, 쉬운 설명, 예문(화면 미표시), 영어 표기(선택), 사전 뜻, 상황 태그(화면 미사용)
- WordCard: 단어, 사전 뜻, 아이 눈높이 설명, 예문, 아이가 처음 말한 발음(인식 텍스트), 만든 날짜 (들은 상황은 예전 데이터 호환용)
- (2순위) 다음 복습일

## External Services
- 해커톤: 음성인식(STT) 하나만 쓴다. 서비스는 미정 (TBD). .env.local의 키로 서버에서만 호출한다.
- 음성 출력: 브라우저 내장 speechSynthesis (외부 API 아님)
- 베타: 사전 API(예: 국립국어원 사전 오픈 API), LLM (실시간 설명, 맥락 재순위)
- 상세: planning/md-design/04_TECHNICAL_DESIGN.md
