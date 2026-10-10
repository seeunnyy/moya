import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ACCOUNT_KEY,
  ALL_KEYS,
  CONSENT_KEY,
  DEFAULT_SETTINGS,
  EMPTY_MISSION,
  MISSION_KEY,
  PIN_KEY,
  PROFILE_KEY,
  SETTINGS_KEY,
  STARS_KEY,
  TAUGHT_KEY,
  TODAY_KEY,
  readAccount,
  readConsent,
  readMission,
  readPin,
  readProfile,
  readSettings,
  readStars,
  readTaught,
  readToday,
  writeAccount,
  writeConsent,
  writeMission,
  writePending,
  writePin,
  writeProfile,
  writeSettings,
  writeStars,
  writeTaught,
  writeToday,
  addCard,
  addPending,
  CARD_FIELDS,
  CARDS_KEY,
  PENDING_FIELDS,
  PENDING_KEY,
  readCards,
  readPending,
  type KeyValueStore,
} from "../src/lib/storage/index.ts";
import type { PendingWord, WordCard } from "../src/types/index.ts";

function fakeStore(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  const store: KeyValueStore = {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
  };
  return { store, data };
}

const card: WordCard = {
  id: "card-1",
  wordEntryId: "subak-1",
  word: "수박",
  dictDefinition: "여름에 열리는, 크고 둥근 열매.",
  kidExplanation: "여름에 먹는 크고 둥근 과일이야.",
  example: "더운 날 시원한 수박을 먹었어.",
  spokenAs: "두박",
  createdAt: "2026-10-03T00:00:00.000Z",
};

const pending: PendingWord = {
  id: "pending-1",
  spokenAs: "뿌잉뿌잉",
  createdAt: "2026-10-03T00:00:00.000Z",
};

test("카드 저장 → 읽기", () => {
  const { store } = fakeStore();
  assert.equal(addCard(card, store), true);
  assert.equal(addCard({ ...card, id: "card-2", heardContext: "tv" }, store), true);
  const cards = readCards(store);
  assert.equal(cards.length, 2);
  assert.deepEqual(cards[0], card);
  assert.equal(cards[1].heardContext, "tv");
});

test("물어볼 단어 저장 → 읽기", () => {
  const { store } = fakeStore();
  assert.equal(addPending(pending, store), true);
  assert.deepEqual(readPending(store), [pending]);
});

test("카드와 물어볼 단어는 버전 키에 따로 저장된다", () => {
  const { store, data } = fakeStore();
  addCard(card, store);
  addPending(pending, store);
  assert.deepEqual([...data.keys()].sort(), [CARDS_KEY, PENDING_KEY].sort());
  assert.equal(CARDS_KEY, "moya.cards.v1");
  assert.equal(PENDING_KEY, "moya.pending.v1");
});

test("저장된 것이 없으면 빈 목록", () => {
  const { store } = fakeStore();
  assert.deepEqual(readCards(store), []);
  assert.deepEqual(readPending(store), []);
});

test("손상된 JSON이나 배열이 아닌 값 → 빈 목록", () => {
  const { store } = fakeStore({ [CARDS_KEY]: "{깨진", [PENDING_KEY]: '{"a":1}' });
  assert.deepEqual(readCards(store), []);
  assert.deepEqual(readPending(store), []);
});

test("손상된 데이터 위에 저장하면 새 목록으로 시작", () => {
  const { store } = fakeStore({ [CARDS_KEY]: "{깨진" });
  assert.equal(addCard(card, store), true);
  assert.deepEqual(readCards(store), [card]);
});

test("쓰기 예외 → 오류 없이 false", () => {
  const store: KeyValueStore = {
    getItem: () => null,
    setItem: () => {
      throw new Error("QuotaExceededError");
    },
  };
  assert.doesNotThrow(() => addCard(card, store));
  assert.equal(addCard(card, store), false);
  assert.equal(addPending(pending, store), false);
});

test("읽기 예외 → 빈 목록", () => {
  const store: KeyValueStore = {
    getItem: () => {
      throw new Error("SecurityError");
    },
    setItem: () => {},
  };
  assert.deepEqual(readCards(store), []);
});

test("저장소를 쓸 수 없으면(서버·차단) 빈 목록과 false", () => {
  assert.deepEqual(readCards(null), []);
  assert.equal(addCard(card, null), false);
  assert.deepEqual(readCards(), []); // Node에는 localStorage가 없다
});

// 4.2 음성 데이터 미저장 (NFR-04)
const AUDIO_LIKE = /audio|voice|sound|record|blob|wav|webm|mp3|buffer/i;

test("저장 필드에 음성 데이터 필드가 없다", () => {
  for (const field of [...CARD_FIELDS, ...PENDING_FIELDS]) {
    assert.doesNotMatch(field, AUDIO_LIKE, field);
  }
});

test("음성 데이터가 섞인 객체를 넘겨도 저장되지 않는다", () => {
  const { store, data } = fakeStore();
  const withAudio = { ...card, audio: new Uint8Array([1, 2, 3]), audioUrl: "blob:x" };
  addCard(withAudio as WordCard, store);
  addPending({ ...pending, recording: "base64..." } as PendingWord, store);

  const saved = [...data.values()].map((raw) => JSON.parse(raw));
  for (const item of saved.flat()) {
    for (const [key, value] of Object.entries(item)) {
      assert.doesNotMatch(key, AUDIO_LIKE, key);
      assert.ok(["string", "number"].includes(typeof value), key);
    }
  }
  assert.deepEqual(readCards(store), [card]);
});

// ---- 3.4 새 키·호환 ----

test("옛 카드(status 없음, 들은 곳 adult)도 그대로 읽고, 옛 들은 곳만 버린다", () => {
  const legacy = { ...card, heardContext: "adult" };
  const { store } = fakeStore({ [CARDS_KEY]: JSON.stringify([legacy]), [PENDING_KEY]: JSON.stringify([pending]) });
  const [read] = readCards(store);
  assert.equal(read.word, "수박");
  assert.equal(read.heardContext, undefined);
  assert.equal(read.status, undefined); // 화면에서는 new로 본다
  assert.deepEqual(readPending(store), [pending]);
});

test("카드에 상태·물어볼 단어에 알려 준 단어를 더해 저장해도 기존 항목이 남는다", () => {
  const { store } = fakeStore({ [CARDS_KEY]: JSON.stringify([card]), [PENDING_KEY]: JSON.stringify([pending]) });
  addCard({ ...card, id: "card-2", status: "reviewing" }, store);
  assert.deepEqual(readCards(store).map((c) => [c.id, c.status]), [["card-1", undefined], ["card-2", "reviewing"]]);
  writePending([{ ...pending, taughtWordId: "jeogeumtong-1" }], store);
  assert.equal(readPending(store)[0].taughtWordId, "jeogeumtong-1");
});

test("목록에서 깨진 항목만 버린다", () => {
  const { store } = fakeStore({ [CARDS_KEY]: JSON.stringify([card, null, { id: 3 }, "x"]) });
  assert.deepEqual(readCards(store), [card]);
});

test("새 키: 저장 → 읽기", () => {
  const { store, data } = fakeStore();
  const at = "2026-10-11T01:00:00.000Z";
  assert.equal(writeAccount({ method: "email", email: "a@b.c", loggedIn: true, createdAt: at }, store), true);
  writeProfile({ nickname: "지우", age: 7, createdAt: at }, store);
  writeConsent({ required: true, optional: false, updatedAt: at }, store);
  assert.equal(writePin("1234", store), true);
  writeSettings({ weeklyReport: false }, store);
  writeStars([{ reason: "card", amount: 1, at, word: "저금통" }], store);
  writeMission({ date: "2026-10-11", collectedCount: 2, completed: false, stampDates: ["2026-10-10"] }, store);
  writeToday({ date: "2026-10-11", wordEntryId: "dalpaengi-1", opened: true, added: false }, store);
  writeTaught({ 저구멍: "jeogeumtong-1" }, store);

  assert.deepEqual(readAccount(store), { method: "email", email: "a@b.c", loggedIn: true, createdAt: at });
  assert.deepEqual(readProfile(store), { nickname: "지우", age: 7, createdAt: at });
  assert.deepEqual(readConsent(store), { required: true, optional: false, updatedAt: at });
  assert.equal(readPin(store), "1234");
  assert.deepEqual(readSettings(store), { weeklyReport: false });
  assert.deepEqual(readStars(store), [{ reason: "card", amount: 1, at, word: "저금통" }]);
  assert.deepEqual(readMission(store), { date: "2026-10-11", collectedCount: 2, completed: false, stampDates: ["2026-10-10"] });
  assert.deepEqual(readToday(store), { date: "2026-10-11", wordEntryId: "dalpaengi-1", opened: true, added: false });
  assert.deepEqual(readTaught(store), { 저구멍: "jeogeumtong-1" });

  assert.deepEqual(
    [...data.keys()].sort(),
    [ACCOUNT_KEY, PROFILE_KEY, CONSENT_KEY, PIN_KEY, SETTINGS_KEY, STARS_KEY, MISSION_KEY, TODAY_KEY, TAUGHT_KEY].sort(),
  );
  for (const key of data.keys()) assert.match(key, /^moya\.[a-z]+\.v1$/);
  assert.deepEqual([...ALL_KEYS].sort(), [...data.keys(), CARDS_KEY, PENDING_KEY].sort());
});

test("계정에는 비밀번호를 저장하지 않는다", () => {
  const { store, data } = fakeStore();
  writeAccount({ method: "email", email: "a@b.c", loggedIn: true, createdAt: "", password: "secret" } as never, store);
  assert.doesNotMatch(data.get(ACCOUNT_KEY) ?? "", /secret|password/);
});

test("새 키: 없으면 기본값", () => {
  const { store } = fakeStore();
  assert.equal(readAccount(store), null);
  assert.equal(readProfile(store), null);
  assert.equal(readConsent(store), null);
  assert.equal(readPin(store), null);
  assert.deepEqual(readSettings(store), DEFAULT_SETTINGS);
  assert.deepEqual(readStars(store), []);
  assert.deepEqual(readMission(store), EMPTY_MISSION);
  assert.equal(readToday(store), null);
  assert.deepEqual(readTaught(store), {});
});

test("새 키: 손상된 값 → 기본값", () => {
  const broken = "{깨진";
  const { store } = fakeStore({
    [ACCOUNT_KEY]: '{"method":"naver","loggedIn":true}',
    [PROFILE_KEY]: '{"nickname":"지우","age":11}',
    [CONSENT_KEY]: broken,
    [PIN_KEY]: '"12a4"',
    [SETTINGS_KEY]: "[]",
    [STARS_KEY]: '[{"reason":"card","amount":"many","at":"x"},{"reason":"card","amount":1,"at":"t"}]',
    [MISSION_KEY]: "42",
    [TODAY_KEY]: broken,
    [TAUGHT_KEY]: '{"저구멍":5,"우싼":"usan-1"}',
  });
  assert.equal(readAccount(store), null);
  assert.equal(readProfile(store), null);
  assert.equal(readConsent(store), null);
  assert.equal(readPin(store), null);
  assert.deepEqual(readSettings(store), DEFAULT_SETTINGS);
  assert.deepEqual(readStars(store), [{ reason: "card", amount: 1, at: "t" }]);
  assert.deepEqual(readMission(store), EMPTY_MISSION);
  assert.equal(readToday(store), null);
  assert.deepEqual(readTaught(store), { 우싼: "usan-1" });
});

test("새 키: 쓰기 실패·저장소 없음 → 오류 없이 false / 기본값", () => {
  const store: KeyValueStore = {
    getItem: () => {
      throw new Error("SecurityError");
    },
    setItem: () => {
      throw new Error("QuotaExceededError");
    },
  };
  assert.equal(writeMission(EMPTY_MISSION, store), false);
  assert.equal(writeStars([], store), false);
  assert.equal(writePin("1234", store), false);
  assert.deepEqual(readMission(store), EMPTY_MISSION);
  assert.equal(writeAccount({ method: "kakao", loggedIn: true, createdAt: "" }, null), false);
  assert.equal(readAccount(null), null);
  assert.equal(writePin("12", fakeStore().store), false); // 4자리가 아니면 저장하지 않음
});
