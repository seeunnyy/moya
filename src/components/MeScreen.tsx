"use client";

// 3-4 내 정보 (180:7527): 프로필(이름 · 만 ○세 · 모야랑 ○일째), 숫자 칸(모은 별 · 연속 학습 → 3-5, 지구 사전 → 3-1),
// 이번 주 로켓 도장, 보호자 메뉴 → 5-1. 값은 모두 기기 저장값에서 계산한다.

import { daysWithMoya, starTotal, streakDays, weekStamps } from "@/lib/progress";
import { readCards, readMission, readProfile, readStars } from "@/lib/storage";
import { KidTop } from "./KidTop";
import { useStored } from "./useStored";
import { TabBar } from "./ui/TabBar";
import { MenuLinkRow, ProfileSummary, StatLink, WeekStampBoard } from "./ui/me";

export function MeScreen() {
  const profile = useStored(readProfile);
  const stars = useStored(readStars) ?? [];
  const mission = useStored(readMission);
  const cards = useStored(readCards) ?? [];
  const now = new Date();
  const stampDates = mission?.stampDates ?? [];

  return (
    <>
      <KidTop />
      <main className="flex flex-1 flex-col items-center gap-3.5 px-6 pt-[18px] pb-3.5">
        <ProfileSummary
          name={profile?.nickname ?? ""}
          caption={profile ? `만 ${profile.age}세 · 모야랑 ${daysWithMoya(profile.createdAt, now)}일째` : ""}
        />
        <div className="flex w-full items-start gap-2.5">
          <StatLink href="/app/me/stars" icon="/icons/star-filled.svg" iconSize={26} value={`${starTotal(stars)}`} label="모은 별" />
          <StatLink
            href="/app/me/stars"
            icon="/icons/rocket.svg"
            iconSize={20}
            value={`${streakDays(stampDates, now)}일`}
            label="연속 학습"
          />
          <StatLink href="/app/dictionary" icon="/icons/card-book.svg" iconSize={24} value={`${cards.length}장`} label="지구 사전" />
        </div>
        <WeekStampBoard days={weekStamps(stampDates, now)} />
        <MenuLinkRow href="/parent" icon="/icons/lock.svg" title="보호자 메뉴" caption="보호자 비밀번호로 열어요" />
      </main>
      <TabBar selected="me" />
    </>
  );
}
