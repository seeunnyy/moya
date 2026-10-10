import { test } from "node:test";
import assert from "node:assert/strict";
import { createMockSttAdapter } from "../../src/lib/services/stt/mock.ts";
import { selectSttAdapter, sttProviderName } from "../../src/lib/services/stt/index.ts";
import { MOCK_STT_TURNS } from "../../src/data/examplePrompts.ts";

const audio = new Blob(["fake audio"], { type: "audio/webm" });

test("mock STT는 인식 후보 묶음을 차례로 돌려주고, 끝나면 처음으로 돌아간다", async () => {
  const stt = createMockSttAdapter([["저굼통이 뭐야?", "저욷이 뭐야?"], [], ["우싼이 뭐야?"]]);
  const got = [];
  for (let i = 0; i < 4; i++) got.push((await stt.transcribe(audio)).transcripts);
  assert.deepEqual(got, [["저굼통이 뭐야?", "저욷이 뭐야?"], [], ["우싼이 뭐야?"], ["저굼통이 뭐야?", "저욷이 뭐야?"]]);
});

test("묶음이 없으면 빈 인식 결과 (다시 말해줄래로 간다)", async () => {
  assert.deepEqual(await createMockSttAdapter([]).transcribe(audio), { transcripts: [] });
});

test("돌려준 배열을 바꿔도 다음 차례에 영향이 없다", async () => {
  const stt = createMockSttAdapter([["저굼통이 뭐야?"]]);
  (await stt.transcribe(audio)).transcripts.push("바뀜");
  assert.deepEqual((await stt.transcribe(audio)).transcripts, ["저굼통이 뭐야?"]);
});

test("STT_PROVIDER가 없거나 mock이면 mock, 같은 서버에서는 순서가 이어진다", async () => {
  const a = selectSttAdapter({});
  const b = selectSttAdapter({ STT_PROVIDER: "mock", STT_API_KEY: "secret" });
  assert.equal(a.name, "mock");
  assert.equal(a, b);
  assert.deepEqual((await a.transcribe(audio)).transcripts, MOCK_STT_TURNS[0]);
  assert.deepEqual((await b.transcribe(audio)).transcripts, MOCK_STT_TURNS[1]);
});

test("아직 없는 STT 서비스를 고르면 오류 (라우트가 실패 응답 → 다시 말해줄래)", () => {
  assert.throws(() => selectSttAdapter({ STT_PROVIDER: "something" }));
});

test("STT 이름 (GET /api/stt): 없으면 mock, 키는 돌려주지 않는다", () => {
  assert.equal(sttProviderName({}), "mock");
  assert.equal(sttProviderName({ STT_PROVIDER: "real", STT_API_KEY: "secret" }), "real");
});
