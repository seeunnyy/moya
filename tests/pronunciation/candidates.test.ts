import { test } from "node:test";
import assert from "node:assert/strict";
import {
  findCandidates,
  inferWord,
  orderByContext,
} from "../../src/lib/pronunciation/candidates.ts";
import type { Candidate, CandidateResult } from "../../src/types/index.ts";
import { MOCK_ENTRIES, makeEntry } from "./fixtures.ts";

const words = (candidates: Candidate[]) => candidates.map((c) => c.entry.word);

function expectConfirm(result: CandidateResult, word: string, distance: number) {
  assert.equal(result.kind, "confirm");
  if (result.kind !== "confirm") return;
  assert.equal(result.candidate.entry.word, word);
  assert.equal(result.candidate.distance, distance);
}

test("두박 → 수박 거리 0, 확인 질문 (R1)", () => {
  expectConfirm(inferWord(["두박"], MOCK_ENTRIES), "수박", 0);
});

test("대풍 → 태풍 거리 0, 확인 질문 (R3)", () => {
  expectConfirm(inferWord(["대풍"], MOCK_ENTRIES), "태풍", 0);
});

test("저그통 → 저금통 거리 1, 확인 질문 (받침 생략)", () => {
  expectConfirm(inferWord(["저그통"], MOCK_ENTRIES), "저금통", 1);
});

test("공룡 → 공룡 거리 0, 확인 질문", () => {
  expectConfirm(inferWord(["공룡"], MOCK_ENTRIES), "공룡", 0);
});

test("가바 → 가방·가발 둘 다 거리 1, 고르기", () => {
  const result = inferWord(["가바"], MOCK_ENTRIES);
  assert.equal(result.kind, "choose");
  if (result.kind !== "choose") return;
  assert.deepEqual(words(result.candidates), ["가방", "가발"]);
  assert.deepEqual(result.candidates.map((c) => c.distance), [1, 1]);
});

test("가바 + [TV] → 가발 먼저", () => {
  const ordered = orderByContext(findCandidates(["가바"], MOCK_ENTRIES), "tv");
  assert.deepEqual(words(ordered), ["가발", "가방"]);
  assert.equal(ordered[0].contextMatch, true);
});

test("가바 + [유치원·학교] → 가방 먼저", () => {
  const ordered = orderByContext(findCandidates(["가바"], MOCK_ENTRIES), "school");
  assert.deepEqual(words(ordered), ["가방", "가발"]);
});

test("가바 + [모르겠어] → 거리 순서 그대로, 상황 기록 없음", () => {
  const candidates = findCandidates(["가바"], MOCK_ENTRIES);
  const ordered = orderByContext(candidates, undefined);
  assert.deepEqual(words(ordered), ["가방", "가발"]);
  assert.ok(ordered.every((c) => c.contextMatch === undefined));
});

test("상황이 맞아도 발음상 더 먼 단어는 앞서지 않는다", () => {
  const entries = [makeEntry("가방", ["school"]), makeEntry("가바지", ["tv"])];
  const ordered = orderByContext(findCandidates(["가바"], entries), "tv");
  assert.deepEqual(words(ordered), ["가방", "가바지"]);
  assert.deepEqual(ordered.map((c) => c.distance), [1, 2]);
});

test("뿌잉뿌잉 → 후보 없음", () => {
  assert.deepEqual(inferWord(["뿌잉뿌잉"], MOCK_ENTRIES), { kind: "unknown" });
});

test("대상 단어가 없으면 후보 없음", () => {
  assert.deepEqual(inferWord([], MOCK_ENTRIES), { kind: "unknown" });
});

test("거리 기준 이하 4개 이상이면 가까운 3개만", () => {
  const entries = [
    makeEntry("가바지", ["tv"]), // 거리 2
    makeEntry("가방", ["school"]), // 1
    makeEntry("가바", ["book"]), // 0
    makeEntry("가발", ["tv"]), // 1
  ];
  const candidates = findCandidates(["가바"], entries);
  assert.deepEqual(words(candidates), ["가바", "가방", "가발"]);
});

test("두박 + 수박 합치기 → 수박은 한 번, 거리 0", () => {
  const candidates = findCandidates(["두박", "수박"], MOCK_ENTRIES);
  assert.deepEqual(words(candidates), ["수박"]);
  assert.equal(candidates[0].distance, 0);
});
