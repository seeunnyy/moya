// 테스트에서 단어 데이터를 직접 만들 때 쓰는 헬퍼. 거리 계산에 필요한 필드만 채운다.

import type { HeardContext, WordEntry } from "../../src/types/index.ts";

export function makeEntry(word: string, contextTags: HeardContext[]): WordEntry {
  return {
    id: `${word}-1`,
    word,
    senseId: 1,
    image: "",
    hint: "",
    contextTags,
    kidExplanation: "",
    example: "",
    dictDefinition: "",
    source: "test",
    reviewed: false,
  };
}
