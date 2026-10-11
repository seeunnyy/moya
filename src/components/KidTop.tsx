"use client";

// 아이 화면 공통 헤더 + 2-0 오늘의 미션 시트 (design.md "모든 아이 화면 공통": 아바타·미션 별 → 2-0, 별 개수 → 3-5).
// 별·미션은 기기 저장값을 그대로 보여 준다. [지금 물어볼래]는 /app이면 바로 듣기(2-2), 다른 화면이면 /app으로 가서 듣기.

import { useRouter } from "next/navigation";
import { useState } from "react";
import { missionStars, monthDay, starTotal } from "@/lib/progress";
import { readMission, readStars } from "@/lib/storage";
import { useStored } from "./useStored";
import { KidHeader } from "./ui/KidHeader";
import { MissionSheetContent } from "./ui/mission";
import { BottomSheet } from "./ui/overlays";

export const LISTEN_PARAM = "listen"; // /app?listen=1 → 열리자마자 듣기 (2-0 [지금 물어볼래])

export function KidTop({
  onAsk,
  starsHidden = 0,
}: {
  onAsk?: () => void; // 없으면 /app?listen=1로
  starsHidden?: number; // 아직 보여 주지 않을 별 (2-13: 미션 별 +3은 2-14에서 보인다)
}) {
  const router = useRouter();
  const stars = useStored(readStars);
  const mission = useStored(readMission);
  const [sheet, setSheet] = useState(false);
  const now = new Date();
  const done = mission ? missionStars(mission, now) : 0;

  return (
    <>
      <KidHeader
        stars={Math.max(0, (stars ? starTotal(stars) : 0) - starsHidden)}
        missionDone={done}
        onOpenMission={() => setSheet(true)}
        onOpenStars={() => router.push("/app/me/stars")}
      />
      {sheet && (
        <BottomSheet label="오늘의 미션" onClose={() => setSheet(false)}>
          <MissionSheetContent
            date={monthDay(now)}
            done={done}
            onClose={() => setSheet(false)}
            onAsk={() => {
              setSheet(false);
              if (onAsk) onAsk();
              else router.push(`/app?${LISTEN_PARAM}=1`);
            }}
          />
        </BottomSheet>
      )}
    </>
  );
}
