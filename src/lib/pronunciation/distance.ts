// 자모 단위 편집거리 (레벤슈타인).
// 받침 없음은 토큰을 넣지 않아, 받침 생략(R2)은 종성 삽입 비용 1로 계산된다.

import { decomposeSyllable } from "./jamo.ts";

// 같은 자모라도 초성과 종성은 다른 소리 자리라 구분한다. 예: 초성 "ㅇ" ≠ 종성 "ㅇ"
const JONG_MARK = "_";

export function toJamoTokens(word: string): string[] {
  const tokens: string[] = [];
  for (const char of word) {
    const syllable = decomposeSyllable(char);
    if (!syllable) {
      tokens.push(char);
      continue;
    }
    tokens.push(syllable.cho, syllable.jung);
    if (syllable.jong) tokens.push(JONG_MARK + syllable.jong);
  }
  return tokens;
}

export function jamoDistance(a: string, b: string): number {
  const s = toJamoTokens(a);
  const t = toJamoTokens(b);
  let prev = Array.from({ length: t.length + 1 }, (_, j) => j);
  for (let i = 1; i <= s.length; i++) {
    const curr = [i];
    for (let j = 1; j <= t.length; j++) {
      const cost = s[i - 1] === t[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    prev = curr;
  }
  return prev[t.length];
}
