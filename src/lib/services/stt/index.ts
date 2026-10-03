// STT 어댑터 고르기. 환경변수 STT_PROVIDER로 고른다 (없으면 mock).
// API 키(STT_API_KEY)는 실제 어댑터를 만들 때 여기서만 읽는다. NEXT_PUBLIC_을 붙이지 않아 브라우저로 가지 않는다 (NFR-03).
// 실제 서비스 어댑터는 STT 확정(~10/22) 후 작업 10.5에서 추가한다.

import { EXAMPLE_PROMPTS } from "../../../data/examplePrompts.ts";
import { createMockSttAdapter } from "./mock.ts";
import type { SttAdapter } from "./types.ts";

export type { SttAdapter, SttResult } from "./types.ts";

type Env = Record<string, string | undefined>;

// 서버 프로세스 하나에 mock 하나. 녹음할 때마다 예시 문장을 차례로 돌려준다.
let mockAdapter: SttAdapter | null = null;

export function selectSttAdapter(env: Env = process.env): SttAdapter {
  const provider = env.STT_PROVIDER || "mock";
  if (provider === "mock") {
    mockAdapter ??= createMockSttAdapter(EXAMPLE_PROMPTS);
    return mockAdapter;
  }
  // 실제 어댑터가 생기면 여기서 env.STT_API_KEY를 넘겨 만든다 (10.5).
  throw new Error(`STT_PROVIDER "${provider}"는 아직 구현되지 않았어요 (작업 10.5)`);
}
