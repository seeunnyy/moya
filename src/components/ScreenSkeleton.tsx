"use client";

// 라우트 뼈대 (작업 3.1). 화면 속은 그룹 4~11에서 만든다. 지금은 화면 번호·이름과 이동 확인용 버튼만 보인다.
// 아이 화면은 헤더(별·미션은 저장된 값)와 하단 탭, 온보딩은 상단 바, 보호자는 제목이 있는 상단 바.

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { MISSION_GOAL, missionStars, starTotal } from "@/lib/progress";
import { readMission, readStars } from "@/lib/storage";
import { KidHeader } from "./ui/KidHeader";
import { TabBar, type TabKey } from "./ui/TabBar";
import { TopBar } from "./ui/bars";
import { Button } from "./ui/buttons";
import { useStored } from "./useStored";

export type SkeletonLink = { label: string; href?: string; onClick?: () => void };

type Body = {
  code: string; // 화면 번호 (예: "2-1")
  name: string;
  group: number; // 화면 속을 만들 그룹
  links?: SkeletonLink[];
  children?: ReactNode;
};

function SkeletonBody({ code, name, group, links = [], children }: Body) {
  const router = useRouter();
  return (
    <main className="flex flex-1 flex-col items-center gap-3 px-6 py-10 text-center">
      <p className="type-moya-title-l text-brand-deep">{code}</p>
      <h1 className="type-moya-title-m text-text-strong">{name}</h1>
      <p className="type-caption text-text-faint">뼈대 화면 · 화면 속은 그룹 {group}에서 만들어요</p>
      {children}
      {links.length > 0 && (
        <div className="mt-4 flex w-full flex-col gap-3">
          {links.map((l) => (
            <Button
              key={l.label}
              variant="secondary"
              onClick={l.onClick ?? (() => l.href && router.push(l.href))}
            >
              {l.label}
            </Button>
          ))}
        </div>
      )}
    </main>
  );
}

export function KidSkeleton({ tab, children, ...body }: Body & { tab?: TabKey }) {
  const router = useRouter();
  const stars = useStored(readStars);
  const mission = useStored(readMission);
  return (
    <>
      <KidHeader
        stars={stars ? starTotal(stars) : 0}
        missionDone={mission ? missionStars(mission, new Date()) : 0}
        onOpenStars={() => router.push("/app/me/stars")}
      />
      <SkeletonBody {...body}>
        {children}
        {mission && (
          <p className="type-caption text-text-normal">
            오늘의 미션 {missionStars(mission, new Date())}/{MISSION_GOAL}
          </p>
        )}
      </SkeletonBody>
      <TabBar selected={tab ?? "play"} />
    </>
  );
}

export function OnboardingSkeleton({ back = true, ...body }: Body & { back?: boolean }) {
  const router = useRouter();
  return (
    <>
      <TopBar left={back ? "back" : undefined} onLeft={() => router.back()} />
      <SkeletonBody {...body} />
    </>
  );
}

export function ParentSkeleton({
  left = "back",
  onLeft,
  ...body
}: Body & { left?: "back" | "close"; onLeft?: () => void }) {
  const router = useRouter();
  return (
    <div className="flex min-h-dvh flex-col bg-parent-bg">
      <TopBar left={left} title={body.name} onLeft={onLeft ?? (() => router.back())} />
      <SkeletonBody {...body} />
    </div>
  );
}
