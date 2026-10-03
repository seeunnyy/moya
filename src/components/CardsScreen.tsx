"use client";

// /app/cards 단어 카드 목록 (S7, Figma 10). 이 기기에 저장된 단어 카드와 물어볼 단어를 보여준다 (FR-10).
// 카드는 2열 그리드(그림 자리 + 단어)이고, 누르면 상세(/app/cards/[id])로 간다.
// 학습 상태 Select·필터 칩은 반복 학습(베타)이라 만들지 않는다. 스타일은 최소.

import Link from "next/link";
import { BottomTabs } from "./BottomTabs";
import { contextOption } from "./heardContext";
import { ImageSlot } from "./ImageSlot";
import { PrivacyNotice } from "./PrivacyNotice";
import { ScreenHeading } from "./ScreenHeading";
import { useSavedWords } from "./useSavedWords";

export function CardsScreen() {
  const saved = useSavedWords();

  const isEmpty = saved !== null && saved.cards.length === 0 && saved.pending.length === 0;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-5 px-4 py-6">
      <ScreenHeading>내 단어 카드</ScreenHeading>

      {saved === null && <p role="status">단어 카드를 여는 중…</p>}

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
              <ul className="grid grid-cols-2 gap-3">
                {saved.cards.map((card) => (
                  <li key={card.id}>
                    <Link
                      href={`/app/cards/${card.id}`}
                      className="flex min-h-12 flex-col gap-2 rounded-lg border-2 border-current p-2"
                    >
                      <ImageSlot label="그림 자리" className="h-20" />
                      <span className="text-center text-lg font-bold break-keep">{card.word}</span>
                    </Link>
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

      <PrivacyNotice />
      <BottomTabs current="cards" />
    </main>
  );
}
