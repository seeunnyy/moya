"use client";

// 폴백: 글자 입력 + 예시 알약 (피그마에 없음 → 배치는 PM 확인 2026-10-11, "마이크 자리 대신").
// 2-7 [글자 카드로 고를래](후보가 없어 늘 폴백, 잠정 T3)와 마이크를 쓸 수 없는 기기의 2-1에서 마이크 자리에 놓는다.
// 마이크 없이도 시연을 끝까지 할 수 있게 한다 (CLAUDE.md "시연 안정성 우선").

import { useState } from "react";
import { Img } from "./Img";
import { Button, ExampleChip } from "./buttons";
import { TextField } from "./forms";

export function TextFallback({
  examples,
  onAsk,
  onVoice,
}: {
  examples: string[];
  onAsk: (text: string) => void; // 물어볼래 · 예시 알약
  onVoice?: () => void; // "말로 할래" (2-7만)
}) {
  const [text, setText] = useState("");
  const ask = () => text.trim() && onAsk(text.trim());
  return (
    <div className="flex w-full flex-col items-center gap-3">
      <form
        className="flex w-full flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          ask();
        }}
      >
        <TextField
          id="fallback-text"
          label="글자로 써 줄래?"
          placeholder="저금통이 뭐야?"
          autoComplete="off"
          enterKeyHint="send"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <Button type="submit" disabled={!text.trim()}>
          물어볼래
        </Button>
      </form>
      <div className="flex w-full flex-wrap justify-center gap-2">
        {examples.map((ex) => (
          <ExampleChip key={ex} onClick={() => onAsk(ex)}>
            {ex}
          </ExampleChip>
        ))}
      </div>
      {onVoice && (
        <button type="button" onClick={onVoice} className="flex items-center gap-1.5 py-1 touch-target">
          <Img src="/icons/mic.svg" size={20} />
          <span className="type-moya-label text-brand-deep">말로 할래</span>
        </button>
      )}
    </div>
  );
}
