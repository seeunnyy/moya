import { test } from "node:test";
import assert from "node:assert/strict";
import {
  audioFileName,
  createOpenAiSttAdapter,
  OPENAI_TRANSCRIPTIONS_URL,
  SttUnreachableError,
  STT_PROMPT,
} from "../../src/lib/services/stt/openai.ts";
import { selectSttAdapter } from "../../src/lib/services/stt/index.ts";

const webm = new Blob(["fake audio"], { type: "audio/webm;codecs=opus" });

// 가짜 fetch: 보낸 요청을 남기고 정해 둔 응답(또는 오류)을 돌려준다
function fakeFetch(reply: Response | Error) {
  const calls: { url: string; init?: RequestInit }[] = [];
  const fetch = async (url: string, init?: RequestInit) => {
    calls.push({ url, init });
    if (reply instanceof Error) throw reply;
    return reply;
  };
  return { fetch, calls };
}

test("OpenAI 요청: 주소·키·파일(확장자)·모델·한국어·짧은 맥락, 검수 단어 목록은 보내지 않는다", async () => {
  const { fetch, calls } = fakeFetch(Response.json({ text: "저굼통이 뭐야?", languages: [{ code: "ko" }] }));
  const stt = createOpenAiSttAdapter({ apiKey: "sk-test", fetch });
  assert.deepEqual(await stt.transcribe(webm), { transcripts: ["저굼통이 뭐야?"] });
  const { url, init } = calls[0];
  assert.equal(url, OPENAI_TRANSCRIPTIONS_URL);
  assert.equal(init?.method, "POST");
  assert.deepEqual(init?.headers, { Authorization: "Bearer sk-test" });
  const form = init?.body as FormData;
  assert.equal((form.get("file") as File).name, "question.webm");
  assert.equal(form.get("model"), "gpt-transcribe");
  assert.deepEqual(form.getAll("languages[]"), ["ko"]);
  assert.equal(form.get("language"), null);
  assert.equal(form.get("prompt"), STT_PROMPT);
  assert.equal(form.get("keywords[]"), null);
});

test("gpt-4o-mini-transcribe 같은 모델은 language 하나로 보낸다 (STT_MODEL)", async () => {
  const { fetch, calls } = fakeFetch(Response.json({ text: "우싼이 뭐야?" }));
  await createOpenAiSttAdapter({ apiKey: "k", model: "gpt-4o-mini-transcribe", fetch }).transcribe(webm);
  const form = calls[0].init?.body as FormData;
  assert.equal(form.get("model"), "gpt-4o-mini-transcribe");
  assert.equal(form.get("language"), "ko");
  assert.equal(form.get("languages[]"), null);
});

test("빈 글자는 빈 결과 (다시 말해줄래로 간다)", async () => {
  const { fetch } = fakeFetch(Response.json({ text: "  " }));
  assert.deepEqual(await createOpenAiSttAdapter({ apiKey: "k", fetch }).transcribe(webm), { transcripts: [] });
});

test("시간 초과·연결 실패는 SttUnreachableError (라우트 504 → E-1)", async () => {
  const timeout = new DOMException("The operation timed out.", "TimeoutError");
  await assert.rejects(createOpenAiSttAdapter({ apiKey: "k", fetch: fakeFetch(timeout).fetch }).transcribe(webm), SttUnreachableError);
  await assert.rejects(
    createOpenAiSttAdapter({ apiKey: "k", fetch: fakeFetch(new TypeError("fetch failed")).fetch }).transcribe(webm),
    SttUnreachableError,
  );
});

test("실패 응답·키 없음은 보통 오류 (라우트 502 → 2-7)", async () => {
  const bad = createOpenAiSttAdapter({ apiKey: "k", fetch: fakeFetch(new Response("invalid key", { status: 401 })).fetch });
  await assert.rejects(bad.transcribe(webm), (e: Error) => !(e instanceof SttUnreachableError) && /401/.test(e.message));
  await assert.rejects(createOpenAiSttAdapter({ apiKey: "" }).transcribe(webm), /STT_API_KEY/);
});

test("녹음 형식 → 파일 이름 (Chrome webm, Safari mp4)", () => {
  assert.equal(audioFileName("audio/webm;codecs=opus"), "question.webm");
  assert.equal(audioFileName("audio/mp4"), "question.mp4");
  assert.equal(audioFileName("audio/aac"), "question.mp4");
  assert.equal(audioFileName(""), "question.webm");
});

test("STT_PROVIDER=openai면 OpenAI 어댑터 (모델은 STT_MODEL, 없으면 gpt-transcribe)", () => {
  assert.equal(selectSttAdapter({ STT_PROVIDER: "openai", STT_API_KEY: "k" }).name, "openai");
});
