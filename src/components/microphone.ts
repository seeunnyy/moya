// 브라우저 마이크 도우미 (S10 권한 안내, S1 녹음). 브라우저에서만 부른다.
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
