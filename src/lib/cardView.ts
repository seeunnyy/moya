// 지구 사전 카드 보이기 (3-1 타일, 3-2 카드 상세): 색·별·상태 글·아래 버튼 문구. 저장값만 보고 계산하는 순수 함수.
// 피그마 3-1·3-2~3-2e의 문구 그대로. 복습(베타) 전이라 실제로 생기는 카드는 모두 '새 카드'다.

import type { CardStatus, CardTint, WordCard } from "../types/index.ts";

// 피그마 3-1의 6장 색. 피그마에 없는 단어(저울·조금·달팽이)는 정해 두고, 그 밖의 단어는 노랑
const TINTS: Record<string, CardTint> = {
  "jeogeumtong-1": "pink",
  "usan-1": "lavender",
  "pyeonuijeom-1": "green",
  "nabi-1": "sky",
  "mujigae-1": "yellow",
  "ssiat-1": "lime",
  "jeoul-1": "sky",
  "jogeum-1": "lavender",
  "dalpaengi-1": "lime",
};

export function cardTint(wordEntryId: string): CardTint {
  return TINTS[wordEntryId] ?? "yellow";
}

export function cardStatus(card: Pick<WordCard, "status">): CardStatus {
  return card.status ?? "new";
}

const STATUS_LABEL: Record<CardStatus, string> = { new: "새 카드", reviewing: "복습 중", mastered: "다 앎" };

export function cardStatusLabel(card: Pick<WordCard, "status">): string {
  return STATUS_LABEL[cardStatus(card)];
}

// 별: 새 카드 0, 복습 중은 기억한 횟수(1~2, 없으면 1), 다 앎 3
export function cardStars(card: Pick<WordCard, "status" | "reviewStep">): number {
  const status = cardStatus(card);
  if (status === "new") return 0;
  if (status === "mastered") return 3;
  return Math.min(2, Math.max(1, Math.floor(card.reviewStep ?? 1)));
}

// 3-2 카드 안 별 옆 글
export function cardReviewText(card: Pick<WordCard, "status" | "reviewStep">): string {
  const status = cardStatus(card);
  if (status === "new") return "며칠 뒤 모야가 다시 물어볼게!";
  if (status === "mastered") return "세 번 기억해서 다 앎 도장을 받았어!";
  return cardStars(card) === 2 ? "두 번 기억했어! 한 번만 더 하면 다 앎" : "한 번 기억했어! 두 번 더 하면 다 앎";
}

// 3-1 순서: 최근에 모은 카드부터 (날짜가 같으면 저장된 순서의 뒤쪽부터)
export function cardsNewestFirst(cards: WordCard[]): WordCard[] {
  const time = (c: WordCard) => {
    const t = new Date(c.createdAt).getTime();
    return Number.isNaN(t) ? 0 : t;
  };
  return cards
    .map((card, index) => ({ card, index }))
    .sort((a, b) => time(b.card) - time(a.card) || b.index - a.index)
    .map((x) => x.card);
}
