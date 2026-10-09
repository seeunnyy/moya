// 상단 바·하단 패널·아이콘 칸·설정 목록 (1-2 상단 바 180:7235·하단 패널 180:7274, 5-4 상단 바 180:8019·목록 180:8030,
// 잠금 아이콘 칸 180:7424·180:7908, 닫기 버튼 180:7771)

import type { ReactNode } from "react";
import { Img } from "./Img";
import { BetaBadge, CircleButton } from "./buttons";
import { Toggle } from "./forms";

// 진행 표시 "1 / 5" + 120×6 막대
export function StepProgress({ step, total }: { step: number; total: number }) {
  const pct = Math.max(0, Math.min(1, step / total)) * 100;
  return (
    <div className="flex flex-col items-center gap-1.5" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={step} aria-label={`${total}단계 중 ${step}단계`}>
      <span className="type-caption whitespace-nowrap text-text-normal">
        {step} / {total}
      </span>
      <span className="flex h-1.5 w-[120px] overflow-hidden rounded-[3px] bg-line-beige">
        <span className="h-1.5 rounded-[3px] bg-brand" style={{ width: `${pct}%` }} />
      </span>
    </div>
  );
}

// 상단 바 (높이 64): 왼쪽 뒤로/닫기 52, 가운데 진행 표시나 제목, 오른쪽 빈칸 52
export function TopBar({
  left,
  onLeft,
  center,
  title,
}: {
  left?: "back" | "close";
  onLeft?: () => void;
  center?: ReactNode;
  title?: string; // 보호자 화면 제목 (보호자/소제목)
}) {
  return (
    <div className="flex h-16 w-full items-center justify-between px-5 py-1.5">
      {left ? (
        <CircleButton
          icon={left === "back" ? "/icons/back.svg" : "/icons/close.svg"}
          label={left === "back" ? "이전 화면" : "닫기"}
          onClick={onLeft}
        />
      ) : (
        <span className="size-[52px]" />
      )}
      {center ?? (title ? <p className="type-parent-subtitle whitespace-nowrap text-text-strong">{title}</p> : null)}
      <span className="size-[52px]" />
    </div>
  );
}

// 하단 패널: 흰 바탕, 위 모서리 28, 버튼 영역 (pb 42 또는 기기 안전 영역)
export function BottomPanel({ children }: { children: ReactNode }) {
  return (
    <div className="flex w-full flex-col items-center gap-3 rounded-t-[28px] bg-white px-6 pt-5 pb-[max(42px,env(safe-area-inset-bottom))] shadow-tabbar">
      {children}
    </div>
  );
}

// 둥근 아이콘 칸: 잠금(1-5: 72/38, 5-1: 80/42), 틀림은 베타 배경색 (5-1a)
export function IconCircle({
  icon = "/icons/lock.svg",
  size = 72,
  tone = "lavender",
}: {
  icon?: string;
  size?: 72 | 80;
  tone?: "lavender" | "danger";
}) {
  const box = size === 72 ? "size-[72px] rounded-[36px]" : "size-20 rounded-[40px]";
  return (
    <span className={`flex items-center justify-center ${box} ${tone === "danger" ? "bg-beta-bg" : "bg-brand-lavender"}`}>
      <Img src={icon} size={size === 72 ? 38 : 42} />
    </span>
  );
}

// 설정 목록 묶음 (흰 카드, 줄 사이 1px 베이지 선)
export function SettingsGroup({ children }: { children: ReactNode }) {
  return (
    <div className="flex w-full flex-col overflow-hidden rounded-[18px] bg-white shadow-group [&>*+*]:border-t [&>*+*]:border-line-beige">
      {children}
    </div>
  );
}

type RowRight =
  | { kind: "chevron" }
  | { kind: "beta" }
  | { kind: "toggle"; on: boolean; onChange: (next: boolean) => void }
  | { kind: "text"; text: string };

export function SettingsRow({
  label,
  right = { kind: "chevron" },
  danger = false,
  onClick,
}: {
  label: string;
  right?: RowRight;
  danger?: boolean;
  onClick?: () => void;
}) {
  const text = `min-w-px flex-1 text-left type-body ${danger ? "text-coral" : "text-text-strong"}`;
  if (right.kind === "toggle") {
    return (
      <div className="flex w-full items-center justify-between px-4 py-[15px]">
        <span className={text}>{label}</span>
        <Toggle on={right.on} onChange={right.onChange} label={label} />
      </div>
    );
  }
  if (right.kind === "text") {
    return (
      <div className="flex w-full items-center justify-between px-4 py-[15px]">
        <span className={text}>{label}</span>
        <span className="type-body whitespace-nowrap text-text-normal">{right.text}</span>
      </div>
    );
  }
  return (
    <button type="button" onClick={onClick} className="flex w-full items-center justify-between px-4 py-[15px]">
      <span className={text}>{label}</span>
      {right.kind === "beta" && <BetaBadge className="mr-0" />}
      <Img src="/icons/chevron-right.svg" size={18} />
    </button>
  );
}
