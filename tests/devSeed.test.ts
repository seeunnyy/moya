import { test } from "node:test";
import assert from "node:assert/strict";
import { applySeed, SEED_PIN, SEED_PRESETS, type SeedStore } from "../src/lib/devSeed.ts";
import { missionStars, starTotal, streakDays } from "../src/lib/progress.ts";
import {
  CARDS_KEY,
  readAccount,
  readCards,
  readMission,
  readPin,
  readProfile,
  readStars,
} from "../src/lib/storage/index.ts";

function fakeStore(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  const store: SeedStore = {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
    removeItem: (key) => void data.delete(key),
  };
  return { store, data };
}

const now = new Date(2026, 9, 11, 14); // 2026-10-11 일요일 오후

test("처음 상태로: moya 키만 모두 지운다", () => {
  const { store, data } = fakeStore({ [CARDS_KEY]: "[]", "other.app": "keep" });
  applySeed("signedUp", store, now);
  applySeed("reset", store, now);
  assert.deepEqual([...data.keys()], ["other.app"]);
});

test("가입 끝난 상태: 로그인된 계정·프로필·비밀번호, 카드·별 0", () => {
  const { store } = fakeStore();
  applySeed("signedUp", store, now);
  assert.equal(readAccount(store)?.loggedIn, true);
  assert.equal(readProfile(store)?.nickname, "지우");
  assert.equal(readPin(store), SEED_PIN);
  assert.deepEqual(readCards(store), []);
  assert.equal(starTotal(readStars(store)), 0);
});

test("카드 3장: 오늘 미션 성공, 별 6, 오늘 도장", () => {
  const { store } = fakeStore();
  applySeed("cards3", store, now);
  assert.deepEqual(readCards(store).map((c) => [c.word, c.spokenAs]), [
    ["저금통", "저굼통"],
    ["저울", "저욷"],
    ["조금", "조굼"],
  ]);
  assert.equal(starTotal(readStars(store)), 6);
  assert.equal(missionStars(readMission(store), now), 3);
  assert.equal(streakDays(readMission(store).stampDates, now), 1);
});

test("미션 직전: 오늘 2장, 시연 단어(저금통·우산)는 아직 없음", () => {
  const { store } = fakeStore();
  applySeed("beforeMission", store, now);
  const words = readCards(store).map((c) => c.word);
  assert.deepEqual(words, ["편의점", "나비"]);
  assert.equal(missionStars(readMission(store), now), 2);
});

test("피그마 상태: 지구 사전 6장(상태 셋), 별 24, 연속 3일, 오늘 미션 0", () => {
  const { store } = fakeStore();
  applySeed("figma", store, now);
  const cards = readCards(store);
  assert.equal(cards.length, 6);
  assert.deepEqual(new Set(cards.map((c) => c.status)), new Set(["new", "reviewing", "mastered"]));
  assert.equal(starTotal(readStars(store)), 24);
  assert.equal(streakDays(readMission(store).stampDates, now), 3);
  assert.equal(missionStars(readMission(store), now), 0);
});

test("다른 상태 위에 넣어도 섞이지 않는다", () => {
  const { store } = fakeStore();
  applySeed("figma", store, now);
  applySeed("cards3", store, now);
  assert.equal(readCards(store).length, 3);
});

test("모든 시드 버튼에 이름·설명·이동할 주소가 있다", () => {
  for (const p of SEED_PRESETS) {
    assert.ok(p.label && p.description && p.goTo.startsWith("/"), p.key);
  }
});
