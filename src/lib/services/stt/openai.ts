// OpenAI 음성 변환 STT 어댑터 (POST https://api.openai.com/v1/audio/transcriptions). 서버(/api/stt)에서만 쓴다.
// - 새 패키지 없이 fetch + FormData로 부른다 (PM 결정 2026-10-12).
// - 오디오는 변환 요청에만 쓰고 저장하지 않는다. 키는 서버 환경변수로만 받는다.
// - 한국어로 인식한다: gpt-transcribe는 `languages[]`, 그 밖 모델(gpt-4o-mini-transcribe 등)은 `language` 하나 (OpenAI 문서).
// - 힌트는 짧은 맥락(prompt)만 준다. 검수 단어 목록(keywords)은 주지 않는다 — STT가 서툰 발음을 목록 단어로 고쳐 버리면
//   되묻기 장면이 줄고 말하지 않은 단어가 나올 수 있어서 (PM 확인 2026-10-12).
// - 결과는 1개라 transcripts는 길이 1 배열(글자가 비면 빈 배열 → 2-7).
// - 응답이 없거나(시간 초과) 연결이 안 되면 SttUnreachableError → 라우트가 504 → 화면은 E-1. 그 밖 실패는 Error → 502 → 2-7.

import type { SttAdapter } from "./types.ts";

export const OPENAI_TRANSCRIPTIONS_URL = "https://api.openai.com/v1/audio/transcriptions";
export const DEFAULT_STT_MODEL = "gpt-transcribe";
export const STT_TIMEOUT_MS = 10_000;

// 아이 질문의 모양만 알려 준다. 발음을 고치지 말라고 적어 둔다
export const STT_PROMPT = "만 5~8세 아이가 '○○이 뭐야?'처럼 모르는 낱말을 묻는 짧은 질문. 발음을 고치지 말고 들리는 대로 적기.";

export class SttUnreachableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SttUnreachableError";
  }
}

type Fetch = (input: string, init?: RequestInit) => Promise<Response>;

// 녹음 형식에 맞는 파일 이름 (OpenAI는 확장자로 형식을 안다). Chrome webm, Safari mp4
export function audioFileName(type: string): string {
  const t = type.toLowerCase();
  if (t.includes("webm")) return "question.webm";
  if (t.includes("mp4") || t.includes("m4a") || t.includes("aac")) return "question.mp4";
  if (t.includes("mpeg") || t.includes("mp3")) return "question.mp3";
  if (t.includes("wav")) return "question.wav";
  return "question.webm";
}

export function createOpenAiSttAdapter(options: {
  apiKey: string;
  model?: string;
  fetch?: Fetch;
  timeoutMs?: number;
}): SttAdapter {
  const { apiKey, model = DEFAULT_STT_MODEL, timeoutMs = STT_TIMEOUT_MS } = options;
  const doFetch: Fetch = options.fetch ?? ((input, init) => globalThis.fetch(input, init));
  return {
    name: "openai",
    async transcribe(audio: Blob) {
      if (!apiKey) throw new Error("STT_API_KEY가 비어 있어요");
      const form = new FormData();
      form.append("file", audio, audioFileName(audio.type));
      form.append("model", model);
      if (model === "gpt-transcribe") form.append("languages[]", "ko");
      else form.append("language", "ko");
      form.append("prompt", STT_PROMPT);
      form.append("response_format", "json");

      let response: Response;
      try {
        response = await doFetch(OPENAI_TRANSCRIPTIONS_URL, {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}` },
          body: form,
          signal: AbortSignal.timeout(timeoutMs),
        });
      } catch (error) {
        // 시간 초과(TimeoutError)·연결 실패(TypeError)
        throw new SttUnreachableError(error instanceof Error ? error.name : "fetch 실패");
      }
      if (!response.ok) {
        // 키 오류(401)·요청 오류(400)·한도(429)·서버 오류(5xx). 내용은 서버 로그에만 (화면은 2-7)
        const detail = await response.text().catch(() => "");
        throw new Error(`OpenAI 음성 변환 실패 ${response.status}: ${detail.slice(0, 300)}`);
      }
      const data: { text?: unknown } = await response.json();
      const text = typeof data.text === "string" ? data.text.trim() : "";
      return { transcripts: text ? [text] : [] };
    },
  };
}
