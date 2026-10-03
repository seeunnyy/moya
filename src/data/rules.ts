// 발음 역규칙 표 (05 §2). from = 아이가 낸 소리, to = 원래 단어였을 수 있는 소리.
// R2(받침 생략)는 변형을 만들지 않고 편집거리의 종성 삽입(거리 1)으로 처리한다 (잠정).
// 녹음 테스트(10/16~22) 결과로 이 표만 고쳐 보정한다.

import type { PronunciationRule } from "../types/index.ts";

// 서로 바뀔 수 있는 초성 묶음 안의 모든 쌍을 양방향 규칙으로 만든다.
function swapRules(groups: string[][], note: string): PronunciationRule[] {
  const rules: PronunciationRule[] = [];
  for (const group of groups) {
    for (const from of group) {
      for (const to of group) {
        if (from !== to) rules.push({ from, to, position: "초성", note });
      }
    }
  }
  return rules;
}

// R1. ㅅ·ㅆ ↔ ㄷ·ㄸ 대치 (초성). 예: 두박 → 수박
const R1: PronunciationRule[] = [
  ["ㅅ", "ㄷ"],
  ["ㅅ", "ㄸ"],
  ["ㅆ", "ㄷ"],
  ["ㅆ", "ㄸ"],
].flatMap(([a, b]) => [
  { from: a, to: b, position: "초성", note: "R1 ㅅ·ㅆ↔ㄷ·ㄸ" },
  { from: b, to: a, position: "초성", note: "R1 ㅅ·ㅆ↔ㄷ·ㄸ" },
]);

// R3. 된소리·거센소리 ↔ 예사소리 (초성). 예: 대풍 → 태풍
const R3 = swapRules(
  [
    ["ㄱ", "ㄲ", "ㅋ"],
    ["ㄷ", "ㄸ", "ㅌ"],
    ["ㅂ", "ㅃ", "ㅍ"],
    ["ㅈ", "ㅉ", "ㅊ"],
  ],
  "R3 예사·된·거센소리",
);

export const PRONUNCIATION_RULES: PronunciationRule[] = [...R1, ...R3];
