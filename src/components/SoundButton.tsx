// 소리 버튼 자리 ([들어보기], [음성 재생]). 음성 출력(작업 9.1) 전까지 비활성으로 자리만 둔다.

import { Button } from "./Button";

type Props = {
  label: string;
  ariaLabel?: string;
};

export function SoundButton({ label, ariaLabel }: Props) {
  return (
    <Button disabled aria-label={ariaLabel} title="소리는 곧 연결돼요">
      {label}
    </Button>
  );
}
