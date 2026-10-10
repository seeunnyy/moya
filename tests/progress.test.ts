import { test } from "node:test";
import assert from "node:assert/strict";
import {
  addTodayWordCard,
  collectAskedCard,
  daysWithMoya,
  localDateKey,
  missionForToday,
  missionStars,
  pickTodayWord,
  starHistory,
  starTotal,
  streakDays,
  weekStamps,
  type Progress,
} from "../src/lib/progress.ts";
import { EMPTY_MISSION } from "../src/lib/storage/index.ts";
import { MOCK_WORDS } from "../src/data/words.mock.ts";

// 로컬 시각으로 만든다 (날짜 경계는 기기의 로컬 날짜)
const at = (d: number, h = 10, m = 0) => new Date(2026, 9, d, h, m); // 2026-10-d (10월)
const word = (w: string) => MOCK_WORDS.find((e) => e.word === w)!;
const empty: Progress = { cards: [], stars: [], mission: EMPTY_MISSION };

function collect(p: Progress, w: string, now: Date, spokenAs = w) {
  return collectAskedCard(p, { entry: word(w), spokenAs, now, id: `id-${w}` });
}

test("로컬 날짜 키: 자정 직전과 직후는 다른 날", () => {
  assert.equal(localDateKey(at(11, 23, 59)), "2026-10-11");
  assert.equal(localDateKey(at(12, 0, 0)), "2026-10-12");
});

test("새 카드: 별 +1, 미션 +1, 카드 저장 값", () => {
  const r = collect(empty, "저금통", at(11), "저굼통");
  assert.equal(r.isNew, true);
  assert.equal(r.missionCompleted, false);
  assert.equal(r.cards.length, 1);
  assert.equal(r.card.spokenAs, "저굼통");
  assert.equal(r.card.status, "new");
  assert.equal(starTotal(r.stars), 1);
  assert.deepEqual(r.stars[0], { reason: "card", amount: 1, at: at(11).toISOString(), word: "저금통" });
  assert.equal(missionStars(r.mission, at(11)), 1);
});

test("이미 있는 단어: 카드·별·미션 그대로, 있던 카드를 돌려줌 (T10)", () => {
  const first = collect(empty, "저금통", at(11));
  const again = collect(first, "저금통", at(11, 11));
  assert.equal(again.isNew, false);
  assert.equal(again.card, first.card);
  assert.equal(again.cards.length, 1);
  assert.equal(starTotal(again.stars), 1);
  assert.equal(again.mission.collectedCount, 1);
});

test("세 번째 새 카드에서 미션 성공: 별 +1 +3, 오늘 로켓 도장 (daily-mission '세 번째 카드')", () => {
  let p: Progress = collect(collect(empty, "저금통", at(11)), "저울", at(11, 11));
  p = { ...p, stars: [...p.stars, { reason: "card", amount: 23, at: at(1).toISOString() }] }; // 별 25개로 맞춤
  assert.equal(starTotal(p.stars), 25);
  const third = collect(p, "우산", at(11, 12));
  assert.equal(third.missionCompleted, true);
  assert.equal(starTotal(third.stars), 29);
  assert.deepEqual(third.mission.stampDates, ["2026-10-11"]);
  assert.equal(missionStars(third.mission, at(11, 12)), 3);
});

test("네 번째 새 카드: 미션 성공은 하루 한 번, 별 1개만", () => {
  let p = empty;
  for (const w of ["저금통", "저울", "조금"]) p = collect(p, w, at(11));
  const fourth = collect(p, "우산", at(11, 15));
  assert.equal(fourth.missionCompleted, false);
  assert.equal(starTotal(fourth.stars) - starTotal(p.stars), 1);
  assert.equal(missionStars(fourth.mission, at(11, 15)), 3);
  assert.deepEqual(fourth.mission.stampDates, ["2026-10-11"]);
});

test("자정이 지나면 미션은 0부터 (도장 기록은 남음)", () => {
  let p = empty;
  for (const w of ["저금통", "저울"]) p = collect(p, w, at(11, 23, 58));
  assert.equal(missionStars(p.mission, at(11, 23, 59)), 2);
  assert.equal(missionStars(p.mission, at(12, 0, 0)), 0); // daily-mission "다음 날"
  const next = collect(p, "조금", at(12, 0, 1));
  assert.equal(next.mission.date, "2026-10-12");
  assert.equal(next.mission.collectedCount, 1);
  assert.equal(next.missionCompleted, false);

  const done = { ...EMPTY_MISSION, date: "2026-10-11", collectedCount: 3, completed: true, stampDates: ["2026-10-11"] };
  assert.deepEqual(missionForToday(done, at(12)), { date: "2026-10-12", collectedCount: 0, completed: false, stampDates: ["2026-10-11"] });
});

test("오늘의 단어 카드: 별 +1, 미션에는 세지 않음, 이미 있으면 그대로", () => {
  const r = addTodayWordCard({ cards: [], stars: [] }, { entry: word("달팽이"), now: at(11), id: "t1" });
  assert.equal(r.isNew, true);
  assert.equal(r.card.spokenAs, "");
  assert.deepEqual(r.stars, [{ reason: "today", amount: 1, at: at(11).toISOString(), word: "달팽이" }]);
  assert.equal("mission" in r, false);
  const again = addTodayWordCard(r, { entry: word("달팽이"), now: at(11, 12), id: "t2" });
  assert.equal(again.isNew, false);
  assert.equal(again.cards.length, 1);
  assert.equal(starTotal(again.stars), 1);
});

test("연속 학습: 오늘까지 / 어제까지 이어지면 셈, 하루 끊기면 0", () => {
  const stamps = ["2026-10-08", "2026-10-09", "2026-10-10"];
  assert.equal(streakDays(stamps, at(10)), 3); // 오늘 포함
  assert.equal(streakDays(stamps, at(11)), 3); // 어제까지 (오늘 아직 안 함)
  assert.equal(streakDays([...stamps, "2026-10-11"], at(11)), 4);
  assert.equal(streakDays(stamps, at(12)), 0); // 어제(11일) 끊김
  assert.equal(streakDays(["2026-10-05", "2026-10-07", "2026-10-08"], at(8)), 2); // 6일에 끊김
  assert.equal(streakDays([], at(11)), 0);
  // 달이 바뀌는 경계
  assert.equal(streakDays(["2026-09-30", "2026-10-01"], new Date(2026, 9, 1, 9)), 2);
});

test("이번 주 도장: 월~일, 오늘 표시 (일요일은 그 주의 마지막 날)", () => {
  const week = weekStamps(["2026-10-05", "2026-10-11", "2026-10-12"], at(11)); // 10/11 일요일
  assert.deepEqual(week.map((d) => d.date), [
    "2026-10-05",
    "2026-10-06",
    "2026-10-07",
    "2026-10-08",
    "2026-10-09",
    "2026-10-10",
    "2026-10-11",
  ]);
  assert.deepEqual(week.map((d) => d.stamped), [true, false, false, false, false, false, true]);
  assert.equal(week.findIndex((d) => d.isToday), 6);
  assert.equal(weekStamps([], at(12))[0].date, "2026-10-12"); // 월요일이면 새 주
});

test("모야랑 ○일째: 만든 날이 1일째, 자정이 지나면 하루 늘어남", () => {
  const created = at(5, 23, 0).toISOString();
  assert.equal(daysWithMoya(created, at(5, 23, 30)), 1);
  assert.equal(daysWithMoya(created, at(6, 0, 1)), 2);
  assert.equal(daysWithMoya(created, at(11)), 7);
  assert.equal(daysWithMoya("깨진 값", at(11)), 1);
});

test("별 받은 기록은 최근 것부터", () => {
  const records = [
    { reason: "card" as const, amount: 1, at: at(9).toISOString() },
    { reason: "mission" as const, amount: 3, at: at(11).toISOString() },
    { reason: "today" as const, amount: 1, at: at(10).toISOString() },
  ];
  assert.deepEqual(starHistory(records).map((r) => r.reason), ["mission", "today", "card"]);
});

test("오늘의 단어: 같은 날 같은 단어, 지구 사전에 있는 단어는 고르지 않음, 없으면 null", () => {
  const first = pickTodayWord(MOCK_WORDS, [], null, at(11, 8));
  assert.ok(first);
  assert.deepEqual(first, { date: "2026-10-11", wordEntryId: first.wordEntryId, opened: false, added: false });
  // 같은 날 다시 고르면 같은 단어 (저장된 값이 없어도 날짜로 정해짐)
  assert.equal(pickTodayWord(MOCK_WORDS, [], null, at(11, 22))?.wordEntryId, first.wordEntryId);
  // 저장된 오늘 값은 넣은 뒤에도 그대로 (3-3a)
  const saved = { ...first, opened: true, added: true };
  assert.equal(pickTodayWord(MOCK_WORDS, [], saved, at(11, 23)), saved);
  // 다음 날에는 새로 고르고, 이미 모은 단어는 빠진다
  const owned = MOCK_WORDS.slice(0, MOCK_WORDS.length - 1).map((e) => ({
    id: e.id,
    wordEntryId: e.id,
    word: e.word,
    dictDefinition: "",
    kidExplanation: "",
    example: "",
    spokenAs: "",
    createdAt: "",
  }));
  const last = MOCK_WORDS[MOCK_WORDS.length - 1];
  assert.equal(pickTodayWord(MOCK_WORDS, owned, saved, at(12))?.wordEntryId, last.id);
  // 모두 모았으면 선물 버튼을 숨기도록 null
  const all = [...owned, { ...owned[0], id: last.id, wordEntryId: last.id }];
  assert.equal(pickTodayWord(MOCK_WORDS, all, null, at(12)), null);
});

test("오늘의 단어: 날짜에 따라 다른 단어가 나올 수 있다 (고정된 하나가 아님)", () => {
  const picks = new Set(
    Array.from({ length: 14 }, (_, i) => pickTodayWord(MOCK_WORDS, [], null, new Date(2026, 9, 1 + i))?.wordEntryId),
  );
  assert.ok(picks.size > 1);
});
