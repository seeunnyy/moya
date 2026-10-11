// 보호자 화면 부품 (5-2 보호자 홈 180:7784, 5-3 물어볼 단어 180:7837·180:7846)
// 흰 카드(모서리 20, 옅은 그림자), 요약 숫자 칸, 글 링크 줄, 진행 바, 물어볼 단어 항목.

import type { ReactNode } from "react";
import { Img } from "./Img";
import { BetaBadge, Button, CircleButton, SpeakerButton } from "./buttons";
import { FieldError } from "./forms";

// 5-2 머리: 제목(보호자/제목) + 캡션, 오른쪽 설정 버튼 52
export function ParentHomeHeader({ title, caption, onSettings }: { title: string; caption: string; onSettings: () => void }) {
  return (
    <header className="flex w-full items-center justify-between py-2.5 pr-5 pl-6">
      <div className="flex flex-col items-start gap-0.5 whitespace-nowrap">
        <h1 className="type-parent-title text-text-strong">{title}</h1>
        <p className="type-caption text-text-normal">{caption}</p>
      </div>
      <CircleButton icon="/icons/settings-26.svg" label="설정" onClick={onSettings} />
    </header>
  );
}

export function ParentCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`flex w-full flex-col items-start rounded-[20px] bg-white shadow-group ${className}`}>{children}</div>;
}

// 제목 줄: 소제목/굵은 글 + 베타 배지
export function CardTitle({ children, beta = false, size = "subtitle" }: { children: ReactNode; beta?: boolean; size?: "subtitle" | "bold" }) {
  return (
    <span className="flex items-center gap-2">
      <span className={`whitespace-nowrap text-text-strong ${size === "subtitle" ? "type-parent-subtitle" : "type-body-bold"}`}>{children}</span>
      {beta && <BetaBadge />}
    </span>
  );
}

// 요약 숫자 칸: 아주 연한 보라, 숫자(모야/제목 L 진보라) + 캡션
export function SummaryStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex min-w-px flex-1 flex-col items-start gap-0.5 rounded-2xl bg-brand-faint p-3 whitespace-nowrap">
      <span className="type-moya-title-l text-brand-deep">{value}</span>
      <span className="type-caption text-text-normal">{label}</span>
    </div>
  );
}

// 글 링크 줄: 굵은 진보라 글 + 화살표 18. 베타 항목은 onClick 없이 보이기만
export function TextLinkRow({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-disabled={onClick ? undefined : true}
      className="flex w-full items-center justify-between"
    >
      <span className="type-body-bold whitespace-nowrap text-brand-deep">{label}</span>
      <Img src="/icons/chevron-right.svg" size={18} />
    </button>
  );
}

// 진행 바 8 (라벤더 바탕 + 보라)
export function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.max(0, Math.min(1, value / max)) * 100 : 0;
  return (
    <span className="flex h-2 w-full overflow-hidden rounded-[4px] bg-brand-lavender" role="progressbar" aria-valuemin={0} aria-valuemax={max} aria-valuenow={value}>
      <span className="h-2 rounded-[4px] bg-brand" style={{ width: `${pct}%` }} />
    </span>
  );
}

// 5-3 물어볼 단어 항목: 스피커 40 + 아이가 말한 글자(모야/제목 M) + 시각. '녹음 듣기' 글자는 숨긴다(결정 2).
// 아직 안 알려 줬으면 입력칸 + [모야에게 알려주기], 알려 줬으면 그 단어 + "알려줬어요" 칩
export function PendingWordItem({
  spoken,
  time,
  onSpeak,
  playing,
  taughtWord,
  value,
  onChange,
  onTeach,
  error,
  inputId,
}: {
  spoken: string;
  time: string;
  onSpeak: () => void;
  playing: boolean;
  taughtWord?: string;
  value: string;
  onChange: (v: string) => void;
  onTeach: () => void;
  error?: string;
  inputId: string;
}) {
  return (
    <ParentCard className="gap-3 p-4">
      <div className="flex w-full items-center gap-3">
        <SpeakerButton size={40} onClick={onSpeak} playing={playing} label={`‘${spoken}’ 듣기`} />
        <p className="flex min-w-px flex-1 flex-col items-start gap-0.5 whitespace-nowrap">
          <span className="type-moya-title-m text-text-strong">‘{spoken}’</span>
          <span className="type-caption text-text-faint">{time}</span>
        </p>
      </div>
      {taughtWord ? (
        <div className="flex h-[50px] w-full items-center justify-between rounded-[14px] border-2 border-line-lavender bg-parent-bg px-4">
          <span className="type-body whitespace-nowrap text-text-strong">{taughtWord}</span>
          <span className="flex items-center gap-1 rounded-full bg-lime py-[3px] pr-2.5 pl-2">
            <Img src="/icons/check.svg" size={14} />
            <span className="type-caption whitespace-nowrap text-text-strong">알려줬어요</span>
          </span>
        </div>
      ) : (
        <>
          <input
            id={inputId}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="아이가 말한 단어는?"
            aria-label={`‘${spoken}’은 어떤 단어인가요`}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${inputId}-error` : undefined}
            className="h-[50px] w-full rounded-[14px] border-2 border-line-beige bg-parent-bg px-4 font-sans text-[15px] leading-[1.55] text-text-strong placeholder:text-text-faint focus:border-line-lavender focus:outline-none"
          />
          {error && (
            <FieldError id={`${inputId}-error`} className="-mt-1.5">
              {error}
            </FieldError>
          )}
          <Button variant="secondary" disabled={!value.trim()} onClick={onTeach}>
            모야에게 알려주기
          </Button>
        </>
      )}
    </ParentCard>
  );
}
