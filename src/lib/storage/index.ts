// 이 기기(브라우저 localStorage)에 저장한다 (design.md "기기 저장 키", 04 §5).
// 키마다 버전을 붙이고, 읽기 실패·손상된 값 → 기본값, 쓰기 실패 → false (예외를 던지지 않음).
// 음성 원본은 저장하지 않는다. 카드·물어볼 단어는 정해진 필드만 골라 저장한다 (NFR-04).
// 기존 키 moya.cards.v1·moya.pending.v1은 그대로 읽는다(새 필드는 모두 선택).

import {
  HEARD_CONTEXTS,
  type CardStatus,
  type PendingWord,
  type WordCard,
} from "../../types/index.ts";

export const CARDS_KEY = "moya.cards.v1";
export const PENDING_KEY = "moya.pending.v1";
export const ACCOUNT_KEY = "moya.account.v1";
export const PROFILE_KEY = "moya.profile.v1";
export const CONSENT_KEY = "moya.consent.v1";
export const PIN_KEY = "moya.pin.v1";
export const SETTINGS_KEY = "moya.settings.v1";
export const STARS_KEY = "moya.stars.v1";
export const MISSION_KEY = "moya.mission.v1";
export const TODAY_KEY = "moya.today.v1";
export const TAUGHT_KEY = "moya.taught.v1";

// 이 앱이 쓰는 모든 키 (개발용 시드의 "처음 상태로"가 지운다)
export const ALL_KEYS = [
  CARDS_KEY,
  PENDING_KEY,
  ACCOUNT_KEY,
  PROFILE_KEY,
  CONSENT_KEY,
  PIN_KEY,
  SETTINGS_KEY,
  STARS_KEY,
  MISSION_KEY,
  TODAY_KEY,
  TAUGHT_KEY,
] as const;

// 테스트에서 가짜 저장소를 넣을 수 있게 필요한 메서드만 받는다.
export type KeyValueStore = Pick<Storage, "getItem" | "setItem">;

// ---- 저장 값 타입 ----

// 가짜 가입 (결정 1). 계정 비밀번호는 저장하지 않는다.
export type Account = {
  method: "email" | "kakao";
  email?: string;
  loggedIn: boolean;
  createdAt: string;
};

export type ChildAge = 5 | 6 | 7 | 8;
export type Profile = { nickname: string; age: ChildAge; createdAt: string };

export type Consent = { required: boolean; optional: boolean; updatedAt: string };

export type Settings = { weeklyReport: boolean };
export const DEFAULT_SETTINGS: Settings = { weeklyReport: true };

// 별 받은 기록. 합계는 계산한다. word는 기록 문구("저금통 카드 모았어")에 쓴다.
export type StarReason = "card" | "today" | "mission";
export type StarRecord = { reason: StarReason; amount: number; at: string; word?: string };

// 오늘의 미션. date는 로컬 날짜(YYYY-MM-DD). 날짜가 바뀌면 progress.ts가 0으로 본다.
// stampDates: 로켓 도장을 받은 날짜 목록 (날짜가 바뀌어도 남는다)
export type Mission = { date: string; collectedCount: number; completed: boolean; stampDates: string[] };
export const EMPTY_MISSION: Mission = { date: "", collectedCount: 0, completed: false, stampDates: [] };

// 오늘의 단어. 그날 값으로 고정한다.
export type TodayWord = { date: string; wordEntryId: string; opened: boolean; added: boolean };

// 보호자가 알려 준 연결: 아이가 한 말 → 단어 데이터 id
export type TaughtLinks = Record<string, string>;

// ---- 카드·물어볼 단어의 저장 필드 ----

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
  "status",
  "nextReviewAt",
  "reviewStep",
] as const satisfies readonly (keyof WordCard)[];

export const PENDING_FIELDS = [
  "id",
  "spokenAs",
  "heardContext",
  "createdAt",
  "taughtWordId",
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

// ---- 공통 읽기·쓰기 ----

// 같은 탭에서 저장해도 화면이 다시 읽도록 알린다 (다른 탭은 브라우저의 storage 이벤트).
export const STORAGE_EVENT = "moya-storage";

// 브라우저가 아니거나(서버 렌더링) 저장소 접근이 막혀 있으면 null
export function browserStore(): KeyValueStore | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

function notifyChange() {
  try {
    globalThis.dispatchEvent?.(new Event(STORAGE_EVENT));
  } catch {
    // 알림 실패는 무시한다 (Node 테스트 등)
  }
}

function pick<T extends object>(item: T, fields: readonly (keyof T)[]): T {
  const picked: Partial<T> = {};
  for (const field of fields) {
    if (item[field] !== undefined) picked[field] = item[field];
  }
  return picked as T;
}

// 값을 읽어 검사한다. 없거나 손상됐거나 검사에 실패하면 기본값.
function readValue<T>(key: string, store: KeyValueStore | null, parse: (raw: unknown) => T | null, fallback: T): T {
  if (!store) return fallback;
  try {
    const raw = store.getItem(key);
    if (raw === null) return fallback;
    return parse(JSON.parse(raw)) ?? fallback;
  } catch {
    return fallback;
  }
}

function writeValue(key: string, value: unknown, store: KeyValueStore | null): boolean {
  if (!store) return false;
  try {
    store.setItem(key, JSON.stringify(value));
    notifyChange();
    return true;
  } catch {
    return false;
  }
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const isString = (v: unknown): v is string => typeof v === "string";
const isBool = (v: unknown): v is boolean => typeof v === "boolean";

// 목록: 배열이 아니면 기본값, 항목 중 깨진 것만 버린다.
function listOf<T>(parseItem: (item: unknown) => T | null) {
  return (raw: unknown): T[] | null =>
    Array.isArray(raw) ? raw.map(parseItem).filter((x): x is T => x !== null) : null;
}

// ---- 카드 ----

const CARD_STATUSES: readonly CardStatus[] = ["new", "reviewing", "mastered"];

function parseCard(raw: unknown): WordCard | null {
  if (!isRecord(raw) || !isString(raw.id) || !isString(raw.wordEntryId) || !isString(raw.word)) return null;
  const card = { ...raw } as WordCard & Record<string, unknown>;
  // 옛 들은 곳 값("adult" 등)은 버린다 (design.md "들은 곳 값 바꾸기")
  if (!HEARD_CONTEXTS.includes(card.heardContext as never)) delete card.heardContext;
  if (!CARD_STATUSES.includes(card.status as never)) delete card.status;
  for (const field of ["dictDefinition", "kidExplanation", "example", "spokenAs", "createdAt"] as const) {
    if (!isString(card[field])) card[field] = "";
  }
  return pick(card as WordCard, CARD_FIELDS);
}

export function readCards(store: KeyValueStore | null = browserStore()): WordCard[] {
  return readValue(CARDS_KEY, store, listOf(parseCard), []);
}

export function writeCards(cards: WordCard[], store: KeyValueStore | null = browserStore()): boolean {
  return writeValue(CARDS_KEY, cards.map((c) => pick(c, CARD_FIELDS)), store);
}

// 저장에 성공하면 true. 실패해도 예외를 던지지 않는다.
export function addCard(card: WordCard, store: KeyValueStore | null = browserStore()): boolean {
  return writeCards([...readCards(store), card], store);
}

// ---- 물어볼 단어 ----

function parsePending(raw: unknown): PendingWord | null {
  if (!isRecord(raw) || !isString(raw.id) || !isString(raw.spokenAs)) return null;
  const word = { ...raw } as PendingWord & Record<string, unknown>;
  if (!HEARD_CONTEXTS.includes(word.heardContext as never)) delete word.heardContext;
  if (!isString(word.taughtWordId)) delete word.taughtWordId;
  if (!isString(word.createdAt)) word.createdAt = "";
  return pick(word as PendingWord, PENDING_FIELDS);
}

export function readPending(store: KeyValueStore | null = browserStore()): PendingWord[] {
  return readValue(PENDING_KEY, store, listOf(parsePending), []);
}

export function writePending(list: PendingWord[], store: KeyValueStore | null = browserStore()): boolean {
  return writeValue(PENDING_KEY, list.map((w) => pick(w, PENDING_FIELDS)), store);
}

export function addPending(word: PendingWord, store: KeyValueStore | null = browserStore()): boolean {
  return writePending([...readPending(store), word], store);
}

// ---- 계정·프로필·동의·비밀번호·설정 ----

function parseAccount(raw: unknown): Account | null {
  if (!isRecord(raw) || (raw.method !== "email" && raw.method !== "kakao") || !isBool(raw.loggedIn)) return null;
  return {
    method: raw.method,
    ...(isString(raw.email) ? { email: raw.email } : {}),
    loggedIn: raw.loggedIn,
    createdAt: isString(raw.createdAt) ? raw.createdAt : "",
  };
}

export const readAccount = (store = browserStore()) => readValue<Account | null>(ACCOUNT_KEY, store, parseAccount, null);
export const writeAccount = (v: Account, store = browserStore()) =>
  writeValue(ACCOUNT_KEY, { method: v.method, email: v.email, loggedIn: v.loggedIn, createdAt: v.createdAt }, store);

function parseProfile(raw: unknown): Profile | null {
  if (!isRecord(raw) || !isString(raw.nickname) || ![5, 6, 7, 8].includes(raw.age as number)) return null;
  return { nickname: raw.nickname, age: raw.age as ChildAge, createdAt: isString(raw.createdAt) ? raw.createdAt : "" };
}

export const readProfile = (store = browserStore()) => readValue<Profile | null>(PROFILE_KEY, store, parseProfile, null);
export const writeProfile = (v: Profile, store = browserStore()) => writeValue(PROFILE_KEY, v, store);

function parseConsent(raw: unknown): Consent | null {
  if (!isRecord(raw) || !isBool(raw.required) || !isBool(raw.optional)) return null;
  return { required: raw.required, optional: raw.optional, updatedAt: isString(raw.updatedAt) ? raw.updatedAt : "" };
}

export const readConsent = (store = browserStore()) => readValue<Consent | null>(CONSENT_KEY, store, parseConsent, null);
export const writeConsent = (v: Consent, store = browserStore()) => writeValue(CONSENT_KEY, v, store);

// 보호자 4자리 (기기 잠금, 보안 수단 아님 — 평문)
const parsePin = (raw: unknown) => (isString(raw) && /^\d{4}$/.test(raw) ? raw : null);
export const readPin = (store = browserStore()) => readValue<string | null>(PIN_KEY, store, parsePin, null);
export const writePin = (pin: string, store = browserStore()) => (parsePin(pin) ? writeValue(PIN_KEY, pin, store) : false);

const parseSettings = (raw: unknown): Settings | null =>
  isRecord(raw) && isBool(raw.weeklyReport) ? { weeklyReport: raw.weeklyReport } : null;
export const readSettings = (store = browserStore()) => readValue(SETTINGS_KEY, store, parseSettings, DEFAULT_SETTINGS);
export const writeSettings = (v: Settings, store = browserStore()) => writeValue(SETTINGS_KEY, v, store);

// ---- 별·미션·오늘의 단어·알려 준 연결 ----

function parseStar(raw: unknown): StarRecord | null {
  if (!isRecord(raw) || !["card", "today", "mission"].includes(raw.reason as string)) return null;
  if (typeof raw.amount !== "number" || !Number.isFinite(raw.amount) || !isString(raw.at)) return null;
  return {
    reason: raw.reason as StarReason,
    amount: raw.amount,
    at: raw.at,
    ...(isString(raw.word) ? { word: raw.word } : {}),
  };
}

export const readStars = (store = browserStore()) => readValue(STARS_KEY, store, listOf(parseStar), []);
export const writeStars = (v: StarRecord[], store = browserStore()) => writeValue(STARS_KEY, v, store);

function parseMission(raw: unknown): Mission | null {
  if (!isRecord(raw) || !isString(raw.date)) return null;
  const count = typeof raw.collectedCount === "number" && raw.collectedCount >= 0 ? Math.floor(raw.collectedCount) : 0;
  return {
    date: raw.date,
    collectedCount: count,
    completed: raw.completed === true,
    stampDates: Array.isArray(raw.stampDates) ? raw.stampDates.filter(isString) : [],
  };
}

export const readMission = (store = browserStore()) => readValue(MISSION_KEY, store, parseMission, EMPTY_MISSION);
export const writeMission = (v: Mission, store = browserStore()) => writeValue(MISSION_KEY, v, store);

function parseToday(raw: unknown): TodayWord | null {
  if (!isRecord(raw) || !isString(raw.date) || !isString(raw.wordEntryId)) return null;
  return { date: raw.date, wordEntryId: raw.wordEntryId, opened: raw.opened === true, added: raw.added === true };
}

export const readToday = (store = browserStore()) => readValue<TodayWord | null>(TODAY_KEY, store, parseToday, null);
export const writeToday = (v: TodayWord, store = browserStore()) => writeValue(TODAY_KEY, v, store);

function parseTaught(raw: unknown): TaughtLinks | null {
  if (!isRecord(raw)) return null;
  const links: TaughtLinks = {};
  for (const [spoken, id] of Object.entries(raw)) if (isString(id)) links[spoken] = id;
  return links;
}

export const readTaught = (store = browserStore()) => readValue(TAUGHT_KEY, store, parseTaught, {});
export const writeTaught = (v: TaughtLinks, store = browserStore()) => writeValue(TAUGHT_KEY, v, store);
