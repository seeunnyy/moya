// 침묵 감지 판단 (순수 함수). 마이크 소리 크기(RMS)를 0.1초마다 넣으면, 말을 마쳤는지 알려 준다.
// 브라우저 쪽(Web Audio로 크기 재기)은 src/components/microphone.ts.

import { MIN_RECORDING_MS, SILENCE_END_MS, SILENCE_LEVEL, VOICE_LEVEL } from "./config.ts";

export type SilenceState = { startedAt: number; spoke: boolean; quietSince: number | null };

export function startSilence(now: number): SilenceState {
  return { startedAt: now, spoke: false, quietSince: null };
}

// 다음 상태와 녹음을 끝낼지. 말을 한 번도 안 했으면 끝내지 않는다(최대 녹음 시간이 끝낸다)
export function stepSilence(state: SilenceState, level: number, now: number): { state: SilenceState; done: boolean } {
  const spoke = state.spoke || level >= VOICE_LEVEL;
  let quietSince = state.quietSince;
  if (level >= SILENCE_LEVEL) quietSince = null;
  else if (quietSince === null) quietSince = now;
  const next = { startedAt: state.startedAt, spoke, quietSince };
  const done =
    spoke && quietSince !== null && now - quietSince >= SILENCE_END_MS && now - state.startedAt >= MIN_RECORDING_MS;
  return { state: next, done };
}
