// 단어 카드 본문 (S5 묻기 흐름의 단어 카드, S11 카드 상세에서 같이 쓴다, Figma 8).
// 설명·예문은 검수된 단어 데이터(카드에 복사된 값)를 그대로 보여준다.

import type { HeardContext } from "@/types";
import { contextOption } from "./heardContext";
import { ImageSlot } from "./ImageSlot";
import { SoundButton } from "./SoundButton";

type Props = {
  word: string;
  kidExplanation: string;
  example: string;
  heardContext?: HeardContext;
  spokenAs?: string; // 카드 상세에서만 넘긴다. "처음엔 '두박'이라고 물어봤어"
};

// 마지막 글자에 받침이 있는지. 조사(이/가, 이라고/라고)를 고를 때 쓴다.
function hasFinalConsonant(word: string): boolean {
  const last = word.charCodeAt(word.length - 1);
  return last >= 0xac00 && last <= 0xd7a3 && (last - 0xac00) % 28 !== 0;
}

export function WordCardView({ word, kidExplanation, example, heardContext, spokenAs }: Props) {
  return (
    <article aria-label={`${word} 단어 카드`} className="flex flex-col gap-3 rounded-lg border-2 border-current p-4">
      <ImageSlot label="단어 그림 자리" />
      <div>
        <p className="text-3xl font-bold break-keep">{word}</p>
        {spokenAs && (
          <p className="text-sm break-keep">
            처음엔 &lsquo;{spokenAs}&rsquo;{hasFinalConsonant(spokenAs) ? "이라고" : "라고"} 물어봤어
          </p>
        )}
      </div>
      <p className="text-lg font-semibold break-keep">{word}{hasFinalConsonant(word) ? "이" : "가"} 뭐야?</p>
      <p className="break-keep">{kidExplanation}</p>
      <section aria-label="예문" className="flex flex-col gap-1">
        <p className="text-sm font-semibold">이렇게 써</p>
        <p className="break-keep">{example}</p>
      </section>
      {heardContext && (
        <p className="text-sm break-keep">{contextOption(heardContext)?.label}에서 들은 말이야.</p>
      )}
      <SoundButton label="🔈 들어보기" ariaLabel={`${word} 설명 들어보기`} />
    </article>
  );
}
