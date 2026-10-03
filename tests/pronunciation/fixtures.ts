// 05 §3의 mock 단어 10개를 거리 계산에 필요한 필드만 채운 테스트용 픽스처.
// 작업 3.1에서 src/data/words.mock.ts가 생기면 그 데이터로 같은 테스트를 돌린다.

import type { HeardContext, WordEntry } from "../../src/types/index.ts";

export function makeEntry(word: string, contextTags: HeardContext[]): WordEntry {
  return {
    id: `${word}-1`,
    word,
    senseId: 1,
    hint: "",
    contextTags,
    kidExplanation: "",
    example: "",
    dictDefinition: "",
    source: "test",
    reviewed: false,
  };
}

export const MOCK_ENTRIES: WordEntry[] = [
  makeEntry("공룡", ["book", "tv"]),
  makeEntry("가방", ["school"]),
  makeEntry("가발", ["tv"]),
  makeEntry("수박", ["adult"]),
  makeEntry("태풍", ["tv"]),
  makeEntry("저금통", ["adult"]),
  makeEntry("우주", ["book"]),
  makeEntry("지구", ["school"]),
  makeEntry("화산", ["book"]),
  makeEntry("소방관", ["school"]),
];
