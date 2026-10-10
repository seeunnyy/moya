// 별·미션·로켓 도장·오늘의 단어 계산 (design.md "별·미션·로켓 계산", "오늘의 단어 고르기").
// 모두 순수 함수다: 지금 시각(now)과 저장된 값을 받아 다음 값을 돌려주고, 저장은 부르는 쪽이 한다.
// 날짜는 기기의 로컬 날짜(YYYY-MM-DD)로 센다. 자정이 지나면 다른 날이다.

import type { HeardContext, WordCard, WordEntry } from "../types/index.ts";
import type { Mission, StarRecord, TodayWord } from "./storage/index.ts";

export const MISSION_GOAL = 3; // 오늘의 미션: 모르는 말 3개 물어보기
export const STARS_PER_CARD = 1;
export const STARS_PER_TODAY_WORD = 1;
export const STARS_PER_MISSION = 3;

// ---- 날짜 ----

const pad = (n: number) => String(n).padStart(2, "0");

export function localDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// "YYYY-MM-DD"를 그날 로컬 정오로 (서머타임 경계에서도 하루 차이가 흔들리지 않게)
function fromKey(key: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12) : null;
}

function addDays(key: string, days: number): string {
  const d = fromKey(key);
  if (!d) return key;
  d.setDate(d.getDate() + days);
  return localDateKey(d);
}

// a에서 b까지 며칠 (같은 날 0)
export function daysBetween(a: string, b: string): number {
  const da = fromKey(a);
  const db = fromKey(b);
  if (!da || !db) return 0;
  return Math.round((db.getTime() - da.getTime()) / 86_400_000);
}

// ---- 별 ----

export function starTotal(records: StarRecord[]): number {
  return records.reduce((sum, r) => sum + r.amount, 0);
}

// 별 받은 기록, 최근 것부터 (3-5)
export function starHistory(records: StarRecord[]): StarRecord[] {
  return [...records].sort((a, b) => b.at.localeCompare(a.at));
}

// ---- 미션 ----

// 저장된 미션이 오늘 것이 아니면 0으로 본다 (도장 목록은 그대로).
export function missionForToday(mission: Mission, now: Date): Mission {
  const today = localDateKey(now);
  return mission.date === today ? mission : { ...mission, date: today, collectedCount: 0, completed: false };
}

// 헤더 미션 별 칸 = min(오늘 모은 카드 수, 3)
export function missionStars(mission: Mission, now: Date): number {
  return Math.min(missionForToday(mission, now).collectedCount, MISSION_GOAL);
}

// ---- 로켓 도장 ----

// 연속 학습 = 오늘(또는 어제)까지 끊기지 않고 이어진 도장 일수
export function streakDays(stampDates: string[], now: Date): number {
  const stamps = new Set(stampDates);
  const today = localDateKey(now);
  let day = stamps.has(today) ? today : addDays(today, -1);
  let count = 0;
  while (stamps.has(day)) {
    count += 1;
    day = addDays(day, -1);
  }
  return count;
}

// 이번 주(월~일) 도장. 7칸, 월요일부터
export function weekStamps(stampDates: string[], now: Date): { date: string; stamped: boolean; isToday: boolean }[] {
  const stamps = new Set(stampDates);
  const today = localDateKey(now);
  const sinceMonday = (now.getDay() + 6) % 7; // 일요일 0 → 6
  const monday = addDays(today, -sinceMonday);
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(monday, i);
    return { date, stamped: stamps.has(date), isToday: date === today };
  });
}

// "모야랑 ○일째": 프로필 만든 날이 1일째
export function daysWithMoya(profileCreatedAt: string, now: Date): number {
  const created = new Date(profileCreatedAt);
  if (Number.isNaN(created.getTime())) return 1;
  return Math.max(1, daysBetween(localDateKey(created), localDateKey(now)) + 1);
}

// ---- 카드 모으기 ----

export type Progress = { cards: WordCard[]; stars: StarRecord[]; mission: Mission };

export type CollectResult = Progress & {
  card: WordCard; // 새로 만든 카드 또는 이미 있던 카드
  isNew: boolean;
  missionCompleted: boolean; // 이 카드로 오늘 미션을 성공 (하루 한 번)
};

function makeCard(entry: WordEntry, spokenAs: string, now: Date, id: string, heardContext?: HeardContext): WordCard {
  return {
    id,
    wordEntryId: entry.id,
    word: entry.word,
    dictDefinition: entry.dictDefinition,
    kidExplanation: entry.kidExplanation,
    example: entry.example,
    ...(heardContext ? { heardContext } : {}),
    spokenAs,
    createdAt: now.toISOString(),
    status: "new",
  };
}

// 2-9 [알았어!] → 2-10. 이미 있는 단어면 아무것도 늘지 않는다 (T10).
// 새 카드면 별 +1, 미션 +1, 미션이 3이 되는 순간 하루 한 번 별 +3과 오늘 로켓 도장.
export function collectAskedCard(
  progress: Progress,
  input: { entry: WordEntry; spokenAs: string; heardContext?: HeardContext; now: Date; id: string },
): CollectResult {
  const { entry, spokenAs, heardContext, now, id } = input;
  const existing = progress.cards.find((c) => c.wordEntryId === entry.id);
  const mission = missionForToday(progress.mission, now);
  if (existing) return { ...progress, mission, card: existing, isNew: false, missionCompleted: false };

  const at = now.toISOString();
  const card = makeCard(entry, spokenAs, now, id, heardContext);
  const stars: StarRecord[] = [...progress.stars, { reason: "card", amount: STARS_PER_CARD, at, word: entry.word }];
  const collectedCount = mission.collectedCount + 1;
  const missionCompleted = !mission.completed && collectedCount >= MISSION_GOAL;
  const today = localDateKey(now);
  if (missionCompleted) stars.push({ reason: "mission", amount: STARS_PER_MISSION, at });

  return {
    cards: [...progress.cards, card],
    stars,
    mission: {
      ...mission,
      collectedCount,
      completed: mission.completed || missionCompleted,
      stampDates:
        missionCompleted && !mission.stampDates.includes(today) ? [...mission.stampDates, today] : mission.stampDates,
    },
    card,
    isNew: true,
    missionCompleted,
  };
}

// 3-3 [지구 사전에 넣기]: 카드와 별 +1. 미션에는 세지 않는다.
export function addTodayWordCard(
  progress: Pick<Progress, "cards" | "stars">,
  input: { entry: WordEntry; now: Date; id: string },
): Pick<Progress, "cards" | "stars"> & { card: WordCard; isNew: boolean } {
  const existing = progress.cards.find((c) => c.wordEntryId === input.entry.id);
  if (existing) return { ...progress, card: existing, isNew: false };
  const card = makeCard(input.entry, "", input.now, input.id);
  return {
    cards: [...progress.cards, card],
    stars: [
      ...progress.stars,
      { reason: "today", amount: STARS_PER_TODAY_WORD, at: input.now.toISOString(), word: input.entry.word },
    ],
    card,
    isNew: true,
  };
}

// ---- 오늘의 단어 ----

// 날짜 문자열로 정해지는 간단한 해시 (외부 데이터·랜덤 시드 없음)
function hashKey(key: string): number {
  let h = 0;
  for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

// 오늘 이미 정했으면 그대로(넣은 뒤에도 3-3a를 보여줘야 하므로), 아니면 지구 사전에 없는 단어 중 하나.
// 고를 단어가 없으면 null (2-1 선물 버튼을 숨김).
export function pickTodayWord(
  entries: WordEntry[],
  cards: WordCard[],
  saved: TodayWord | null,
  now: Date,
): TodayWord | null {
  const date = localDateKey(now);
  if (saved && saved.date === date && entries.some((e) => e.id === saved.wordEntryId)) return saved;
  const owned = new Set(cards.map((c) => c.wordEntryId));
  const pool = entries.filter((e) => !owned.has(e.id));
  if (pool.length === 0) return null;
  return { date, wordEntryId: pool[hashKey(date) % pool.length].id, opened: false, added: false };
}
