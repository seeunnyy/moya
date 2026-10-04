// 후보 카드 선택 (S4, Figma 1270:273): 후보 카드 세로 최대 3개 + [여기 없어요].
// 카드 자체를 누르면 그 단어로 확정한다. [들어보기]는 소리만 내고 선택하지 않는다.
// 버튼 안에 버튼을 넣을 수 없어서, 카드 전체를 덮는 고르기 버튼 위에 [들어보기]를 올린다.

import type { Candidate } from "@/types";
import { Button } from "./Button";
import { SoundButton } from "./SoundButton";
import { boxClass } from "./styles";

type Props = {
  candidates: Candidate[];
  onPick: (entryId: string) => void;
  onNone: () => void;
};

export function CandidatePicker({ candidates, onPick, onNone }: Props) {
  return (
    <>
      <ul className="flex w-full flex-col gap-3">
        {candidates.map(({ entry }) => (
          <li key={entry.id} className={`${boxClass} relative`}>
            <button
              type="button"
              onClick={() => onPick(entry.id)}
              aria-label={`${entry.word} 고르기`}
              className="absolute inset-0 rounded-box"
            />
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <p className="text-title font-bold">{entry.word}</p>
                {/* touch-target이 position: relative라 고르기 버튼 위에 그려지고 눌린다 */}
                <SoundButton
                  label="들어보기"
                  variant="primary"
                  text={`${entry.word}. ${entry.hint}`}
                  ariaLabel={`${entry.word} 들어보기`}
                />
              </div>
              <p className="text-caption">{entry.hint}</p>
            </div>
          </li>
        ))}
      </ul>
      <Button variant="secondary" onClick={onNone}>
        여기 없어요
      </Button>
    </>
  );
}
