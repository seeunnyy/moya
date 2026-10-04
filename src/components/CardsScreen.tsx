"use client";

// /app/cards 단어 카드 목록 (S7, Figma 1270:376). 이 기기에 저장된 단어 카드와 물어볼 단어를 보여준다 (FR-10).
// "학습 상태" Select와 칩은 같은 필터 값을 쓴다. 반복 학습이 베타라 모든 카드는 "새 단어"다.
// 카드를 누르면 상세(/app/cards/[id])로 간다.

import Link from "next/link";
import { useState } from "react";
import { BottomTabs } from "./BottomTabs";
import { Header } from "./Header";
import { ImageSlot } from "./ImageSlot";
import { ScreenHeading } from "./ScreenHeading";
import { boxClass } from "./styles";
import { useSavedWords } from "./useSavedWords";

const FILTERS = [
  { value: "all", label: "전체" },
  { value: "new", label: "새 단어" },
  { value: "reviewing", label: "복습 중" },
  { value: "done", label: "완료" },
] as const;

type Filter = (typeof FILTERS)[number]["value"];

// 카드의 학습 상태. 반복 학습(베타) 전에는 모두 "새 단어".
const CARD_STATUS = "new" satisfies Filter;
const STATUS_LABEL = "새 단어";

const gridClass = "grid auto-rows-[184px] grid-cols-2 gap-x-3 gap-y-4";
const cardClass = `${boxClass} flex min-w-0 flex-col items-start gap-3 overflow-hidden`;

export function CardsScreen() {
  const saved = useSavedWords();
  const [filter, setFilter] = useState<Filter>("all");

  const isEmpty = saved !== null && saved.cards.length === 0 && saved.pending.length === 0;
  const cards = saved?.cards.filter(() => filter === "all" || filter === CARD_STATUS) ?? [];

  return (
    <>
      <Header title="단어 카드 목록 화면" />
      <main className="flex flex-col gap-4 p-6">
        <ScreenHeading>내 단어 카드</ScreenHeading>

        {/* Figma Input(select) 1270:27 */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="card-filter" className="text-button">
            학습 상태
          </label>
          <div className="relative">
            <select
              id="card-filter"
              value={filter}
              onChange={(event) => setFilter(event.target.value as Filter)}
              className="h-[38px] w-full min-w-[140px] appearance-none rounded-select border border-line bg-white px-3 text-button"
            >
              {FILTERS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
            {/* eslint-disable-next-line @next/next/no-img-element -- Figma 화살표 12px 아이콘 */}
            <img
              src="/chevron.svg"
              alt=""
              width={12}
              height={12}
              className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2"
            />
          </div>
        </div>

        {/* 칩: 기본 1270:13 / 선택 1270:15 */}
        <div role="group" aria-label="학습 상태 필터" className="flex flex-wrap items-start gap-x-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              aria-pressed={filter === f.value}
              onClick={() => setFilter(f.value)}
              className="touch-target min-w-10 rounded-full border border-edge bg-chip px-3 py-1.5 text-button font-medium aria-pressed:border-0 aria-pressed:bg-ink aria-pressed:text-white"
            >
              {f.label}
            </button>
          ))}
        </div>

        {saved === null && (
          <p role="status" className="text-caption">
            단어 카드를 여는 중…
          </p>
        )}

        {/* 빈 상태 (Figma 프레임 없음 → 카드 박스) */}
        {isEmpty && (
          <div className={boxClass}>
            <p className="text-caption">아직 모은 단어가 없어. 모야에게 궁금한 말을 물어봐!</p>
          </div>
        )}

        {cards.length > 0 && (
          <ul aria-label="단어 카드" className={gridClass}>
            {cards.map((card) => (
              <li key={card.id} className="flex min-w-0">
                <Link href={`/app/cards/${card.id}`} className={`${cardClass} flex-1`}>
                  <ImageSlot className="h-[100px] w-full" />
                  <span className="w-full text-body font-semibold">{card.word}</span>
                  <span className="w-full text-caption">{STATUS_LABEL}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {saved !== null && saved.pending.length > 0 && (
          <section aria-labelledby="pending-heading" className="flex flex-col gap-4">
            <h2 id="pending-heading" className="text-title font-bold">
              물어볼 단어
            </h2>
            <ul className={gridClass}>
              {saved.pending.map((word) => (
                <li key={word.id} className={cardClass}>
                  <ImageSlot className="h-[100px] w-full" />
                  <p className="w-full text-body font-semibold">{word.spokenAs}</p>
                  <p className="w-full text-caption">엄마, 아빠와 함께 알아보기</p>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
      <BottomTabs current="cards" />
    </>
  );
}
