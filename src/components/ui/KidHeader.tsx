// 아이 화면 헤더 (컴포넌트 보드 '아이 헤더' 180:6313): 아바타 + 오늘의 미션 별 3칸(→ 2-0) | 별 개수 칩(→ 3-5)
// 상단 칩 상태는 버튼 상태 보드 '상단 칩' 180:5594 (기본·호버·누름·비활성, 종류: 별·연속 학습)

import type { ButtonHTMLAttributes } from "react";
import { Img } from "./Img";

// 미션 별 칸: 채운 칸(라임 + 별) / 남은 칸(흰 점선). 헤더는 32·별 20, 미션 시트는 40·별 24
export function MissionTracker({ done, size = 32 }: { done: number; size?: 32 | 40 }) {
  const box = size === 32 ? "size-8 rounded-2xl" : "size-10 rounded-[20px]";
  const gap = size === 32 ? "gap-1.5" : "gap-2";
  return (
    <span className={`flex items-center ${gap}`}>
      {[0, 1, 2].map((i) =>
        i < done ? (
          <span key={i} className={`flex items-center justify-center bg-lime ${box}`}>
            <Img src="/icons/star-filled.svg" size={size === 32 ? 20 : 24} />
          </span>
        ) : (
          <span key={i} className={`border-2 border-dashed border-line-lavender bg-white ${box}`} />
        ),
      )}
    </span>
  );
}

const CHIP_KIND = {
  star: { icon: "/icons/chip-star.svg", off: "/icons/chip-star-disabled.svg" },
  streak: { icon: "/icons/chip-rocket.svg", off: "/icons/chip-rocket-disabled.svg" },
} as const;

export function TopChip({
  kind,
  value,
  label,
  disabled,
  className = "",
  ...rest
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  kind: keyof typeof CHIP_KIND;
  value: string;
  label: string; // 보조기기용 (예: "모은 별 24개")
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      className={`flex items-center gap-1 rounded-full border-[1.5px] border-line-beige bg-white text-text-strong py-1.5 pr-3 pl-2 drop-shadow-beige-sm touch-target hover:border-line-lavender hover:bg-hover-faint hover:drop-shadow-hover active:border-lavender-press-line active:bg-chip-press active:pt-2 active:pb-1 active:text-brand-shadow active:drop-shadow-press disabled:cursor-default disabled:text-text-disabled disabled:border-muted-line disabled:bg-muted-fill disabled:py-1.5 disabled:drop-shadow-none ${className}`}
      {...rest}
    >
      <Img src={disabled ? CHIP_KIND[kind].off : CHIP_KIND[kind].icon} size={20} />
      <span className="font-jua text-[15px] leading-5 whitespace-nowrap">{value}</span>
    </button>
  );
}

export function KidHeader({
  missionDone,
  stars,
  onOpenMission,
  onOpenStars,
}: {
  missionDone: number;
  stars: number;
  onOpenMission?: () => void;
  onOpenStars?: () => void;
}) {
  const done = Math.max(0, Math.min(3, missionDone));
  return (
    <header className="flex w-full items-center justify-between px-5 py-1.5">
      <button
        type="button"
        onClick={onOpenMission}
        aria-label={`오늘의 미션 ${done}/3 보기`}
        className="flex items-center gap-3"
      >
        <Img src="/icons/avatar.svg" size={44} />
        <MissionTracker done={done} />
      </button>
      <TopChip kind="star" value={String(stars)} label={`모은 별 ${stars}개 보기`} onClick={onOpenStars} />
    </header>
  );
}
