"use client";

// /app/cards/[id] 단어 카드 상세 (S11). S5 단어 카드 모양을 그대로 쓰고, 이미 저장된 카드라 저장 버튼은 없다.
// 단어 아래에 처음 물은 말을 보여줘, 서툴게 물어도 찾아준 장면이 단어장에도 남게 한다.
// 없는 id면 자동으로 옮기지 않고 안내 + [단어 카드 목록으로]를 보여준다.

import { LinkButton } from "./Button";
import { BackHeader } from "./BackHeader";
import { useSavedWords } from "./useSavedWords";
import { WordCardView } from "./WordCardView";

type Props = {
  id: string;
};

export function CardDetailScreen({ id }: Props) {
  const saved = useSavedWords();
  const card = saved?.cards.find((c) => c.id === id);

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-5 px-4 py-6">
      <BackHeader href="/app/cards" backLabel="목록" focusKey={card ? "card" : "none"}>
        {card || saved === null ? "단어 카드" : "카드를 찾을 수 없어"}
      </BackHeader>

      {saved === null && <p role="status">단어 카드를 여는 중…</p>}

      {saved !== null && !card && (
        <>
          <p className="text-lg break-keep">그 카드를 찾을 수 없어. 목록에서 다시 골라 볼래?</p>
          <LinkButton href="/app/cards">단어 카드 목록으로</LinkButton>
        </>
      )}

      {card && (
        <WordCardView
          word={card.word}
          kidExplanation={card.kidExplanation}
          example={card.example}
          heardContext={card.heardContext}
          spokenAs={card.spokenAs}
        />
      )}
    </main>
  );
}
