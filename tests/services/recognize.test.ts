import { test } from "node:test";
import assert from "node:assert/strict";
import { createRecognizer, listenLimitMs, type RecognizerDeps } from "../../src/lib/services/recognize.ts";
import { MAX_RECORDING_MS, MOCK_LISTEN_MS, MOCK_THINK_MS } from "../../src/lib/config.ts";

const audio = new Blob(["fake audio"], { type: "audio/webm" });
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });

// 가짜 fetch: 차례로 응답하거나(Response) 네트워크 오류(Error)를 던진다. 시계는 직접 움직인다.
function fakeDeps(replies: (Response | Error)[], elapsedPerFetch = 0) {
  let clock = 0;
  const calls: { url: string; method?: string }[] = [];
  const slept: number[] = [];
  const deps: RecognizerDeps = {
    fetch: async (url, init) => {
      calls.push({ url, method: init?.method });
      clock += elapsedPerFetch;
      const reply = replies.shift();
      if (!reply || reply instanceof Error) throw reply ?? new TypeError("Failed to fetch");
      return reply;
    },
    sleep: async (ms) => {
      slept.push(ms);
      clock += ms;
    },
    now: () => clock,
  };
  return { deps, calls, slept };
}

test("mock STT: 인식 후보를 돌려주고, 생각 중을 최소 1.5초 보여준다", async () => {
  const { deps, calls, slept } = fakeDeps([json({ transcripts: ["저굼통이 뭐야?", 3], provider: "mock" })], 200);
  const result = await createRecognizer(deps).recognize(audio);
  assert.deepEqual(result, { ok: true, transcripts: ["저굼통이 뭐야?"], provider: "mock" });
  assert.deepEqual(calls, [{ url: "/api/stt", method: "POST" }]);
  assert.deepEqual(slept, [MOCK_THINK_MS - 200]);
});

test("mock STT가 이미 1.5초 넘게 걸렸으면 더 기다리지 않는다", async () => {
  const { deps, slept } = fakeDeps([json({ transcripts: ["우싼이 뭐야?"], provider: "mock" })], 2000);
  await createRecognizer(deps).recognize(audio);
  assert.deepEqual(slept, []);
});

test("실제 STT는 기다리지 않는다", async () => {
  const { deps, slept } = fakeDeps([json({ transcripts: ["저금통이 뭐야?"], provider: "real" })]);
  const result = await createRecognizer(deps).recognize(audio);
  assert.equal(result.ok, true);
  assert.deepEqual(slept, []);
});

test("네트워크 오류는 한 번 다시 시도해서 성공하면 그대로 진행", async () => {
  const { deps, calls } = fakeDeps([new TypeError("Failed to fetch"), json({ transcripts: ["저굼통이 뭐야?"], provider: "real" })]);
  const result = await createRecognizer(deps).recognize(audio);
  assert.equal(result.ok, true);
  assert.equal(calls.length, 2);
});

test("두 번 다 네트워크 오류면 network (→ E-1), 세 번째는 시도하지 않는다", async () => {
  const { deps, calls } = fakeDeps([new TypeError("x"), new TypeError("x"), json({ transcripts: ["a"] })]);
  assert.deepEqual(await createRecognizer(deps).recognize(audio), { ok: false, reason: "network" });
  assert.equal(calls.length, 2);
});

test("서버 실패 응답·빈 결과·깨진 응답은 다시 시도하지 않고 empty (→ 2-7)", async () => {
  for (const reply of [
    json({ error: "음성인식에 실패했어요" }, 502),
    json({ transcripts: [], provider: "real" }),
    new Response("{깨진", { status: 200 }),
  ]) {
    const { deps, calls } = fakeDeps([reply]);
    assert.deepEqual(await createRecognizer(deps).recognize(audio), { ok: false, reason: "empty" });
    assert.equal(calls.length, 1);
  }
});

test("mock 빈 결과(못 알아들음)도 생각 중 1.5초를 보여준다 (2-12 → 2-7)", async () => {
  const { deps, slept } = fakeDeps([json({ transcripts: [], provider: "mock" })]);
  assert.deepEqual(await createRecognizer(deps).recognize(audio), { ok: false, reason: "empty" });
  assert.deepEqual(slept, [MOCK_THINK_MS]);
});

test("provider: GET /api/stt 이름, 실패하면 null", async () => {
  assert.equal(await createRecognizer(fakeDeps([json({ provider: "mock" })]).deps).provider(), "mock");
  assert.equal(await createRecognizer(fakeDeps([new TypeError("x")]).deps).provider(), null);
  assert.equal(await createRecognizer(fakeDeps([json({}, 500)]).deps).provider(), null);
});

test("듣는 중 자동 넘김: mock만 2.5초, 그 밖에는 최대 녹음 시간", () => {
  assert.equal(listenLimitMs("mock"), MOCK_LISTEN_MS);
  assert.equal(MOCK_LISTEN_MS, 2500);
  assert.equal(MOCK_THINK_MS, 1500);
  assert.equal(listenLimitMs("real"), MAX_RECORDING_MS);
  assert.equal(listenLimitMs(null), MAX_RECORDING_MS);
});
