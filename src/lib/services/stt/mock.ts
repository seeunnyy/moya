// mock STT. 녹음 내용과 상관없이 정해진 문장을 차례로 돌려준다 (마지막 다음은 처음으로).
// [녹음 시작]만으로 데모 장면(05 §5)을 순서대로 확인하려고 쓴다. 오디오는 읽지 않고 버린다.

import type { SttAdapter } from "./types.ts";

export function createMockSttAdapter(sentences: string[]): SttAdapter {
  let next = 0;
  return {
    name: "mock",
    async transcribe() {
      if (sentences.length === 0) return { transcripts: [] };
      const sentence = sentences[next % sentences.length];
      next += 1;
      return { transcripts: [sentence] };
    },
  };
}
