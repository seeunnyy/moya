// 공통 타입 (planning/md-design/04_TECHNICAL_DESIGN.md §3)

// 들은 상황 (맥락 질문의 버튼 값, 잠정)
export type HeardContext = "tv" | "book" | "adult" | "school";

// 검수된 단어 데이터 (src/data)
export type WordEntry = {
  id: string; // 예: "jeogeumtong-1"
  word: string; // 표제어
  senseId: number; // 동음이의어 구분
  hint: string; // 확인 질문·후보 카드에 붙는 짧은 힌트
  contextTags: HeardContext[]; // 아이가 이 단어를 주로 듣는 상황
  kidExplanation: string; // 아이 눈높이 설명 (한두 문장)
  example: string; // 일상 예문 1개 (데이터에만 두고 화면에는 보여주지 않음)
  english?: string; // 영어 표기 (단어 카드에 작게, 없으면 숨김)
  dictDefinition: string; // 사전 뜻풀이 (검수 기준)
  source: string; // 사전 출처
  reviewed: boolean; // 검수 완료 여부
};

// 저장되는 단어 카드
export type WordCard = {
  id: string;
  wordEntryId: string;
  word: string;
  dictDefinition: string;
  kidExplanation: string;
  example: string;
  heardContext?: HeardContext; // 들은 상황. 맥락 질문이 빠져 새 카드에는 없음 (예전 데이터 호환용)
  spokenAs: string; // 아이가 처음 말한 발음 (인식 텍스트)
  createdAt: string; // ISO 8601
  nextReviewAt?: string; // 베타
  reviewStep?: number; // 베타 (1·3·7일)
};

// 물어볼 단어
export type PendingWord = {
  id: string;
  spokenAs: string;
  heardContext?: HeardContext;
  createdAt: string;
};

export type Candidate = {
  entry: WordEntry;
  distance: number;
  contextMatch?: boolean; // 들은 상황 태그 일치 여부 (MVP 정렬용)
  score?: number; // 베타 (LLM 재순위)
};

export type CandidateResult =
  | { kind: "confirm"; candidate: Candidate } // 후보 1개
  | { kind: "choose"; candidates: Candidate[] } // 후보 2~3개
  | { kind: "unknown" }; // 후보 0개

export type PronunciationRule = {
  from: string; // 아이가 낸 소리 (들린 자모)
  to: string; // 원래 단어였을 수 있는 자모
  position: "초성" | "중성" | "종성";
  note: string;
};
