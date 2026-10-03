// "어디서 들었어?" 상황 버튼 (S4). 아이콘은 디자인 작업에서 글자 옆에 붙인다.

import type { HeardContext } from "@/types";
import { Button } from "./Button";
import { CONTEXT_OPTIONS } from "./heardContext";

type Props = {
  onPick: (context?: HeardContext) => void;
};

export function ContextPicker({ onPick }: Props) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {CONTEXT_OPTIONS.map((option) => (
        <Button key={option.value} onClick={() => onPick(option.value)}>
          {option.label}
        </Button>
      ))}
      <Button className="col-span-2" onClick={() => onPick(undefined)}>
        모르겠어
      </Button>
    </div>
  );
}
