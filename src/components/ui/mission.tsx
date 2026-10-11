"use client";

// 오늘의 미션·별 부품: 보상 칩(2-0 180:7066, 2-14 180:7169), 미션 시트 내용(2-0 180:7049),
// 미션 성공 창(2-14 180:7164), 3-5 요약 칸(180:7691)·별 받은 기록(180:7706)·별 모으는 법(180:7732)

import type { ReactNode } from "react";
import { Img } from "./Img";
import { MissionTracker } from "./KidHeader";
import { MoyaImage, Sparkle } from "./Moya";
import { IconCircle } from "./bars";
import { Button } from "./buttons";

// 보상 칩: 흰 알약 + 베이지 테두리 1.5, 모야/라벨. 2-0은 작게(그림자 없음), 2-14는 크게(아래 그림자 3)
export function RewardChip({ icon, children, size = "sm" }: { icon: string; children: ReactNode; size?: "sm" | "lg" }) {
  const look = size === "sm" ? "gap-1 py-1.5 pr-3 pl-2" : "gap-1.5 py-2 pr-3.5 pl-2.5 shadow-beige-sm";
  return (
    <span className={`flex items-center rounded-full border-[1.5px] border-line-beige bg-white ${look}`}>
      <Img src={icon} size={size === "sm" ? 20 : 22} />
      <span className="type-moya-label whitespace-nowrap text-text-strong">{children}</span>
    </span>
  );
}

const Rewards = ({ size }: { size: "sm" | "lg" }) => (
  <>
    <RewardChip icon="/icons/star-filled.svg" size={size}>
      별 +3
    </RewardChip>
    <RewardChip icon="/icons/rocket.svg" size={size}>
      로켓 도장 +1
    </RewardChip>
  </>
);

// 2-0 오늘의 미션 시트 안: 제목·날짜, 미션(마이크 48 + "모르는 말 3개 물어보기" + 미션 칸 40), 보상, 버튼 2개
export function MissionSheetContent({
  date,
  done,
  onAsk,
  onClose,
}: {
  date: string;
  done: number;
  onAsk: () => void;
  onClose: () => void;
}) {
  return (
    <>
      <div className="flex w-full items-center justify-between whitespace-nowrap">
        <h2 className="type-moya-title-l text-text-strong">오늘의 미션</h2>
        <p className="type-caption text-text-normal">{date}</p>
      </div>
      <div className="flex w-full items-center gap-3.5 p-4">
        <IconCircle icon="/icons/mic.svg" size={48} />
        <div className="flex min-w-px flex-1 flex-col items-start gap-2">
          <p className="type-moya-title-m whitespace-nowrap text-text-strong">모르는 말 3개 물어보기</p>
          <MissionTracker done={done} size={40} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="type-body-bold whitespace-nowrap text-text-normal">다 하면</span>
        <Rewards size="sm" />
      </div>
      <Button icon="/icons/mic-white.svg" onClick={onAsk}>
        지금 물어볼래
      </Button>
      <Button variant="dashed" onClick={onClose}>
        닫기
      </Button>
    </>
  );
}

// 2-14 오늘의 미션 성공 창: 어두운 배경(50%) 위 크림 카드(흰 테두리 4) + 반짝이. 바깥을 눌러도 닫히지 않는다([좋아!]만)
export function MissionSuccess({ onOk }: { onOk: () => void }) {
  return (
    <div className="fixed inset-0 z-50 mx-auto max-w-[402px]" role="dialog" aria-modal="true" aria-label="오늘의 미션 성공">
      {/* 뒤 화면의 반짝이 (피그마에서 어두운 배경 아래) */}
      <Sparkle size={18} className="top-[188px] left-[30px]" />
      <Sparkle size={14} color="purple" className="top-[200px] left-[360px]" />
      <div className="absolute inset-0 bg-dim-strong" />
      {/* 카드: 가로 가운데, 세로는 가운데보다 11px 위 (402×812에서 피그마 y 246.5 − 62) */}
      <div className="absolute top-[calc(50%-11px)] left-1/2 w-[340px] max-w-[calc(100%-32px)] -translate-x-1/2 -translate-y-1/2">
        <div className="flex flex-col items-center gap-3 rounded-[32px] border-4 border-white bg-cream p-6 motion-safe:animate-pop">
          <MoyaImage expression="excited" background="cream" size={150} />
          <h2 className="type-moya-title-xl whitespace-nowrap text-text-strong">오늘의 미션 성공!</h2>
          <p className="type-body-bold whitespace-nowrap text-text-normal">모르는 말 3개를 물어봤어</p>
          <div className="flex items-start gap-2">
            <Rewards size="lg" />
          </div>
          <Button autoFocus icon="/icons/check-white.svg" onClick={onOk}>
            좋아!
          </Button>
        </div>
        <Sparkle size={26} className="-top-[76.5px] left-[9px]" />
        <Sparkle size={18} color="purple" className="-top-[66.5px] left-[313px]" />
        <Sparkle size={16} color="pink" className="top-[393.5px] left-[325px]" />
        <Sparkle size={20} className="top-[373.5px] -left-[5px]" />
      </div>
    </div>
  );
}

// 3-5 요약 칸 (아주 연한 보라, 모서리 20): 아이콘 + 큰 값 + 캡션
export function StatTile({ icon, iconSize, value, label }: { icon: string; iconSize: number; value: string; label: string }) {
  return (
    <div className="flex min-w-px flex-1 items-center gap-2.5 rounded-[20px] bg-brand-faint p-3.5">
      <Img src={icon} size={iconSize} />
      <p className="flex flex-col items-start whitespace-nowrap">
        <span className="type-moya-title-m text-text-strong">{value}</span>
        <span className="type-caption text-text-normal">{label}</span>
      </p>
    </div>
  );
}

// 3-5 별 받은 기록 (최근 4개, 없으면 안내 — PM 확인 2026-10-11)
export function StarHistoryList({ items }: { items: { title: string; when: string; amount: number; at: string }[] }) {
  return (
    <section className="flex w-full flex-col items-start rounded-[22px] px-4 pt-3.5 pb-1.5">
      <h2 className="type-moya-label text-text-strong">별 받은 기록</h2>
      {items.length === 0 ? (
        <p className="py-2.5 type-caption whitespace-pre-line text-text-faint">
          {"아직 받은 별이 없어.\n모르는 말을 물어보면 별을 받아!"}
        </p>
      ) : (
        <ul className="flex w-full flex-col">
          {items.map((it) => (
            <li key={`${it.at}-${it.title}`} className="flex w-full items-center gap-2.5 py-2.5">
              <Img src="/icons/star-filled.svg" size={18} />
              <p className="flex min-w-px flex-1 flex-col items-start whitespace-nowrap">
                <span className="type-body-bold text-text-strong">{it.title}</span>
                <span className="type-caption text-text-faint">{it.when}</span>
              </p>
              <span className="type-moya-title-m whitespace-nowrap text-brand-deep">+{it.amount}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// 3-5 별은 이렇게 모아요 (피그마 문구 그대로. "모야에게 설명하기"는 베타 복습 기능의 별)
const STAR_RULES = [
  ["새 단어 카드 모으기", "+1"],
  ["모야에게 설명하기", "+2"],
  ["오늘의 미션 성공", "+3 · 로켓 도장"],
] as const;

export function StarRules() {
  return (
    <section className="flex w-full flex-col items-start gap-2 rounded-[20px] bg-brand-faint px-4 py-3.5 whitespace-nowrap">
      <h2 className="type-moya-label text-brand-deep">별은 이렇게 모아요</h2>
      {STAR_RULES.map(([label, value]) => (
        <p key={label} className="flex w-full items-center justify-between">
          <span className="type-body text-text-strong">{label}</span>
          <span className="type-body-bold text-brand-deep">{value}</span>
        </p>
      ))}
    </section>
  );
}
