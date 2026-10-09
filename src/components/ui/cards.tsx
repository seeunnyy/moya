// 카드류 (컴포넌트 보드: 후보 카드 180:6725, 맥락 칩 180:6753, 단어 카드 타일 180:6768, 큰 단어 카드 180:6789, 별 진행 180:6704)
// 글자 타일(2-9)·'내가 말한 소리' 칩(2-10·3-2)도 여기 둔다.

import type { ReactNode } from "react";
import { Img } from "./Img";
import { SpeakerButton } from "./buttons";

// 별 진행 0~3 (별 20, 간격 2)
export function StarProgress({ count, label }: { count: number; label?: string }) {
  return (
    <span className="flex items-start gap-0.5" role={label ? "img" : undefined} aria-label={label}>
      {[0, 1, 2].map((i) => (
        <Img key={i} src={i < count ? "/icons/star-filled.svg" : "/icons/star-empty.svg"} size={20} />
      ))}
    </span>
  );
}

// '내가 말한 소리' 줄: 라벨 + 라벤더 칩(인식 글자 + 작은 스피커)
export function SoundChip({ spoken, onSpeak }: { spoken: string; onSpeak?: () => void }) {
  return (
    <span className="flex items-center gap-2">
      <span className="type-caption whitespace-nowrap text-text-faint">내가 말한 소리</span>
      <span className="flex items-center gap-1.5 rounded-full bg-brand-lavender py-[3px] pr-1.5 pl-3">
        <span className="type-moya-label whitespace-nowrap text-brand-deep">{spoken}</span>
        <SpeakerButton size={24} onClick={onSpeak} label={`내가 말한 소리 ${spoken} 듣기`} />
      </span>
    </span>
  );
}

// 글자 타일 (2-9): 단어를 한 글자씩 68px 칸에
export function LetterTiles({ word }: { word: string }) {
  return (
    <span className="flex items-start gap-2.5" role="img" aria-label={word}>
      {Array.from(word).map((ch, i) => (
        <span
          key={i}
          className="flex size-[68px] items-center justify-center rounded-[18px] border-[2.5px] border-line-lavender bg-white shadow-letter"
        >
          <span className="font-jua text-[36px] leading-[1.15] text-text-strong">{ch}</span>
        </span>
      ))}
    </span>
  );
}

// 후보 카드 (2-6): 카드 전체가 고르기 버튼, 스피커는 소리만(따로 누름). 상태: 기본·누름·선택됨
export function CandidateCard({
  word,
  hint,
  image,
  selected = false,
  onSelect,
  onSpeak,
}: {
  word: string;
  hint: string;
  image: string;
  selected?: boolean;
  onSelect?: () => void;
  onSpeak?: () => void;
}) {
  const look = selected
    ? "border-[3px] border-brand bg-brand-faint drop-shadow-lavender-lg"
    : "border-2 border-line-beige bg-white drop-shadow-beige-lg active:bg-brand-faint active:drop-shadow-beige-pressed";
  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected || undefined}
        className={`flex w-full items-center gap-3.5 rounded-[22px] py-3 pr-4 pl-3 text-left ${look}`}
      >
        <span className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-cream">
          <Img src={image} size={54} />
        </span>
        <span className="flex min-w-px flex-1 flex-col items-start gap-0.5 overflow-hidden">
          <span className="type-moya-title-l whitespace-nowrap text-text-strong">{word}</span>
          <span className="type-body-small text-text-normal">{hint}</span>
        </span>
        <span className="size-[30px] shrink-0" aria-hidden="true" />
      </button>
      <span className={`absolute top-1/2 flex -translate-y-1/2 ${selected ? "right-[17px]" : "right-[18px]"}`}>
        <SpeakerButton onClick={onSpeak} label={`${word} 듣기`} />
      </span>
      {selected && (
        <span className="pointer-events-none absolute -top-[13px] -right-[11px] flex size-7 items-center justify-center rounded-[14px] border-2 border-white bg-brand">
          <Img src="/icons/check-white.svg" size={18} />
        </span>
      )}
    </div>
  );
}

// 맥락 칩 (2-5 들은 곳): 기본·선택됨
export function ContextChip({
  label,
  icon,
  selected = false,
  onClick,
}: {
  label: string;
  icon: string;
  selected?: boolean;
  onClick?: () => void;
}) {
  const look = selected
    ? "border-[3px] border-brand bg-brand-faint drop-shadow-lavender"
    : "border-2 border-line-beige bg-white drop-shadow-beige";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`relative flex h-[104px] w-[100px] flex-col items-center justify-center gap-2 rounded-[22px] ${look}`}
    >
      <span className="flex size-12 items-center justify-center rounded-3xl bg-brand-lavender">
        <Img src={icon} size={28} />
      </span>
      <span className="type-moya-label whitespace-nowrap text-text-strong">{label}</span>
      {selected && (
        <span className="absolute -top-[11px] left-[79px] flex size-[26px] items-center justify-center rounded-[13px] border-2 border-white bg-brand">
          <Img src="/icons/check-white.svg" size={16} />
        </span>
      )}
    </button>
  );
}

export type CardTint = "yellow" | "lime" | "green" | "lavender" | "sky";
const TINT_BG: Record<CardTint, string> = {
  yellow: "bg-tint-yellow",
  lime: "bg-tint-lime",
  green: "bg-tint-green",
  lavender: "bg-tint-lavender",
  sky: "bg-tint-sky",
};

// 단어 카드 타일 (3-1 지구 사전): 상태 새 단어(NEW)·복습 중(별 1)·다 앎(별 3 + 도장). 색은 단어마다
export function WordTile({
  word,
  image,
  stars,
  isNew = false,
  mastered = false,
  tint = "yellow",
  imageSize = 92,
  onClick,
  className = "",
}: {
  word: string;
  image: string;
  stars: number;
  isNew?: boolean;
  mastered?: boolean;
  tint?: CardTint;
  imageSize?: number;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex flex-col items-center gap-1.5 rounded-3xl border-[3px] border-white pt-3.5 pb-4 drop-shadow-tile ${TINT_BG[tint]} ${className}`}
    >
      <Img src={image} size={imageSize} />
      <span className="type-moya-title-m whitespace-nowrap text-text-strong">{word}</span>
      <StarProgress count={stars} />
      {isNew && (
        <span className="absolute top-[7px] left-[7px] rounded-full bg-coral px-2 py-0.5 type-moya-label text-white">
          NEW
        </span>
      )}
      {mastered && (
        <span className="absolute top-[7px] right-[7px] flex size-[34px] items-center justify-center rounded-[17px] border-2 border-white bg-lime">
          <Img src="/icons/check.svg" size={20} />
        </span>
      )}
    </button>
  );
}

// 큰 단어 카드 — 간단 (2-4 확인 질문, 3-3 오늘의 단어): 그림 132, 단어, 힌트(굵게), 스피커
export function WordCardSimple({
  word,
  hint,
  image,
  onSpeak,
  className = "",
}: {
  word: string;
  hint: string; // 줄바꿈은 \n
  image: string;
  onSpeak?: () => void;
  className?: string;
}) {
  return (
    <div
      className={`flex w-full flex-col items-center gap-2.5 overflow-hidden rounded-[28px] border-2 border-line-beige bg-white py-[22px] shadow-card ${className}`}
    >
      <Img src={image} size={132} />
      <p className="type-moya-word whitespace-nowrap text-text-strong">{word}</p>
      {hint && <p className="text-center type-body-bold whitespace-pre-line text-text-normal">{hint}</p>}
      <SpeakerButton onClick={onSpeak} label={`${word} 듣기`} />
    </div>
  );
}

// 큰 단어 카드 — 자세히 (2-10 카드 획득, 3-2 카드 상세)
export function WordCardDetailed({
  word,
  image,
  status,
  date,
  tint = "lime",
  spoken,
  onSpeakSpoken,
  explanation,
  example,
  stars,
  reviewText,
  className = "",
}: {
  word: string;
  image: string;
  status: string; // "새 카드" | "복습 중" | "다 앎"
  date: string; // 예: "10월 9일"
  tint?: CardTint;
  spoken?: string; // 내가 말한 소리 (기록 삭제 뒤에는 없음)
  onSpeakSpoken?: () => void;
  explanation: string;
  example: string; // 비어 있으면 줄을 숨김
  stars: number;
  reviewText: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex w-full flex-col items-center gap-2.5 overflow-hidden rounded-[28px] border-2 border-line-beige bg-white pb-[22px] shadow-card ${className}`}
    >
      <div className={`flex w-full items-center justify-between px-[18px] py-2.5 ${TINT_BG[tint]}`}>
        <span className="flex items-center gap-1.5">
          <Img src="/icons/card-book.svg" size={20} />
          <span className="type-moya-label whitespace-nowrap text-text-strong">{status}</span>
        </span>
        <span className="type-caption whitespace-nowrap text-text-normal">{date}</span>
      </div>
      <Img src={image} size={120} />
      <p className="type-moya-word whitespace-nowrap text-text-strong">{word}</p>
      {spoken && <SoundChip spoken={spoken} onSpeak={onSpeakSpoken} />}
      <span className="h-0.5 w-[306px] max-w-[calc(100%-44px)] bg-line-beige" />
      <p className="w-[306px] max-w-[calc(100%-44px)] text-center type-body text-text-strong">{explanation}</p>
      {example && (
        <p className="w-[306px] max-w-[calc(100%-44px)] text-center type-body-small text-text-normal">예) {example}</p>
      )}
      <span className="flex items-center gap-2">
        <StarProgress count={stars} />
        <span className="type-caption whitespace-nowrap text-text-normal">{reviewText}</span>
      </span>
    </div>
  );
}
