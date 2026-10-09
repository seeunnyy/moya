// 모야 그림·무대 (모야 표정 180:6098, 2-1 '모야 무대' 180:6824, '오늘의 단어 버튼' 180:6836)

import Image from "next/image";
import type { ButtonHTMLAttributes } from "react";
import { FillImg, Img } from "./Img";

// 표정 심볼 이름: 인사·설명·궁금·당황·신남. 화면의 심볼은 투명판(clear)을 쓴다
export type MoyaExpression = "greet" | "explain" | "curious" | "confused" | "excited";

export function MoyaImage({
  expression,
  size,
  background = "clear",
  priority = false,
  className = "",
}: {
  expression: MoyaExpression;
  size: number;
  background?: "clear" | "cream";
  priority?: boolean;
  className?: string;
}) {
  return (
    <Image
      src={`/moya/moya-${expression}-${background}.png`}
      alt=""
      width={size}
      height={size}
      sizes={`${size}px`}
      priority={priority}
      className={`shrink-0 object-contain ${className}`}
      style={{ width: size, height: size }}
      draggable={false}
    />
  );
}

// 모야 무대: 뒤 빛(300) + 바닥 그림자(170×24) + 모야(290). 2-1 홈 기준 위치
export function MoyaStage({ expression = "explain" }: { expression?: MoyaExpression }) {
  return (
    <div className="relative h-[276px] w-[300px]" aria-hidden="true">
      <span className="absolute -top-[22px] left-0 size-[300px]">
        <FillImg src="/ui/stage-glow.svg" className="inset-0" />
      </span>
      <span className="absolute top-[252px] left-[65px] h-6 w-[170px]">
        <FillImg src="/ui/stage-shadow.svg" className="inset-[-16.67%_-2.35%]" />
      </span>
      <span className="absolute -top-[14px] left-[5px]">
        <MoyaImage expression={expression} size={290} priority />
      </span>
    </div>
  );
}

// 홈의 오늘의 단어 선물 버튼: 선물 그림 60 + 이름, 아직 안 봤으면 빨간 점
export function GiftButton({
  hasNew = false,
  className = "",
  ...rest
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & { hasNew?: boolean }) {
  return (
    <button
      type="button"
      aria-label={hasNew ? "오늘의 단어 (새 단어 있음)" : "오늘의 단어"}
      className={`relative flex w-[60px] flex-col items-center gap-0.5 ${className}`}
      {...rest}
    >
      <Img src="/words/seonmul.svg" size={60} />
      <span className="type-caption whitespace-nowrap text-text-normal">오늘의 단어</span>
      {hasNew && (
        <span className="absolute top-0.5 left-[50px] size-3.5">
          <FillImg src="/ui/new-dot.svg" className="inset-[-14.29%]" />
        </span>
      )}
    </button>
  );
}
