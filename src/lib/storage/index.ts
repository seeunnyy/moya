// 단어 카드와 물어볼 단어를 이 기기(브라우저 localStorage)에 저장한다 (04 §5).
// 읽기·쓰기 실패는 화면을 깨뜨리지 않는다: 읽기 실패 → 빈 목록, 쓰기 실패 → false.
// 음성 원본은 저장하지 않는다. 정해진 필드만 골라 저장한다 (NFR-04).

import type { PendingWord, WordCard } from "../../types/index.ts";

export const CARDS_KEY = "moya.cards.v1";
export const PENDING_KEY = "moya.pending.v1";

// 테스트에서 가짜 저장소를 넣을 수 있게 필요한 메서드만 받는다.
export type KeyValueStore = Pick<Storage, "getItem" | "setItem">;

// 저장하는 필드 목록. 타입의 필드와 하나라도 다르면 아래 타입 검사가 실패한다.
export const CARD_FIELDS = [
  "id",
  "wordEntryId",
  "word",
  "dictDefinition",
  "kidExplanation",
  "example",
  "heardContext",
  "spokenAs",
  "createdAt",
  "nextReviewAt",
  "reviewStep",
] as const satisfies readonly (keyof WordCard)[];

export const PENDING_FIELDS = [
  "id",
  "spokenAs",
  "heardContext",
  "createdAt",
] as const satisfies readonly (keyof PendingWord)[];

type Missing<T, F extends readonly unknown[]> = Exclude<keyof T, F[number]>;
const cardFieldsComplete: Missing<WordCard, typeof CARD_FIELDS> extends never
  ? true
  : false = true;
const pendingFieldsComplete: Missing<PendingWord, typeof PENDING_FIELDS> extends never
  ? true
  : false = true;
void cardFieldsComplete;
void pendingFieldsComplete;

// 브라우저가 아니거나(서버 렌더링) 저장소 접근이 막혀 있으면 null
function browserStore(): KeyValueStore | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

function pick<T extends object>(item: T, fields: readonly (keyof T)[]): T {
  const picked: Partial<T> = {};
  for (const field of fields) {
    if (item[field] !== undefined) picked[field] = item[field];
  }
  return picked as T;
}

function readList<T>(key: string, store: KeyValueStore | null): T[] {
  if (!store) return [];
  try {
    const raw = store.getItem(key);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function appendItem<T>(key: string, item: T, store: KeyValueStore | null): boolean {
  if (!store) return false;
  try {
    const list = readList<T>(key, store);
    store.setItem(key, JSON.stringify([...list, item]));
    return true;
  } catch {
    return false;
  }
}

export function readCards(store: KeyValueStore | null = browserStore()): WordCard[] {
  return readList<WordCard>(CARDS_KEY, store);
}

// 저장에 성공하면 true. 실패해도 예외를 던지지 않는다.
export function addCard(
  card: WordCard,
  store: KeyValueStore | null = browserStore(),
): boolean {
  return appendItem(CARDS_KEY, pick(card, CARD_FIELDS), store);
}

export function readPending(
  store: KeyValueStore | null = browserStore(),
): PendingWord[] {
  return readList<PendingWord>(PENDING_KEY, store);
}

export function addPending(
  word: PendingWord,
  store: KeyValueStore | null = browserStore(),
): boolean {
  return appendItem(PENDING_KEY, pick(word, PENDING_FIELDS), store);
}
