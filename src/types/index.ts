// 공통 타입 (planning/md-design/04_TECHNICAL_DESIGN.md §3)

// 들은 곳 (2-5 "어디서 들었어?"의 버튼 값: 집 · 유치원·학교 · TV·영상 · 책 · 밖에서)
export const HEARD_CONTEXTS = ["home", "school", "tv", "book", "outside"] as const;
export type HeardContext = (typeof HEARD_CONTEXTS)[number];

// 검수된 단어 데이터 (src/data). 빈 문자열("")은 피그마에 문구가 없어 PM이 채울 칸이다.
export type WordEntry = {
  id: string; // 예: "jeogeumtong-1"
  word: string; // 표제어
  senseId: number; // 동음이의어 구분
  image: string; // 단어 그림 (public 경로, 예: "/words/jeogeumtong.svg")
  hint: string; // 확인 질문(2-4)·후보 고르기(2-6) 카드의 짧은 힌트
  contextTags: HeardContext[]; // 아이가 이 단어를 주로 듣는 곳
  bubbleExplanation?: string; // 뜻 알려주기(2-9) 말풍선 설명. 줄바꿈은 \n. 없으면 kidExplanation
  kidExplanation: string; // 카드(2-10, 3-2, 3-3)의 아이 눈높이 설명 (한두 문장)
  example: string; // 카드에 보이는 예문 1개 (화면에서 앞에 "예) "를 붙인다)
  english?: string; // 영어 표기 (새 피그마에서는 화면에 쓰지 않음, 데이터에만)
  dictDefinition: string; // 사전 뜻풀이 (검수 기준)
  source: string; // 사전 출처
  reviewed: boolean; // 검수 완료 여부
};

// 카드 상태 (3-2 아래 버튼). 반복 학습이 베타라 새로 모은 카드는 모두 new
export type CardStatus = "new" | "reviewing" | "mastered";

// 저장되는 단어 카드
export type WordCard = {
  id: string;
  wordEntryId: string;
  word: string;
  dictDefinition: string;
  kidExplanation: string;
  example: string;
  heardContext?: HeardContext; // 2-5에서 고른 들은 곳 (고르지 않았으면 없음). 옛 값 "adult"는 읽을 때 버린다
  spokenAs: string; // '내가 말한 소리' — 이 단어와 맞은 인식 대상 단어 (오늘의 단어 카드는 빈 문자열)
  createdAt: string; // ISO 8601
  status?: CardStatus; // 없으면 new
  nextReviewAt?: string; // 베타
  reviewStep?: number; // 베타 (1·3·7일)
};

// 물어볼 단어
export type PendingWord = {
  id: string;
  spokenAs: string;
  heardContext?: HeardContext;
  createdAt: string;
  taughtWordId?: string; // 보호자가 알려 준 단어 (5-3a)
};

export type Candidate = {
  entry: WordEntry;
  distance: number;
  spokenAs?: string; // 이 후보와 가장 가깝게 맞은 대상 단어 (카드의 '내가 말한 소리')
  taught?: boolean; // 보호자가 알려 준 단어라 맨 앞에 둔 후보
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
