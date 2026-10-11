// 보호자 메뉴(5-2·5-3·5-4) 계산. 저장값만 받아 새 값을 돌려주는 순수 함수 (저장은 화면에서).

import type { CardStatus, PendingWord, WordCard, WordEntry } from "../types/index.ts";
import { localDateKey } from "./progress.ts";
import type { TaughtLinks } from "./storage/index.ts";

// 5-3 입력이 검수된 단어(src/data)인지: 앞뒤 공백을 빼고 표제어와 똑같을 때만
export function findTeachableWord(input: string, entries: WordEntry[]): WordEntry | null {
  const word = input.trim();
  if (!word) return null;
  return entries.find((e) => e.word === word) ?? null;
}

// 5-3 [모야에게 알려주기]: 그 물어볼 단어에 알려 준 단어를 적고, 아이가 같은 말로 물으면 그 단어가 첫 후보가 되도록 연결을 저장한다
export function teachWord(
  pending: PendingWord[],
  taught: TaughtLinks,
  pendingId: string,
  entry: WordEntry,
): { pending: PendingWord[]; taught: TaughtLinks } | null {
  const target = pending.find((p) => p.id === pendingId);
  if (!target) return null;
  return {
    pending: pending.map((p) => (p.id === pendingId ? { ...p, taughtWordId: entry.id } : p)),
    taught: { ...taught, [target.spokenAs.trim()]: entry.id },
  };
}

// 5-7 [지우기]: 아이가 말한 기록(물어볼 단어 목록, 카드의 '내가 말한 소리')을 지운다. 카드와 보호자가 알려 준 연결은 남긴다 (T5)
export function deleteVoiceRecords(cards: WordCard[]): { cards: WordCard[]; pending: PendingWord[] } {
  return { cards: cards.map((c) => ({ ...c, spokenAs: "" })), pending: [] };
}

// 5-3 시각: "10월 8일 오후 7:12"
export function pendingTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const h = d.getHours();
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${d.getMonth() + 1}월 ${d.getDate()}일 ${h < 12 ? "오전" : "오후"} ${hour12}:${String(d.getMinutes()).padStart(2, "0")}`;
}

// 5-3 목록 순서: 최근에 물은 말부터
export function pendingNewestFirst(pending: PendingWord[]): PendingWord[] {
  return [...pending].sort((a, b) => (b.createdAt > a.createdAt ? 1 : b.createdAt < a.createdAt ? -1 : 0));
}

// 5-2 못 찾은 말 = 아직 알려 주지 않은 물어볼 단어
export function unteachedWords(pending: PendingWord[]): PendingWord[] {
  return pendingNewestFirst(pending).filter((p) => !p.taughtWordId);
}

// 5-2 이번 주(월~일) 요약 (베타 카드라 보이기만): 이번 주에 모은 카드 · 다 앎 카드 · 못 찾은 말
export function weekSummary(
  cards: WordCard[],
  pending: PendingWord[],
  now: Date,
): { asked: number; mastered: number; unfound: number } {
  const sinceMonday = (now.getDay() + 6) % 7;
  const monday = localDateKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - sinceMonday));
  const inWeek = (iso: string) => {
    const d = new Date(iso);
    return !Number.isNaN(d.getTime()) && localDateKey(d) >= monday;
  };
  const mastered: CardStatus = "mastered";
  return {
    asked: cards.filter((c) => inWeek(c.createdAt)).length,
    mastered: cards.filter((c) => c.status === mastered).length,
    unfound: unteachedWords(pending).length,
  };
}
