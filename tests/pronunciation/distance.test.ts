import { test } from "node:test";
import assert from "node:assert/strict";
import { jamoDistance, toJamoTokens } from "../../src/lib/pronunciation/distance.ts";

test("가방↔가발 = 1 (종성 대치)", () => {
  assert.equal(jamoDistance("가방", "가발"), 1);
});

test("저그통↔저금통 = 1 (받침 생략)", () => {
  assert.equal(jamoDistance("저그통", "저금통"), 1);
  assert.equal(jamoDistance("저금통", "저그통"), 1);
});

test("같은 단어 = 0", () => {
  assert.equal(jamoDistance("공룡", "공룡"), 0);
});

test("가바↔가방 = 1, 가바↔가발 = 1", () => {
  assert.equal(jamoDistance("가바", "가방"), 1);
  assert.equal(jamoDistance("가바", "가발"), 1);
});

test("초성 ㅇ과 종성 ㅇ은 다른 토큰", () => {
  assert.deepEqual(toJamoTokens("공"), ["ㄱ", "ㅗ", "_ㅇ"]);
  assert.deepEqual(toJamoTokens("아"), ["ㅇ", "ㅏ"]);
});
