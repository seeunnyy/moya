// 발음 역규칙 적용. 입력 단어 하나로 '원래 이 단어였을 수 있는' 변형 목록을 만든다.

import type { PronunciationRule } from "../../types/index.ts";
import { PRONUNCIATION_RULES } from "../../data/rules.ts";
import { composeWord, decomposeWord, type Syllable } from "./jamo.ts";

// 음절의 초성 자리에 올 수 있는 자모들 (원래 자모 포함)
function choOptions(cho: string, rules: PronunciationRule[]): string[] {
  const options = [cho];
  for (const rule of rules) {
    if (rule.position === "초성" && rule.from === cho && !options.includes(rule.to)) {
      options.push(rule.to);
    }
  }
  return options;
}

// 입력 단어를 첫 칸에 두고, 음절별 초성 대치의 모든 조합을 돌려준다.
// 한글 음절이 아닌 글자가 있으면 입력 단어만 돌려준다.
export function generateVariants(
  word: string,
  rules: PronunciationRule[] = PRONUNCIATION_RULES,
): string[] {
  const syllables = decomposeWord(word);
  if (!syllables || syllables.length === 0) return [word];

  let combos: Syllable[][] = [[]];
  for (const syllable of syllables) {
    const next: Syllable[][] = [];
    for (const combo of combos) {
      for (const cho of choOptions(syllable.cho, rules)) {
        next.push([...combo, { ...syllable, cho }]);
      }
    }
    combos = next;
  }

  const variants = new Set<string>();
  for (const combo of combos) {
    const variant = composeWord(combo);
    if (variant) variants.add(variant);
  }
  return [...variants];
}
