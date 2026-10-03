import { test } from "node:test";
import assert from "node:assert/strict";
import { extractTarget, extractTargets } from "../../src/lib/pronunciation/extract.ts";

test("공룡이 뭐야? → 공룡", () => {
  assert.equal(extractTarget("공룡이 뭐야?"), "공룡");
});

test("가바가 뭐야 → 가바", () => {
  assert.equal(extractTarget("가바가 뭐야"), "가바");
});

test("조사 없는 질문과 붙여 쓴 질문", () => {
  assert.equal(extractTarget("공룡 뭐야"), "공룡");
  assert.equal(extractTarget("공룡이뭐야"), "공룡");
  assert.equal(extractTarget("뿌잉뿌잉이 뭐야?"), "뿌잉뿌잉");
  assert.equal(extractTarget("저 공룡이 뭐야"), "공룡");
});

test("질문 형태가 아니면 실패", () => {
  assert.equal(extractTarget("공룡"), null);
  assert.equal(extractTarget(""), null);
  assert.equal(extractTarget("뭐야"), null);
});

test("인식 후보 여러 개에서 각각 꺼내고 중복 제거", () => {
  assert.deepEqual(
    extractTargets(["두박이 뭐야", "수박이 뭐야", "두박이 뭐야?", "몰라"]),
    ["두박", "수박"],
  );
  assert.deepEqual(extractTargets(["공룡", ""]), []);
});
