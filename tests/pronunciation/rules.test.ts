import { test } from "node:test";
import assert from "node:assert/strict";
import { generateVariants } from "../../src/lib/pronunciation/rules.ts";

test("두박 → 수박 (R1)", () => {
  assert.ok(generateVariants("두박").includes("수박"));
});

test("대풍 → 태풍 (R3)", () => {
  assert.ok(generateVariants("대풍").includes("태풍"));
});

test("입력 단어가 첫 칸에 있고 중복이 없다", () => {
  const variants = generateVariants("두박");
  assert.equal(variants[0], "두박");
  assert.equal(new Set(variants).size, variants.length);
});

test("대치할 초성이 없으면 입력 단어만", () => {
  assert.deepEqual(generateVariants("아이"), ["아이"]);
});

test("한글이 아니면 입력 단어만", () => {
  assert.deepEqual(generateVariants("abc"), ["abc"]);
});
