"use client";

// 3-1 지구 사전 (180:7745): 제목 + 모은 카드 수, 복습 배너(베타, 보이기만), 카드 타일 3열(최근 것부터) → 3-2.
// 카드가 없으면 배너 대신 모야 + 말풍선 + [모야한테 물어볼래] (피그마에 없음, PM 확인 2026-10-11).

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MOCK_WORDS } from "@/data/words.mock";
import { cardStars, cardStatus, cardsNewestFirst, cardTint } from "@/lib/cardView";
import { speaker } from "@/lib/services/speech";
import { readCards } from "@/lib/storage";
import { KidTop, LISTEN_PARAM } from "./KidTop";
import { useStored } from "./useStored";
import { SpeechBubble } from "./ui/SpeechBubble";
import { TabBar } from "./ui/TabBar";
import { Button } from "./ui/buttons";
import { WordTile } from "./ui/cards";
import { MoyaImage } from "./ui/Moya";
import { ReviewBanner } from "./ui/notices";

const EMPTY_LINE = "아직 모은 카드가 없어!\n모르는 말을 물어보면\n카드가 생겨!";

export function DictionaryScreen() {
  const router = useRouter();
  const cards = useStored(readCards);
  const [playing, setPlaying] = useState(false);
  const speakEmpty = () => {
    if (speaker.speak(EMPTY_LINE, () => setPlaying(false))) setPlaying(true);
  };

  return (
    <>
      <KidTop />
      <main className="flex flex-1 flex-col items-center gap-3.5 px-5 py-3.5">
        <div className="flex w-full items-center justify-between px-1 whitespace-nowrap">
          <h1 className="type-moya-title-l text-text-strong">지구 사전</h1>
          {cards && <p className="type-caption text-text-normal">모은 카드 {cards.length}장</p>}
        </div>
        {cards && cards.length === 0 && (
          <div className="flex w-full flex-1 flex-col items-center justify-center gap-3 px-1">
            <MoyaImage expression="explain" background="cream" size={150} />
            <SpeechBubble text={EMPTY_LINE} tail="up" onSpeak={speakEmpty} playing={playing} className="w-full" />
            <Button icon="/icons/mic-white.svg" className="mt-1" onClick={() => router.push(`/app?${LISTEN_PARAM}=1`)}>
              모야한테 물어볼래
            </Button>
          </div>
        )}
        {cards && cards.length > 0 && (
          <>
            <ReviewBanner text="모야가 다시 물어볼 단어가 있어!" />
            <ul className="flex w-full flex-wrap content-start gap-x-2.5 gap-y-3">
              {cardsNewestFirst(cards).map((card) => {
                const status = cardStatus(card);
                const image = MOCK_WORDS.find((e) => e.id === card.wordEntryId)?.image ?? "/words/ask-word.svg";
                return (
                  // 402px에서 114(피그마), 좁은 화면에서는 3열을 지키며 줄어든다
                  <li key={card.id} className="w-[calc((100%-20px)/3)] max-w-[114px]">
                    <WordTile
                      word={card.word}
                      image={image}
                      stars={cardStars(card)}
                      isNew={status === "new"}
                      mastered={status === "mastered"}
                      tint={cardTint(card.wordEntryId)}
                      onClick={() => router.push(`/app/dictionary/${card.id}`)}
                      className="w-full"
                    />
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </main>
      <TabBar selected="words" />
    </>
  );
}
