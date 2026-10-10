// 화면 쪽 음성인식 어댑터: 녹음한 오디오를 우리 서버(/api/stt)로 보내 인식 후보를 받는다.
// 외부 STT는 서버 라우트에서만 부르고, 여기서는 우리 서버만 부른다 (CLAUDE.md "외부 API는 서버에서만").
// - 네트워크 오류(fetch 실패)는 한 번 다시 시도하고, 그래도 실패하면 "network" → 연결이 끊겼어요(E-1).
// - 서버가 실패 응답을 주거나 결과가 비면 "empty" → 다시 말해줄래(2-7). 다시 시도하지 않는다.
// - mock STT일 때만 생각 중(2-3)을 최소 1.5초 보여준다(피그마 자동 넘김 흉내). 듣는 중 2.5초는 listenLimitMs.

import { MAX_RECORDING_MS, MOCK_LISTEN_MS, MOCK_THINK_MS } from "../config.ts";

export type RecognizeResult =
  | { ok: true; transcripts: string[]; provider: string }
  | { ok: false; reason: "network" | "empty" };

export type RecognizerDeps = {
  fetch: (input: string, init?: RequestInit) => Promise<Response>;
  sleep: (ms: number) => Promise<void>;
  now: () => number;
};

const browserDeps = (): RecognizerDeps => ({
  fetch: (input, init) => globalThis.fetch(input, init),
  sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  now: () => Date.now(),
});

export const MAX_NETWORK_ATTEMPTS = 2; // 처음 1번 + 자동 다시 시도 1번

// mock이면 2.5초 뒤 자동으로 녹음을 끝내고, 실제 STT면 최대 녹음 시간까지 기다린다.
export function listenLimitMs(provider: string | null): number {
  return provider === "mock" ? MOCK_LISTEN_MS : MAX_RECORDING_MS;
}

export function createRecognizer(deps: RecognizerDeps = browserDeps()) {
  // 지금 쓰는 STT 이름. 알 수 없으면 null (실제 STT처럼 기다리지 않는다).
  async function provider(): Promise<string | null> {
    try {
      const response = await deps.fetch("/api/stt");
      if (!response.ok) return null;
      const data: { provider?: unknown } = await response.json();
      return typeof data.provider === "string" ? data.provider : null;
    } catch {
      return null;
    }
  }

  async function recognize(audio: Blob): Promise<RecognizeResult> {
    const startedAt = deps.now();
    let response: Response | null = null;
    for (let attempt = 1; attempt <= MAX_NETWORK_ATTEMPTS && !response; attempt++) {
      try {
        const form = new FormData();
        form.append("audio", audio, "question");
        response = await deps.fetch("/api/stt", { method: "POST", body: form });
      } catch {
        response = null; // 네트워크 오류 → 한 번 더
      }
    }
    if (!response) return { ok: false, reason: "network" };

    let result: RecognizeResult = { ok: false, reason: "empty" };
    if (response.ok) {
      try {
        const data: { transcripts?: unknown; provider?: unknown } = await response.json();
        const transcripts = Array.isArray(data.transcripts)
          ? data.transcripts.filter((t): t is string => typeof t === "string")
          : [];
        const name = typeof data.provider === "string" ? data.provider : "";
        if (transcripts.length > 0) result = { ok: true, transcripts, provider: name };
        if (name === "mock") {
          const waited = deps.now() - startedAt;
          if (waited < MOCK_THINK_MS) await deps.sleep(MOCK_THINK_MS - waited);
        }
      } catch {
        // 응답이 깨졌으면 다시 말해줄래
      }
    }
    return result;
  }

  return { provider, recognize };
}
