import { test } from "node:test";
import assert from "node:assert/strict";
import { MOCK_WORDS } from "../src/data/words.mock.ts";
import {
  deleteVoiceRecords,
  findTeachableWord,
  pendingNewestFirst,
  pendingTime,
  teachWord,
  unteachedWords,
  weekSummary,
} from "../src/lib/parent.ts";
import type { PendingWord, WordCard } from "../src/types/index.ts";

const pending: PendingWord[] = [
  { id: "p1", spokenAs: "떠뽀끼", createdAt: new Date(2026, 9, 6, 17, 40).toISOString(), taughtWordId: "x" },
  { id: "p2", spokenAs: "저구멍", createdAt: new Date(2026, 9, 8, 19, 12).toISOString() },
];

test("검수 단어만 알려 줄 수 있다 (앞뒤 공백 무시, 표제어와 똑같을 때만)", () => {
  assert.equal(findTeachableWord(" 저금통 ", MOCK_WORDS)?.id, "jeogeumtong-1");
  assert.equal(findTeachableWord("떡볶이", MOCK_WORDS), null);
  assert.equal(findTeachableWord("저금", MOCK_WORDS), null);
  assert.equal(findTeachableWord("  ", MOCK_WORDS), null);
});

test("알려 주면 물어볼 단어에 표시하고 들은 말 → 단어 연결을 저장한다", () => {
  const entry = MOCK_WORDS.find((e) => e.word === "저금통")!;
  const r = teachWord(pending, { 떠뽀끼: "x" }, "p2", entry)!;
  assert.equal(r.pending.find((p) => p.id === "p2")?.taughtWordId, "jeogeumtong-1");
  assert.deepEqual(r.taught, { 떠뽀끼: "x", 저구멍: "jeogeumtong-1" });
  assert.equal(teachWord(pending, {}, "없음", entry), null);
});

test("음성 기록 삭제: 물어볼 단어와 '내가 말한 소리'만 지우고 카드는 남긴다", () => {
  const cards = [{ id: "c", spokenAs: "저굼통", word: "저금통" } as WordCard];
  const r = deleteVoiceRecords(cards);
  assert.equal(r.cards.length, 1);
  assert.equal(r.cards[0].spokenAs, "");
  assert.equal(r.cards[0].word, "저금통");
  assert.deepEqual(r.pending, []);
});

test("5-3 시각과 순서", () => {
  assert.equal(pendingTime(new Date(2026, 9, 8, 19, 12).toISOString()), "10월 8일 오후 7:12");
  assert.equal(pendingTime(new Date(2026, 9, 8, 0, 5).toISOString()), "10월 8일 오전 12:05");
  assert.equal(pendingTime("잘못"), "");
  assert.deepEqual(pendingNewestFirst(pending).map((p) => p.id), ["p2", "p1"]);
  assert.deepEqual(unteachedWords(pending).map((p) => p.id), ["p2"]);
});

test("5-2 이번 주 요약", () => {
  const now = new Date(2026, 9, 11, 14); // 일요일 → 이번 주는 10월 5일(월)부터
  const card = (d: number, status?: WordCard["status"]) => ({ createdAt: new Date(2026, 9, d, 10).toISOString(), status }) as WordCard;
  const s = weekSummary([card(4), card(5), card(10, "mastered"), card(1, "mastered")], pending, now);
  assert.deepEqual(s, { asked: 2, mastered: 2, unfound: 1 });
});
