// 후보 카드 2~3개 + [다 아니야] (S4). 카드를 누르면 소리로 들려주는 것은 음성 출력 작업(9.1)에서 붙인다.

import type { Candidate } from "@/types";
import { Button } from "./Button";

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
            <Button onClick={() => onPick(entry.id)} aria-label={`${entry.word}, 이거야!`}>
              이거야!
            </Button>
          </li>
        ))}
      </ul>
      <Button onClick={onNone}>다 아니야</Button>
    </div>
  );
}
