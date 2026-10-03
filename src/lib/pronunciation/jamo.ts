// 한글 음절의 자모 분해·조합. 외부 라이브러리 없이 유니코드 계산으로 처리한다.

const SYLLABLE_BASE = 0xac00; // "가"
const SYLLABLE_LAST = 0xd7a3; // "힣"

export const CHOSEONG = [
  "ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ",
  "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ",
] as const;

export const JUNGSEONG = [
  "ㅏ", "ㅐ", "ㅑ", "ㅒ", "ㅓ", "ㅔ", "ㅕ", "ㅖ", "ㅗ", "ㅘ",
  "ㅙ", "ㅚ", "ㅛ", "ㅜ", "ㅝ", "ㅞ", "ㅟ", "ㅠ", "ㅡ", "ㅢ", "ㅣ",
] as const;

// 첫 칸 ""은 받침 없음
export const JONGSEONG = [
  "", "ㄱ", "ㄲ", "ㄳ", "ㄴ", "ㄵ", "ㄶ", "ㄷ", "ㄹ", "ㄺ",
  "ㄻ", "ㄼ", "ㄽ", "ㄾ", "ㄿ", "ㅀ", "ㅁ", "ㅂ", "ㅄ", "ㅅ",
  "ㅆ", "ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ",
] as const;

export type Syllable = {
  cho: string; // 초성
  jung: string; // 중성
  jong: string; // 종성, 없으면 ""
};

// 한글 음절 한 글자를 나눈다. 한글 음절이 아니면 null.
export function decomposeSyllable(char: string): Syllable | null {
  const code = char.charCodeAt(0);
  if (char.length !== 1 || code < SYLLABLE_BASE || code > SYLLABLE_LAST) {
    return null;
  }
  const offset = code - SYLLABLE_BASE;
  return {
    cho: CHOSEONG[Math.floor(offset / 588)],
    jung: JUNGSEONG[Math.floor((offset % 588) / 28)],
    jong: JONGSEONG[offset % 28],
  };
}

// 자모를 한 음절로 합친다. 맞지 않는 자모면 null.
export function composeSyllable({ cho, jung, jong }: Syllable): string | null {
  const choIndex = CHOSEONG.indexOf(cho as (typeof CHOSEONG)[number]);
  const jungIndex = JUNGSEONG.indexOf(jung as (typeof JUNGSEONG)[number]);
  const jongIndex = JONGSEONG.indexOf(jong as (typeof JONGSEONG)[number]);
  if (choIndex < 0 || jungIndex < 0 || jongIndex < 0) return null;
  return String.fromCharCode(
    SYLLABLE_BASE + choIndex * 588 + jungIndex * 28 + jongIndex,
  );
}

// 단어를 음절별로 나눈다. 한글 음절이 아닌 글자가 있으면 null.
export function decomposeWord(word: string): Syllable[] | null {
  const syllables: Syllable[] = [];
  for (const char of word) {
    const syllable = decomposeSyllable(char);
    if (!syllable) return null;
    syllables.push(syllable);
  }
  return syllables;
}

export function composeWord(syllables: Syllable[]): string | null {
  let word = "";
  for (const syllable of syllables) {
    const char = composeSyllable(syllable);
    if (char === null) return null;
    word += char;
  }
  return word;
}
