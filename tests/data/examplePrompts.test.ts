import { test } from "node:test";
import assert from "node:assert/strict";
import { EXAMPLE_PROMPTS } from "../../src/data/examplePrompts.ts";
import { MOCK_WORDS } from "../../src/data/words.mock.ts";
import { extractTargets } from "../../src/lib/pronunciation/extract.ts";
import { inferWord } from "../../src/lib/pronunciation/candidates.ts";

// 05 §5 데모 시나리오 2~4단계가 mock 데이터로 의도한 분기에 가는지
test("예시 질문이 데모 시나리오 분기로 간다", () => {
  const kinds = EXAMPLE_PROMPTS.map(
    (prompt) => inferWord(extractTargets([prompt]), MOCK_WORDS).kind,
  );
  assert.deepEqual(kinds, ["confirm", "choose", "unknown"]);
});
