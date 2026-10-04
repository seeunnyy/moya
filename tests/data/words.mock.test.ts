import { test } from "node:test";
import assert from "node:assert/strict";
import { MOCK_WORDS } from "../../src/data/words.mock.ts";

test("05 §3의 mock 단어 10개", () => {
  assert.deepEqual(
    MOCK_WORDS.map((w) => w.word),
    ["공룡", "가방", "가발", "수박", "태풍", "저금통", "우주", "지구", "화산", "소방관"],
  );
});

test("모두 mock 출처이고 검수 전", () => {
  for (const w of MOCK_WORDS) {
    assert.equal(w.source, "mock", w.word);
    assert.equal(w.reviewed, false, w.word);
  }
});

test("필수 내용이 비어 있지 않고 상황 태그가 1개 이상", () => {
  for (const w of MOCK_WORDS) {
    for (const field of ["hint", "kidExplanation", "example", "dictDefinition"] as const) {
      assert.ok(w[field].trim().length > 0, `${w.word}.${field}`);
    }
    assert.ok(w.contextTags.length >= 1, w.word);
  }
});

test("id가 겹치지 않는다", () => {
  assert.equal(new Set(MOCK_WORDS.map((w) => w.id)).size, MOCK_WORDS.length);
});

test("영어 표기가 10개 모두 채워져 있다 (단어 카드 S5)", () => {
  for (const w of MOCK_WORDS) {
    assert.ok(w.english && w.english.trim().length > 0, w.word);
  }
});
