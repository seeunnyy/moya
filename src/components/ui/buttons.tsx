// 버튼류 (컴포넌트 보드 '버튼' 180:6627, 원형 버튼 180:6661, 버튼 상태 보드 180:5582).
// 큰 버튼은 피그마에 호버가 없어 기본·누름·비활성만 둔다. 누름은 :active, 비활성은 disabled 속성.

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Img } from "./Img";

type NativeButton = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">;

const BIG_BASE =
  "relative flex h-[60px] w-full items-center justify-center gap-2 rounded-[20px] px-5 type-moya-button whitespace-nowrap touch-target disabled:cursor-default";

const BIG_VARIANT = {
  // 주 버튼: 보라 + 아래 그림자, 누르면 그림자 1px·글자 4px 내려감
  primary:
    "bg-brand text-white drop-shadow-primary active:bg-brand-deep active:pt-1 active:drop-shadow-primary-pressed disabled:bg-disabled-fill disabled:pt-0 disabled:drop-shadow-disabled",
  // 보조 버튼: 흰 바탕 + 연보라 테두리
  secondary:
    "border-2 border-line-lavender bg-white text-brand-deep drop-shadow-secondary active:bg-brand-faint active:pt-1 active:drop-shadow-secondary-pressed disabled:border-muted-line disabled:bg-muted-fill disabled:pt-0 disabled:text-text-disabled disabled:drop-shadow-none",
  // 점선 버튼: 바탕 없음
  dashed:
    "border-2 border-dashed border-brand-light text-text-normal active:bg-brand-faint active:text-brand-deep disabled:border-dashed-disabled disabled:bg-transparent disabled:text-text-disabled",
  // 확인 창의 위험 버튼(지우기·철회하기). 누름은 피그마에 없어 주 버튼과 같은 방식으로 둠
  danger:
    "bg-coral text-white drop-shadow-danger active:pt-1 active:drop-shadow-danger-pressed disabled:bg-disabled-fill disabled:drop-shadow-disabled",
} as const;

export type BigButtonVariant = keyof typeof BIG_VARIANT;

export function Button({
  variant = "primary",
  icon,
  children,
  className = "",
  ...rest
}: NativeButton & { variant?: BigButtonVariant; icon?: string | ReactNode; children: ReactNode }) {
  return (
    <button type="button" className={`${BIG_BASE} ${BIG_VARIANT[variant]} ${className}`} {...rest}>
      {typeof icon === "string" ? <Img src={icon} size={24} /> : icon}
      {children}
    </button>
  );
}

// 다시 듣기(스피커) 버튼: 기본·호버·누름·재생 중·비활성 (180:5725)
export function SpeakerButton({
  playing = false,
  size = 30,
  label = "다시 듣기",
  className = "",
  ...rest
}: NativeButton & { playing?: boolean; size?: 30 | 24; label?: string }) {
  const box = size === 30 ? "size-[30px] rounded-[15px]" : "size-6 rounded-xl";
  const state = playing
    ? "bg-brand-deep shadow-speaker-playing"
    : "bg-brand drop-shadow-speaker hover:bg-brand-hover hover:drop-shadow-speaker-hover active:bg-brand-pressed active:drop-shadow-speaker-pressed disabled:bg-disabled-fill disabled:drop-shadow-none";
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={playing || undefined}
      className={`relative flex shrink-0 items-center justify-center border-2 border-white touch-target disabled:cursor-default ${box} ${state} ${className}`}
      {...rest}
    >
      <Img src={playing ? "/icons/speaker-sm-playing.svg" : "/icons/speaker-sm.svg"} size={16} />
    </button>
  );
}

// 52px 원형 버튼: 뒤로·닫기·지구 사전 등 (180:6665). 누름은 연한 보라 + 그림자 1px
export function CircleButton({
  icon,
  label,
  badge,
  className = "",
  ...rest
}: NativeButton & { icon: string; label: string; badge?: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className={`relative flex size-[52px] shrink-0 items-center justify-center rounded-[26px] border-2 border-line-beige bg-white drop-shadow-beige active:bg-brand-faint active:pt-[3px] active:drop-shadow-beige-pressed ${className}`}
      {...rest}
    >
      <Img src={icon} size={26} />
      {badge && (
        <span className="absolute -top-2 -right-[5px] flex items-center justify-center rounded-full border-2 border-white bg-coral px-1.5 py-px type-moya-label text-white">
          {badge}
        </span>
      )}
    </button>
  );
}

// 60px 원형 보조 버튼 + 이름: 오늘의 단어·지구 사전 (180:5651). 기본·호버·누름·비활성
const ROUND_KIND = {
  today: { label: "오늘의 단어", icon: "/icons/today-word.svg", off: "/icons/today-word-disabled.svg" },
  dictionary: { label: "지구 사전", icon: "/icons/dictionary.svg", off: "/icons/dictionary-disabled.svg" },
} as const;

export function RoundActionButton({
  kind,
  className = "",
  disabled,
  ...rest
}: NativeButton & { kind: keyof typeof ROUND_KIND }) {
  const k = ROUND_KIND[kind];
  return (
    <button
      type="button"
      disabled={disabled}
      className={`group flex flex-col items-center gap-2 pt-[26px] active:gap-[5px] active:pt-[29px] disabled:cursor-default disabled:gap-2 disabled:pt-[26px] ${className}`}
      {...rest}
    >
      <span className="flex size-[60px] items-center justify-center rounded-[30px] border-2 border-line-beige bg-white shadow-key group-hover:border-line-lavender group-hover:bg-round-hover group-hover:shadow-round-hover group-active:border-lavender-press-line group-active:bg-brand-lavender group-active:shadow-round-press group-disabled:border-muted-line group-disabled:bg-muted-fill group-disabled:shadow-none">
        <Img src={disabled ? k.off : k.icon} size={28} />
      </span>
      <span className="font-jua text-[13px] leading-4 whitespace-nowrap text-text-normal group-hover:text-brand-hover-text group-active:text-brand-shadow group-disabled:text-text-disabled">
        {k.label}
      </span>
    </button>
  );
}

// 카카오 버튼 (1-0, 1-2). 동작은 기기 저장 mock — 이 부품은 모양만
export function KakaoButton({ children, className = "", ...rest }: NativeButton & { children: ReactNode }) {
  return (
    <button
      type="button"
      className={`flex h-[54px] w-full items-center justify-center gap-2 rounded-2xl bg-kakao type-body-bold whitespace-nowrap text-kakao-text ${className}`}
      {...rest}
    >
      <Img src="/ui/kakao.svg" size={20} />
      {children}
    </button>
  );
}

// 베타 배지 (180:6674)
export function BetaBadge({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex shrink-0 rounded-full bg-beta-bg px-2 py-0.5 text-[11px] leading-normal font-bold text-beta-text ${className}`}>
      베타
    </span>
  );
}
