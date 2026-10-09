import { test } from "node:test";
import assert from "node:assert/strict";
import { EXAMPLE_PROMPTS, MOCK_STT_TURNS } from "../../src/data/examplePrompts.ts";
import { MOCK_WORDS } from "../../src/data/words.mock.ts";
import { extractTargets } from "../../src/lib/pronunciation/extract.ts";
import { findCandidates } from "../../src/lib/pronunciation/candidates.ts";

const candidateWords = (transcripts: string[]) =>
  findCandidates(extractTargets(transcripts), MOCK_WORDS).map((c) => c.entry.word);

test("폴백 예시 버튼: 저금통 확인 → 우산 확인 → 물어볼 단어", () => {
  assert.deepEqual(
    EXAMPLE_PROMPTS.map((prompt) => candidateWords([prompt])),
    [["저금통"], ["우산"], []],
  );
});

test("mock STT 첫 녹음: 2-4는 저금통, 2-6은 저금통·저울·조금 (피그마 순서)", () => {
  assert.deepEqual(candidateWords(MOCK_STT_TURNS[0]), ["저금통", "저울", "조금"]);
});

test("mock STT 나머지 녹음: 물어볼 단어 → 인식 실패 → 우산", () => {
  assert.deepEqual(candidateWords(MOCK_STT_TURNS[1]), []);
  assert.deepEqual(MOCK_STT_TURNS[2], []);
  assert.deepEqual(candidateWords(MOCK_STT_TURNS[3]), ["우산"]);
});
