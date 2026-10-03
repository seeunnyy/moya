import { test } from "node:test";
import assert from "node:assert/strict";
import {
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
