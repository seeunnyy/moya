"use client";

// /app/cards/[id] 단어 카드 상세 (S11, Figma 프레임 없음 → 단어 카드 S5 모양).
// 이미 저장된 카드라 저장 버튼 대신 처음 물은 말을 둬, 서툴게 물어도 찾아준 장면이 단어장에도 남게 한다.
// 영어 표기는 저장 형식을 바꾸지 않고 단어 데이터(wordEntryId)에서 찾는다.
// 없는 id면 자동으로 옮기지 않고 안내 + "단어 카드 목록으로"를 보여준다.

import { MOCK_WORDS } from "@/data/words.mock";
import { LinkButton } from "./Button";
import { Header } from "./Header";
import { ScreenHeading } from "./ScreenHeading";
import { useSavedWords } from "./useSavedWords";
import { hasFinalConsonant, WordCardView } from "./WordCardView";

type Props = {
  id: string;
};

export function CardDetailScreen({ id }: Props) {
  const saved = useSavedWords();
  const card = saved?.cards.find((c) => c.id === id);
  const english = card && MOCK_WORDS.find((w) => w.id === card.wordEntryId)?.english;

  return (
    <>
      <Header title="단어 카드 화면" back={{ href: "/app/cards", label: "목록으로" }} />
      <main className="flex flex-col p-6">
        {saved === null && (
          <p role="status" className="text-caption">
            단어 카드를 여는 중…
          </p>
        )}

        {saved !== null && !card && (
          <div className="flex flex-col items-center gap-6">
            <ScreenHeading>그 카드를 찾을 수 없어</ScreenHeading>
            <LinkButton href="/app/cards">단어 카드 목록으로</LinkButton>
          </div>
        )}

        {card && (
          <WordCardView
            word={card.word}
            english={english}
            kidExplanation={card.kidExplanation}
            action={
              <p className="self-center text-caption">
                처음엔 &lsquo;{card.spokenAs}&rsquo;{hasFinalConsonant(card.spokenAs) ? "이라고" : "라고"} 물어봤어
              </p>
            }
          />
        )}
      </main>
    </>
  );
}
