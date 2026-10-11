// STT 어댑터 고르기. 환경변수 STT_PROVIDER로 고른다: mock(기본, 시연용) · openai(OpenAI 음성 변환).
// API 키(STT_API_KEY)·모델(STT_MODEL, 기본 gpt-transcribe)은 여기서만 읽는다. NEXT_PUBLIC_을 붙이지 않아 브라우저로 가지 않는다 (NFR-03).
// STT_PROVIDER=mock으로 바꾸고 개발 서버를 다시 켜면 언제든 시연용으로 돌아간다.

import { MOCK_STT_TURNS } from "../../../data/examplePrompts.ts";
import { createMockSttAdapter } from "./mock.ts";
import { createOpenAiSttAdapter, DEFAULT_STT_MODEL } from "./openai.ts";
import type { SttAdapter } from "./types.ts";

export type { SttAdapter, SttResult } from "./types.ts";
export { SttUnreachableError } from "./openai.ts";

type Env = Record<string, string | undefined>;

// 서버 프로세스 하나에 mock 하나. 녹음할 때마다 시연용 인식 후보 묶음을 차례로 돌려준다.
let mockAdapter: SttAdapter | null = null;

// 지금 쓰는 STT 이름 (GET /api/stt). 화면이 mock일 때만 자동 넘김 시간을 흉내 내려고 묻는다.
export function sttProviderName(env: Env = process.env): string {
  return env.STT_PROVIDER || "mock";
}

export function selectSttAdapter(env: Env = process.env): SttAdapter {
  const provider = sttProviderName(env);
  if (provider === "mock") {
    mockAdapter ??= createMockSttAdapter(MOCK_STT_TURNS);
    return mockAdapter;
  }
  if (provider === "openai") {
    return createOpenAiSttAdapter({ apiKey: env.STT_API_KEY ?? "", model: env.STT_MODEL || DEFAULT_STT_MODEL });
  }
  throw new Error(`STT_PROVIDER "${provider}"는 없는 서비스예요 (mock 또는 openai)`);
}
