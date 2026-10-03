"use client";

// /app/cards 단어장 (S7). 이 기기에 저장된 단어 카드와 물어볼 단어를 보여준다 (FR-10).
// localStorage는 브라우저에만 있으므로 서버 렌더링에서는 "읽는 중"으로 두고, 브라우저에서 읽는다.
// 스타일은 최소. 색·폰트는 디자인 작업에서 입힌다.

import { useSyncExternalStore } from "react";
import type { PendingWord, WordCard } from "@/types";
import { readCards, readPending } from "@/lib/storage";
import { LinkButton } from "./Button";
import { contextOption } from "./heardContext";
import { PrivacyNotice } from "./PrivacyNotice";

type Saved = { cards: WordCard[]; pending: PendingWord[] };

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

// 서버에는 저장소가 없다. null이면 읽는 중으로 보고 빈 상태 안내를 띄우지 않는다.
const readOnServer = () => null;

export function CardsScreen() {
  const saved = useSyncExternalStore(subscribe, readSaved, readOnServer);

  const isEmpty = saved !== null && saved.cards.length === 0 && saved.pending.length === 0;

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-5 px-4 py-6">
      <h1 className="text-2xl font-bold break-keep">단어장</h1>

      {saved === null && <p role="status">단어장을 여는 중…</p>}

      {/* EmptyState */}
      {isEmpty && (
        <section aria-label="빈 단어장" className="rounded-lg border-2 border-dashed border-current p-4">
          <p className="text-lg break-keep">아직 모은 단어가 없어. 모야에게 궁금한 말을 물어봐!</p>
        </section>
      )}

      {saved !== null && !isEmpty && (
        <>
          <section aria-labelledby="cards-heading" className="flex flex-col gap-3">
            <h2 id="cards-heading" className="text-xl font-bold">
              배운 단어 {saved.cards.length}개
            </h2>
            {saved.cards.length === 0 ? (
              <p className="break-keep">아직 배운 단어가 없어.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {saved.cards.map((card) => (
                  <li key={card.id} className="rounded-lg border-2 border-current p-4">
                    <p className="text-xl font-bold break-keep">{card.word}</p>
                    <p className="mt-1 break-keep">{card.kidExplanation}</p>
                    <p className="mt-2 text-sm font-semibold">이렇게 써</p>
                    <p className="break-keep">{card.example}</p>
                    <p className="mt-2 text-sm break-keep">
                      처음 물은 말: {card.spokenAs}
                      {card.heardContext && ` · ${contextOption(card.heardContext)?.label}에서 들었어`}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="pending-heading" className="flex flex-col gap-3">
            <h2 id="pending-heading" className="text-xl font-bold">
              물어볼 단어 {saved.pending.length}개
            </h2>
            {saved.pending.length === 0 ? (
              <p className="break-keep">모야가 모르는 단어는 아직 없어.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {saved.pending.map((word) => (
                  <li key={word.id} className="rounded-lg border-2 border-dashed border-current p-3">
                    <p className="text-lg font-bold break-keep">{word.spokenAs}</p>
                    {word.heardContext && (
                      <p className="text-sm break-keep">
                        {contextOption(word.heardContext)?.label}에서 들었어
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      <LinkButton href="/app">모야에게 물어보기</LinkButton>
      <PrivacyNotice />
    </main>
  );
}
