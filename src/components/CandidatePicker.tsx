// 후보 카드 2~3개 + [여기 없어요] (S4, Figma 7).
// 카드마다 [들어보기](소리, 작업 9.1 전까지 자리만)와 [이거야!](확정)를 둔다 (D3).

import type { Candidate } from "@/types";
import { Button } from "./Button";
import { SoundButton } from "./SoundButton";

type Props = {
  candidates: Candidate[];
  onPick: (entryId: string) => void;
  onNone: () => void;
};

export function CandidatePicker({ candidates, onPick, onNone }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-3">
        {candidates.map(({ entry }) => (
          <li key={entry.id} className="flex flex-col gap-2 rounded-lg border-2 border-current p-3">
            <p className="text-xl font-bold">{entry.word}</p>
            <p className="break-keep">{entry.hint}</p>
            <div className="grid grid-cols-2 gap-2">
              <SoundButton label="들어보기" ariaLabel={`${entry.word} 들어보기`} />
              <Button onClick={() => onPick(entry.id)} aria-label={`${entry.word}, 이거야!`}>
                이거야!
              </Button>
            </div>
          </li>
        ))}
      </ul>
      <Button onClick={onNone}>여기 없어요</Button>
    </div>
  );
}
