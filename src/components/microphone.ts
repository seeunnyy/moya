// 브라우저 마이크 도우미 (S10 권한 안내, S1 녹음). 브라우저에서만 부른다.
// http로 접속하면(localhost 제외) 브라우저가 마이크를 막아 navigator.mediaDevices가 없다 → 쓸 수 없음으로 본다.

// 마이크를 열어 스트림을 돌려준다. 권한 거부·미지원·http 접속이면 null (→ E1).
export async function openMic(): Promise<MediaStream | null> {
  if (typeof MediaRecorder === "undefined" || !navigator.mediaDevices?.getUserMedia) return null;
  try {
    return await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch {
    return null;
  }
}

export function closeMic(stream: MediaStream) {
  stream.getTracks().forEach((track) => track.stop());
}

// 이 기기에서 마이크 권한이 이미 허용됐는지. 알 수 없으면(API 없음·실패) false → 권한 안내를 보여준다.
export async function micAlreadyGranted(): Promise<boolean> {
  try {
    const status = await navigator.permissions?.query({ name: "microphone" as PermissionName });
    return status?.state === "granted";
  } catch {
    return false;
  }
}
