// 브라우저 마이크 도우미 (1-6 권한, 2-2 녹음). 브라우저에서만 부른다.

import { startSilence, stepSilence } from "@/lib/silence";
// http로 접속하면(localhost 제외) 브라우저가 마이크를 막아 navigator.mediaDevices가 없다 → 쓸 수 없음으로 본다.

// 마이크를 열어 스트림을 돌려준다. 권한 거부·미지원·http 접속이면 null (→ E1).
export async function openMic(): Promise<MediaStream | null> {
  if (!micSupported()) return null;
  try {
    return await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch {
    return null;
  }
}

export function closeMic(stream: MediaStream) {
  stream.getTracks().forEach((track) => track.stop());
}

// 마이크 권한 상태 (음성 녹음 화면의 [녹음 시작]). design.md Open Questions "마이크 권한 상태 확인".
// "prompt": 아직 묻지 않음 → 권한 안내로 보낸다. "unknown": API가 없거나 실패 → 바로 마이크를 열어 브라우저가 묻게 한다.
export type MicPermission = "granted" | "denied" | "prompt" | "unknown";

export async function micPermission(): Promise<MicPermission> {
  try {
    const status = await navigator.permissions?.query({ name: "microphone" as PermissionName });
    return status?.state ?? "unknown";
  } catch {
    return "unknown";
  }
}

// 마이크를 쓸 수 있는 브라우저인지 (MediaRecorder·getUserMedia, http 접속이면 없음). 없으면 폴백(E1)을 보인다.
export function micSupported(): boolean {
  return typeof MediaRecorder !== "undefined" && !!navigator.mediaDevices?.getUserMedia;
}

// 녹음 형식: OpenAI 음성 변환이 받는 형식 중 브라우저가 되는 것 (Chrome webm, Safari mp4). 없으면 브라우저 기본
export function recorderMimeType(): string | undefined {
  for (const type of ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"]) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported?.(type)) return type;
  }
  return undefined;
}

// 말을 마치면(침묵) onDone을 한 번 부른다. 0.1초마다 마이크 소리 크기(RMS)를 잰다 (Web Audio, 새 라이브러리 없음).
// 돌려준 함수로 멈춘다. 브라우저가 Web Audio를 못 쓰면 아무것도 하지 않는다(최대 녹음 시간이 끝냄).
export function watchSilence(stream: MediaStream, onDone: () => void): () => void {
  const AudioCtx: typeof AudioContext | undefined =
    globalThis.AudioContext ?? (globalThis as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return () => {};
  let ctx: AudioContext;
  try {
    ctx = new AudioCtx();
  } catch {
    return () => {};
  }
  const source = ctx.createMediaStreamSource(stream);
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 1024;
  source.connect(analyser);
  const buf = new Float32Array(analyser.fftSize);
  let state = startSilence(performance.now());
  let stopped = false;
  const timer = window.setInterval(() => {
    analyser.getFloatTimeDomainData(buf);
    let sum = 0;
    for (const v of buf) sum += v * v;
    const r = stepSilence(state, Math.sqrt(sum / buf.length), performance.now());
    state = r.state;
    if (r.done) {
      stop();
      onDone();
    }
  }, 100);
  function stop() {
    if (stopped) return;
    stopped = true;
    window.clearInterval(timer);
    source.disconnect();
    void ctx.close().catch(() => {});
  }
  return stop;
}
