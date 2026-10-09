// 마이크 버튼 (버튼 상태 보드 180:5892): 기본·호버·누름·듣는 중·비활성. 상태마다 피그마 SVG가 따로 있다.
// 그림은 버튼 틀(118×116.703)보다 넓어서(빛 테두리) 피그마의 inset 비율 그대로 틀 밖으로 늘린다.

import type { ButtonHTMLAttributes } from "react";
import { FillImg } from "./Img";

export type MicState = "idle" | "listening" | "disabled";

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  state?: MicState;
  label: string; // 보조기기용 이름 (예: "눌러서 말하기", "그만 말하기")
};

export function MicButton({ state = "idle", label, className = "", ...rest }: Props) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={state === "disabled"}
      className={`group relative h-[116.703px] w-[118px] shrink-0 disabled:cursor-default ${className}`}
      {...rest}
    >
      {state === "idle" && (
        <>
          <FillImg src="/mic/mic-default.svg" className="inset-[-12.21%_-9.32%_-7.75%_-9.32%] group-hover:hidden group-active:hidden" />
          <FillImg src="/mic/mic-hover.svg" className="hidden inset-[-16.49%_-13.56%_-12.04%_-13.56%] group-hover:block group-active:hidden" />
          <FillImg src="/mic/mic-pressed.svg" className="hidden inset-[-8.78%_-9.32%_-11.18%_-9.32%] group-active:block" />
        </>
      )}
      {state === "listening" && (
        <FillImg src="/mic/mic-listening.svg" className="inset-[-27.63%_-24.58%_-23.18%_-24.58%]" />
      )}
      {state === "disabled" && <FillImg src="/mic/mic-disabled.svg" className="inset-0" />}
    </button>
  );
}
