"use client";

// 3-5 내 별과 로켓 (180:7683): 뒤로 + 제목, 요약(모은 별 · 연속 로켓 도장), 별 받은 기록(최근 4개), 별 모으는 법.
// 값은 모두 기기 저장값에서 계산한다 (progress.ts). 2-14 [좋아!]·헤더 별 개수·3-4(그룹 8)에서 온다.

import { useRouter } from "next/navigation";
import { starHistoryItems, starTotal, streakDays } from "@/lib/progress";
import { readMission, readStars } from "@/lib/storage";
import { KidTop } from "./KidTop";
import { useStored } from "./useStored";
import { TabBar } from "./ui/TabBar";
import { CircleButton } from "./ui/buttons";
import { StarHistoryList, StarRules, StatTile } from "./ui/mission";

export function StarsScreen() {
  const router = useRouter();
  const stars = useStored(readStars) ?? [];
  const mission = useStored(readMission);
  const now = new Date();
  const back = () => (window.history.length > 1 ? router.back() : router.push("/app/me"));

  return (
    <>
      <KidTop />
      <main className="flex flex-1 flex-col items-center gap-3 px-6 py-3.5">
        <div className="flex w-full items-center gap-2.5">
          <CircleButton size={44} icon="/icons/back.svg" label="이전 화면" onClick={back} />
          <h1 className="type-moya-title-m whitespace-nowrap text-text-strong">내 별과 로켓</h1>
        </div>
        <div className="flex w-full items-start gap-2.5">
          <StatTile icon="/icons/star-filled.svg" iconSize={30} value={`${starTotal(stars)}개`} label="모은 별" />
          <StatTile
            icon="/icons/rocket.svg"
            iconSize={24}
            value={`${mission ? streakDays(mission.stampDates, now) : 0}일`}
            label="연속 로켓 도장"
          />
        </div>
        <StarHistoryList items={starHistoryItems(stars, now)} />
        <StarRules />
      </main>
      <TabBar selected="me" />
    </>
  );
}
