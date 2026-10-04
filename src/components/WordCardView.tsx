// 단어 카드 (S5 묻기 흐름, S11 카드 상세에서 같이 쓴다, Figma 1270:321).
// 설명은 검수된 단어 데이터(카드에 복사된 값)를 그대로 보여준다. 예문은 데이터에만 두고 화면에는 보여주지 않는다.

import type { ReactNode } from "react";
import { LinkButton } from "./Button";
import { ImageSlot } from "./ImageSlot";
import { ScreenHeading } from "./ScreenHeading";
import { SoundButton } from "./SoundButton";
import { boxClass } from "./styles";

type Props = {
  word: string;
  english?: string; // 없으면 그 줄을 숨긴다
  kidExplanation: string;
  action: ReactNode; // [🔊 들어보기] 옆: S5는 저장 버튼, S11은 처음 물은 말
  focusKey?: string;
};

// 단어 카드를 소리로 읽을 문장: "수박이 뭐야? <쉬운 설명>". S5에 들어설 때와 [🔊 들어보기]가 같은 문장을 읽는다.
export function cardSpeech(word: string, kidExplanation: string): string {
  return `${whatIs(word)} ${kidExplanation}`;
}

// "수박이 뭐야?" / "가방이 뭐야?" / "우주가 뭐야?"
function whatIs(word: string): string {
  return `${word}${hasFinalConsonant(word) ? "이" : "가"} 뭐야?`;
}

// 마지막 글자에 받침이 있는지. 조사(이/가, 이라고/라고)를 고를 때 쓴다.
export function hasFinalConsonant(word: string): boolean {
  const last = word.charCodeAt(word.length - 1);
  return last >= 0xac00 && last <= 0xd7a3 && (last - 0xac00) % 28 !== 0;
}

export function WordCardView({ word, english, kidExplanation, action, focusKey }: Props) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col items-center gap-2">
        <ImageSlot className="h-[180px] w-full" />
        <ScreenHeading focusKey={focusKey} className="text-word font-bold">
          {word}
        </ScreenHeading>
        {english && (
          <p lang="en" className="text-caption">
            {english}
          </p>
        )}
      </div>
      <div className={boxClass}>
        <div className="flex flex-col gap-3">
          <p className="text-body font-semibold">{whatIs(word)}</p>
          <p className="text-body font-semibold">{kidExplanation}</p>
          <ImageSlot className="h-[100px] w-full" />
        </div>
      </div>
      <div className="flex flex-wrap items-start gap-x-3">
        <SoundButton
          label="🔊 들어보기"
          text={cardSpeech(word, kidExplanation)}
          ariaLabel={`${word} 설명 들어보기`}
        />
        {action}
      </div>
      <div className="flex flex-col items-center">
        <LinkButton href="/app/cards">단어 카드 목록으로</LinkButton>
      </div>
    </div>
  );
}
