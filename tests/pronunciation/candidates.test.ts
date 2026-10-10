import { test } from "node:test";
import { readdirSync, readFileSync } from "node:fs";
import assert from "node:assert/strict";
import {
  findCandidates,
  inferWord,
  orderByContext,
} from "../../src/lib/pronunciation/candidates.ts";
import type { Candidate, CandidateResult } from "../../src/types/index.ts";
import { LEGACY_WORDS as MOCK_WORDS } from "../fixtures/legacyWords.ts";
import { MOCK_WORDS as WORDS_V2 } from "../../src/data/words.mock.ts";
import { makeEntry } from "./fixtures.ts";

const words = (candidates: Candidate[]) => candidates.map((c) => c.entry.word);

function expectConfirm(result: CandidateResult, word: string, distance: number) {
  assert.equal(result.kind, "confirm");
  if (result.kind !== "confirm") return;
  assert.equal(result.candidate.entry.word, word);
  assert.equal(result.candidate.distance, distance);
}

test("두박 → 수박 거리 0, 확인 질문 (R1)", () => {
  expectConfirm(inferWord(["두박"], MOCK_WORDS), "수박", 0);
});

test("대풍 → 태풍 거리 0, 확인 질문 (R3)", () => {
  expectConfirm(inferWord(["대풍"], MOCK_WORDS), "태풍", 0);
});

test("저그통 → 저금통 거리 1, 확인 질문 (받침 생략)", () => {
  expectConfirm(inferWord(["저그통"], MOCK_WORDS), "저금통", 1);
});

test("공룡 → 공룡 거리 0, 확인 질문", () => {
  expectConfirm(inferWord(["공룡"], MOCK_WORDS), "공룡", 0);
});

test("가바 → 가방·가발 둘 다 거리 1, 고르기", () => {
  const result = inferWord(["가바"], MOCK_WORDS);
  assert.equal(result.kind, "choose");
  if (result.kind !== "choose") return;
  assert.deepEqual(words(result.candidates), ["가방", "가발"]);
  assert.deepEqual(result.candidates.map((c) => c.distance), [1, 1]);
});

test("가바 + [TV] → 가발 먼저", () => {
  const ordered = orderByContext(findCandidates(["가바"], MOCK_WORDS), "tv");
  assert.deepEqual(words(ordered), ["가발", "가방"]);
  assert.equal(ordered[0].contextMatch, true);
});

test("가바 + [유치원·학교] → 가방 먼저", () => {
  const ordered = orderByContext(findCandidates(["가바"], MOCK_WORDS), "school");
  assert.deepEqual(words(ordered), ["가방", "가발"]);
});

test("가바 + [모르겠어] → 거리 순서 그대로, 상황 기록 없음", () => {
  const candidates = findCandidates(["가바"], MOCK_WORDS);
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
  assert.deepEqual(inferWord(["뿌잉뿌잉"], MOCK_WORDS), { kind: "unknown" });
});

test("대상 단어가 없으면 후보 없음", () => {
  assert.deepEqual(inferWord([], MOCK_WORDS), { kind: "unknown" });
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
  const candidates = findCandidates(["두박", "수박"], MOCK_WORDS);
  assert.deepEqual(words(candidates), ["수박"]);
  assert.equal(candidates[0].distance, 0);
});

// 3.3 보호자가 알려 준 연결 (word-inference "보호자가 알려 준 단어가 맨 앞")
test("알려 준 단어: 저구멍 → 저금통이 첫 후보(거리 0, taught)", () => {
  const candidates = findCandidates(["저구멍"], MOCK_WORDS, { 저구멍: "jeogeumtong-1" });
  assert.equal(candidates[0].entry.word, "저금통");
  assert.equal(candidates[0].distance, 0);
  assert.equal(candidates[0].taught, true);
  assert.equal(candidates[0].spokenAs, "저구멍");
  expectConfirm(inferWord(["저구멍"], MOCK_WORDS, { 저구멍: "jeogeumtong-1" }), "저금통", 0);
});

test("알려 준 단어는 거리 0 후보·들은 곳보다도 앞이고, 한 번만 나온다", () => {
  const entries = [makeEntry("가바", ["tv"]), makeEntry("가방", ["school"]), makeEntry("공룡", ["book"])];
  const candidates = findCandidates(["가바"], entries, { 가바: "공룡-1" });
  assert.deepEqual(words(candidates), ["공룡", "가바", "가방"]);
  assert.deepEqual(words(orderByContext(candidates, "tv")), ["공룡", "가바", "가방"]);
  assert.equal(candidates.filter((c) => c.entry.word === "공룡").length, 1);
});

test("알려 준 연결이 없는 말·없는 단어 id는 무시한다", () => {
  assert.deepEqual(
    words(findCandidates(["가바"], MOCK_WORDS, { 저구멍: "gabang-1", 가바: "없는-id" })),
    words(findCandidates(["가바"], MOCK_WORDS)),
  );
});

test("후보마다 맞은 대상 단어(spokenAs)를 기록한다 — 저굼통·저욷·조굼", () => {
  const candidates = findCandidates(["저굼통", "저욷", "조굼"], WORDS_V2);
  assert.deepEqual(
    candidates.map((c) => [c.entry.word, c.spokenAs, c.distance]),
    [
      ["저금통", "저굼통", 1],
      ["저울", "저욷", 1],
      ["조금", "조굼", 1],
    ],
  );
});

test("pronunciation 모듈은 저장소·외부 API·단어 데이터 파일을 읽지 않는다 (순수 함수)", () => {
  const dir = new URL("../../src/lib/pronunciation/", import.meta.url);
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".ts"))) {
    const source = readFileSync(new URL(file, dir), "utf8");
    assert.doesNotMatch(source, /storage|services|localStorage|fetch\(|words\.mock/, file);
  }
});
