// POST /api/stt — 녹음한 오디오를 받아 STT 어댑터로 글자로 바꾼다 (FR-01, NFR-03).
// 요청: multipart/form-data, 필드 "audio". 응답: { transcripts: string[], provider: string }.
// 오디오는 변환에만 쓰고 저장하지 않는다 (NFR-04). 실패하면 4xx/5xx → 화면은 E2로 간다.

import { selectSttAdapter } from "@/lib/services/stt";

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
  } catch {
    return Response.json({ error: "음성인식에 실패했어요" }, { status: 502 });
  }
}
