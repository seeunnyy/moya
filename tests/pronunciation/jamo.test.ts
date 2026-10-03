import { test } from "node:test";
import assert from "node:assert/strict";
import {
  composeSyllable,
  composeWord,
  decomposeSyllable,
  decomposeWord,
} from "../../src/lib/pronunciation/jamo.ts";

test("공룡 분해", () => {
  assert.deepEqual(decomposeWord("공룡"), [
    { cho: "ㄱ", jung: "ㅗ", jong: "ㅇ" },
    { cho: "ㄹ", jung: "ㅛ", jong: "ㅇ" },
  ]);
});

test("저금통 분해", () => {
  assert.deepEqual(decomposeWord("저금통"), [
    { cho: "ㅈ", jung: "ㅓ", jong: "" },
    { cho: "ㄱ", jung: "ㅡ", jong: "ㅁ" },
    { cho: "ㅌ", jung: "ㅗ", jong: "ㅇ" },
  ]);
});

test("받침 없는 음절 분해", () => {
  assert.deepEqual(decomposeSyllable("가"), { cho: "ㄱ", jung: "ㅏ", jong: "" });
  assert.deepEqual(decomposeSyllable("뿌"), { cho: "ㅃ", jung: "ㅜ", jong: "" });
});

test("한글 음절이 아니면 null", () => {
  assert.equal(decomposeSyllable("a"), null);
  assert.equal(decomposeSyllable("ㄱ"), null);
  assert.equal(decomposeWord("공룡?"), null);
});

test("분해 후 조합하면 원래 단어", () => {
  for (const word of ["공룡", "저금통", "가방", "뿌잉뿌잉", "힣"]) {
    assert.equal(composeWord(decomposeWord(word)!), word);
  }
  assert.equal(composeSyllable({ cho: "ㅅ", jung: "ㅜ", jong: "" }), "수");
  assert.equal(composeSyllable({ cho: "ㄳ", jung: "ㅜ", jong: "" }), null);
});
