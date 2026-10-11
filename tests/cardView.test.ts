import { test } from "node:test";
import assert from "node:assert/strict";
import { cardReviewText, cardStars, cardStatusLabel, cardsNewestFirst, cardTint } from "../src/lib/cardView.ts";
import type { WordCard } from "../src/types/index.ts";

const card = (over: Partial<WordCard>): WordCard => ({
  id: "c",
  wordEntryId: "jeogeumtong-1",
  word: "저금통",
  dictDefinition: "",
  kidExplanation: "",
  example: "",
  spokenAs: "",
  createdAt: "2026-10-10T01:00:00.000Z",
  ...over,
});

test("카드 상태별 별·글 (피그마 3-2~3-2e)", () => {
  assert.equal(cardStars(card({})), 0);
  assert.equal(cardStatusLabel(card({})), "새 카드");
  assert.equal(cardReviewText(card({})), "며칠 뒤 모야가 다시 물어볼게!");
  assert.equal(cardStars(card({ status: "reviewing", reviewStep: 1 })), 1);
  assert.equal(cardReviewText(card({ status: "reviewing", reviewStep: 1 })), "한 번 기억했어! 두 번 더 하면 다 앎");
  assert.equal(cardStars(card({ status: "reviewing", reviewStep: 2 })), 2);
  assert.equal(cardReviewText(card({ status: "reviewing", reviewStep: 2 })), "두 번 기억했어! 한 번만 더 하면 다 앎");
  assert.equal(cardStars(card({ status: "reviewing" })), 1); // 횟수가 없으면 1
  assert.equal(cardStars(card({ status: "reviewing", reviewStep: 9 })), 2); // 복습 중은 2까지
  assert.equal(cardStars(card({ status: "mastered" })), 3);
  assert.equal(cardStatusLabel(card({ status: "mastered" })), "다 앎");
  assert.equal(cardReviewText(card({ status: "mastered" })), "세 번 기억해서 다 앎 도장을 받았어!");
});

test("카드 색: 피그마 3-1의 단어 색, 모르는 단어는 노랑", () => {
  assert.equal(cardTint("jeogeumtong-1"), "pink");
  assert.equal(cardTint("pyeonuijeom-1"), "green");
  assert.equal(cardTint("없는-단어"), "yellow");
});

test("3-1 순서: 최근에 모은 카드부터", () => {
  const list = [
    card({ id: "a", createdAt: "2026-10-01T00:00:00.000Z" }),
    card({ id: "b", createdAt: "2026-10-09T00:00:00.000Z" }),
    card({ id: "c", createdAt: "2026-10-09T00:00:00.000Z" }),
    card({ id: "d", createdAt: "잘못된 날짜" }),
  ];
  assert.deepEqual(cardsNewestFirst(list).map((c) => c.id), ["c", "b", "a", "d"]);
});
