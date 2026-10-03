"use client";

// 이 기기에 저장된 단어 카드와 물어볼 단어를 읽는다 (S7 목록, S11 상세).
// localStorage는 브라우저에만 있으므로 서버 렌더링에서는 null(읽는 중)이고, 브라우저에서 읽는다.

import { useSyncExternalStore } from "react";
import type { PendingWord, WordCard } from "@/types";
import { readCards, readPending } from "@/lib/storage";

export type Saved = { cards: WordCard[]; pending: PendingWord[] };

// 최근에 저장한 것이 위로 오게 한다.
function newestFirst<T extends { createdAt: string }>(list: T[]): T[] {
  return [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

// 다른 탭에서 저장하면 목록을 다시 읽는다.
function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

// useSyncExternalStore는 내용이 같으면 같은 객체를 받아야 다시 그리지 않는다.
let cachedKey = "";
let cachedSaved: Saved | null = null;

function readSaved(): Saved {
  // 손상된 데이터·저장소 접근 실패는 storage 모듈이 빈 목록으로 돌려준다.
  const cards = readCards();
  const pending = readPending();
  const key = JSON.stringify([cards, pending]);
  if (cachedSaved === null || key !== cachedKey) {
    cachedKey = key;
    cachedSaved = { cards: newestFirst(cards), pending: newestFirst(pending) };
  }
  return cachedSaved;
}

// 서버에는 저장소가 없다. null이면 읽는 중으로 보고 빈 상태·없는 카드 안내를 띄우지 않는다.
const readOnServer = () => null;

export function useSavedWords(): Saved | null {
  return useSyncExternalStore(subscribe, readSaved, readOnServer);
}
