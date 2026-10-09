// 입력 부품 (1-2 입력칸·약관 줄 180:7242, 선택 요소 180:6291: 체크박스·토글·나이 칩, 보호자 비밀번호 180:6260)

import type { InputHTMLAttributes, ReactNode } from "react";
import { FillImg, Img } from "./Img";

// 입력칸: 라벨(캡션) + 54px 칸
export function TextField({
  label,
  id,
  className = "",
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { label: string; id: string }) {
  return (
    <div className={`flex w-full flex-col items-start gap-1.5 ${className}`}>
      <label htmlFor={id} className="type-caption text-text-normal">
        {label}
      </label>
      <input
        id={id}
        className="h-[54px] w-full rounded-2xl border-2 border-line-lavender bg-white px-4 font-sans text-base leading-[1.55] text-text-strong placeholder:text-text-faint"
        {...rest}
      />
    </div>
  );
}

// 체크박스 24: 켜짐(보라 + 흰 체크)·꺼짐(흰 바탕 + 연보라 테두리)
export function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string; // 보조기기용
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative flex size-6 shrink-0 items-center justify-center rounded-[7px] touch-target ${
        checked ? "bg-brand" : "border-2 border-line-lavender bg-white"
      }`}
    >
      {checked && <Img src="/icons/check-white.svg" size={16} />}
    </button>
  );
}

// 약관 줄: 체크박스 + [필수]/[선택] 문구 + "›"(약관 보기)
export function TermsRow({
  tag,
  text,
  checked,
  onChange,
  onOpen,
}: {
  tag: "필수" | "선택";
  text: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  onOpen?: () => void;
}) {
  return (
    <div className="flex w-full items-center gap-2.5">
      <Checkbox checked={checked} onChange={onChange} label={`[${tag}] ${text}`} />
      <p className="min-w-px flex-1 text-sm leading-normal text-text-strong">
        <span className="font-bold text-brand-deep">[{tag}]</span> {text}
      </p>
      {onOpen && (
        <button type="button" onClick={onOpen} aria-label={`${text} 약관 보기`} className="relative touch-target">
          <Img src="/icons/chevron-right.svg" size={18} />
        </button>
      )}
    </div>
  );
}

// 토글 50×30 (켜짐·꺼짐 그림)
export function Toggle({ on, onChange, label }: { on: boolean; onChange: (next: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className="relative h-[30px] w-[50px] shrink-0 touch-target"
    >
      <FillImg src={on ? "/ui/toggle-on.svg" : "/ui/toggle-off.svg"} className="inset-[0_0_-3.33%_0]" />
    </button>
  );
}

// 나이 칩 80×52: 선택(보라)·기본(흰)
export function AgeChip({ age, selected, onSelect }: { age: number; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={`flex h-[52px] w-20 items-center justify-center rounded-2xl type-moya-button whitespace-nowrap ${
        selected
          ? "bg-brand text-white drop-shadow-primary-sm"
          : "border-2 border-bubble-line bg-white text-text-strong drop-shadow-beige"
      }`}
    >
      {age}세
    </button>
  );
}

export function AgeChips({ value, onChange }: { value: number | null; onChange: (age: number) => void }) {
  return (
    <div role="radiogroup" aria-label="나이 (만)" className="flex w-full justify-between">
      {[5, 6, 7, 8].map((age) => (
        <AgeChip key={age} age={age} selected={value === age} onSelect={() => onChange(age)} />
      ))}
    </div>
  );
}

// 구분선 + 가운데 글 ("또는 이메일로")
export function TextDivider({ children }: { children: ReactNode }) {
  return (
    <div className="flex w-full items-center gap-2.5">
      <span className="h-[1.5px] min-w-px flex-1 bg-line-beige" />
      <span className="type-caption whitespace-nowrap text-text-faint">{children}</span>
      <span className="h-[1.5px] min-w-px flex-1 bg-line-beige" />
    </div>
  );
}

// 비밀번호 점 4칸 (입력한 개수만큼 채움)
export function PinDots({ count, label = "보호자 비밀번호" }: { count: number; label?: string }) {
  const n = Math.max(0, Math.min(4, count));
  return (
    <span role="img" aria-label={`${label} ${n}자리 입력됨`} className="relative block h-5 w-[134px]">
      <FillImg src={`/ui/pin-dots-${n}.svg`} className="inset-0" />
    </span>
  );
}

// 숫자 키패드 (354 폭, 키 58 높이, 간격 10). 누름 모양은 피그마에 없어 원형 버튼과 같은 방식
const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "back"] as const;

export function PinKeypad({ onDigit, onBackspace }: { onDigit: (d: string) => void; onBackspace: () => void }) {
  return (
    <div className="grid w-full grid-cols-3 gap-2.5">
      {KEYS.map((k, i) =>
        k === "" ? (
          <span key={i} className="h-[58px]" />
        ) : k === "back" ? (
          <button
            key={i}
            type="button"
            aria-label="지우기"
            onClick={onBackspace}
            className="flex h-[58px] items-center justify-center rounded-[18px] active:bg-brand-faint"
          >
            <Img src="/ui/backspace.svg" width={30} height={22} />
          </button>
        ) : (
          <button
            key={i}
            type="button"
            onClick={() => onDigit(k)}
            className="flex h-[58px] items-center justify-center rounded-[18px] border-2 border-line-beige bg-white type-moya-title-l text-text-strong shadow-key active:bg-brand-faint active:pt-[3px] active:shadow-round-press"
          >
            {k}
          </button>
        ),
      )}
    </div>
  );
}
