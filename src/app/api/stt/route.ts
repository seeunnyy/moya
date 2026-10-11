// POST /api/stt — 녹음한 오디오를 받아 STT 어댑터로 글자로 바꾼다 (FR-01, NFR-03).
// 요청: multipart/form-data, 필드 "audio". 응답: { transcripts: string[], provider: string }.
// 오디오는 변환에만 쓰고 저장하지 않는다 (NFR-04). 실패 응답:
// - 504: STT 서비스에 닿지 않음(약 10초 시간 초과·연결 실패) → 화면은 E-1 연결이 끊겼어요
// - 그 밖 4xx/5xx(키 오류·서비스 오류 등) → 화면은 2-7 다시 말해줄래. 자세한 이유는 서버 로그에만 남긴다.

import { selectSttAdapter, sttProviderName, SttUnreachableError } from "@/lib/services/stt";

// GET /api/stt — 지금 쓰는 STT 이름만 알려 준다 ({ provider: "mock" }). 키·설정은 보내지 않는다.
export function GET() {
  return Response.json({ provider: sttProviderName() });
}

// 최대 녹음 시간(config MAX_RECORDING_MS) 안의 짧은 질문이면 넉넉한 크기
const MAX_AUDIO_BYTES = 5 * 1024 * 1024;

export async function POST(request: Request) {
  let audio: FormDataEntryValue | null = null;
  try {
    audio = (await request.formData()).get("audio");
  } catch {
    return Response.json({ error: "오디오를 읽지 못했어요" }, { status: 400 });
  }
  if (!(audio instanceof Blob) || audio.size === 0) {
    return Response.json({ error: "오디오가 없어요" }, { status: 400 });
  }
  if (audio.size > MAX_AUDIO_BYTES) {
    return Response.json({ error: "녹음이 너무 길어요" }, { status: 413 });
  }

  try {
    const stt = selectSttAdapter();
    const { transcripts } = await stt.transcribe(audio);
    return Response.json({ transcripts, provider: stt.name });
  } catch (error) {
    console.error("[/api/stt]", error instanceof Error ? error.message : error);
    if (error instanceof SttUnreachableError) {
      return Response.json({ error: "음성인식 서비스에 연결하지 못했어요" }, { status: 504 });
    }
    return Response.json({ error: "음성인식에 실패했어요" }, { status: 502 });
  }
}
