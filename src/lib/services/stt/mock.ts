// mock STT. 녹음 내용과 상관없이 정해진 인식 후보 묶음을 차례로 돌려준다 (마지막 다음은 처음으로).
// 녹음 한 번 = 인식 후보 여러 개(실제 STT처럼). 빈 묶음은 인식 실패를 흉내 낸다.
// [마이크]만으로 피그마 흐름도의 시연 장면을 순서대로 확인하려고 쓴다. 오디오는 읽지 않고 버린다.

import type { SttAdapter } from "./types.ts";

export function createMockSttAdapter(turns: string[][]): SttAdapter {
  let next = 0;
  return {
    name: "mock",
    async transcribe() {
      if (turns.length === 0) return { transcripts: [] };
      const transcripts = turns[next % turns.length];
      next += 1;
      return { transcripts: [...transcripts] };
    },
  };
}
