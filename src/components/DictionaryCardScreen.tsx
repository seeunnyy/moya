"use client";

// 3-2 카드 상세 (180:7501, 3-2a~3-2e는 같은 화면에 카드 상태·단어만 다름).
// 아래: 새 카드 → [복습은 며칠 뒤에 열려요](비활성), 복습 중 → 베타 안내 + [모야한테 설명해 볼래](보이기만, T2),
// 다 앎 → [✓ 다 앎 도장 받았어!](비활성). 없는 카드면 3-1로 (T15).

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MOCK_WORDS } from "@/data/words.mock";
import { cardReviewText, cardStars, cardStatus, cardStatusLabel, cardTint } from "@/lib/cardView";
import { monthDay } from "@/lib/progress";
import { speaker } from "@/lib/services/speech";
import { readCards } from "@/lib/storage";
import { KidTop } from "./KidTop";
import { useStored } from "./useStored";
import { TabBar } from "./ui/TabBar";
import { BetaBadge, Button, CircleButton } from "./ui/buttons";
import { WordCardDetailed } from "./ui/cards";

function cardDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : monthDay(d);
}

export function DictionaryCardScreen({ cardId }: { cardId: string }) {
  const router = useRouter();
  const cards = useStored(readCards);
  const card = cards?.find((c) => c.id === cardId);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (cards && !card) router.replace("/app/dictionary");
  }, [cards, card, router]);

  const back = () => (window.history.length > 1 ? router.back() : router.push("/app/dictionary"));

  if (!card) {
    return (
      <>
        <KidTop />
        <main className="flex-1" />
        <TabBar selected="words" />
      </>
    );
  }

  const status = cardStatus(card);
  const image = MOCK_WORDS.find((e) => e.id === card.wordEntryId)?.image ?? "/words/ask-word.svg";

  return (
    <>
      <KidTop />
      <main className="flex flex-1 flex-col items-center gap-3 px-6 py-3.5">
        <div className="flex w-full items-center gap-2.5">
          <CircleButton size={44} icon="/icons/back.svg" label="이전 화면" onClick={back} />
          <h1 className="type-moya-title-m whitespace-nowrap text-text-strong">지구 사전</h1>
        </div>
        <WordCardDetailed
          word={card.word}
          image={image}
          status={cardStatusLabel(card)}
          date={cardDate(card.createdAt)}
          tint={cardTint(card.wordEntryId)}
          spoken={card.spokenAs}
          onSpeakSpoken={() => {
            if (speaker.speak(card.spokenAs, () => setPlaying(false))) setPlaying(true);
          }}
          playingSpoken={playing}
          explanation={card.kidExplanation}
          example={card.example}
          stars={cardStars(card)}
          reviewText={cardReviewText(card)}
        />
        {status === "new" && <Button disabled>복습은 며칠 뒤에 열려요</Button>}
        {status === "mastered" && (
          <Button disabled icon="/icons/check-white.svg">
            다 앎 도장 받았어!
          </Button>
        )}
        {status === "reviewing" && (
          <>
            <p className="flex items-center gap-1.5">
              <BetaBadge />
              <span className="type-caption whitespace-nowrap text-text-normal">복습은 베타 기능이에요</span>
            </p>
            {/* 4-1(베타)로 가는 버튼: 보이기만 하고 눌러도 동작하지 않는다 (T2) */}
            <Button icon="/icons/mic-white.svg" aria-disabled="true">
              모야한테 설명해 볼래
            </Button>
          </>
        )}
      </main>
      <TabBar selected="words" />
    </>
  );
}
