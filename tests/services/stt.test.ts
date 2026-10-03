import { test } from "node:test";
import assert from "node:assert/strict";
import { createMockSttAdapter } from "../../src/lib/services/stt/mock.ts";
import { selectSttAdapter } from "../../src/lib/services/stt/index.ts";
import { EXAMPLE_PROMPTS } from "../../src/data/examplePrompts.ts";

const audio = new Blob(["fake audio"], { type: "audio/webm" });

test("mock STT는 예시 문장을 차례로 돌려주고, 끝나면 처음으로 돌아간다", async () => {
  const stt = createMockSttAdapter(["두박이 뭐야?", "가바가 뭐야?", "뿌잉뿌잉이 뭐야?"]);
  const got = [];
  for (let i = 0; i < 4; i++) got.push((await stt.transcribe(audio)).transcripts);
  assert.deepEqual(got, [["두박이 뭐야?"], ["가바가 뭐야?"], ["뿌잉뿌잉이 뭐야?"], ["두박이 뭐야?"]]);
});

test("문장이 없으면 빈 인식 결과 (E2로 간다)", async () => {
  assert.deepEqual(await createMockSttAdapter([]).transcribe(audio), { transcripts: [] });
});

test("STT_PROVIDER가 없거나 mock이면 mock, 같은 서버에서는 순서가 이어진다", async () => {
  const a = selectSttAdapter({});
  const b = selectSttAdapter({ STT_PROVIDER: "mock", STT_API_KEY: "secret" });
  assert.equal(a.name, "mock");
  assert.equal(a, b);
  assert.deepEqual((await a.transcribe(audio)).transcripts, [EXAMPLE_PROMPTS[0]]);
  assert.deepEqual((await b.transcribe(audio)).transcripts, [EXAMPLE_PROMPTS[1]]);
});

test("아직 없는 STT 서비스를 고르면 오류 (라우트가 실패 응답 → E2)", () => {
  assert.throws(() => selectSttAdapter({ STT_PROVIDER: "something" }));
});
