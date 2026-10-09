import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { MOCK_WORDS } from "../../src/data/words.mock.ts";

test("피그마 시연 단어 9개, 같은 거리 후보 순서는 저금통 → 저울 → 조금", () => {
  assert.deepEqual(
    MOCK_WORDS.map((w) => w.word),
    ["저금통", "저울", "조금", "우산", "편의점", "나비", "무지개", "씨앗", "달팽이"],
  );
});

test("모두 mock 출처이고 검수 전", () => {
  for (const w of MOCK_WORDS) {
    assert.equal(w.source, "mock", w.word);
    assert.equal(w.reviewed, false, w.word);
  }
});

test("카드 설명이 있고 들은 곳 태그가 1개 이상", () => {
  for (const w of MOCK_WORDS) {
    assert.ok(w.kidExplanation.trim().length > 0, w.word);
    assert.ok(w.contextTags.length >= 1, w.word);
  }
});

test("피그마에 문구가 다 있는 저금통·저울·조금은 힌트·말풍선 설명·예문이 모두 있다", () => {
  for (const word of ["저금통", "저울", "조금"]) {
    const w = MOCK_WORDS.find((entry) => entry.word === word)!;
    assert.ok(w.hint.length > 0, `${word}.hint`);
    assert.ok(w.bubbleExplanation && w.bubbleExplanation.length > 0, `${word}.bubbleExplanation`);
    assert.ok(w.example.length > 0, `${word}.example`);
  }
});

test("그림 파일이 public/에 있다", () => {
  for (const w of MOCK_WORDS) {
    assert.match(w.image, /^\/words\/[a-z]+\.svg$/, w.word);
    assert.ok(existsSync(new URL(`../../public${w.image}`, import.meta.url)), w.image);
  }
});

test("id가 겹치지 않는다", () => {
  assert.equal(new Set(MOCK_WORDS.map((w) => w.id)).size, MOCK_WORDS.length);
});
