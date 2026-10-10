import { KidSkeleton } from "@/components/ScreenSkeleton";

// /app/today — 3-3 오늘의 단어 / 3-3a 카드 모았다 (180:7515, 180:7613)
export default function Page() {
  return <KidSkeleton code="3-3" name="오늘의 단어" group={8} tab="play" links={[{ label: "내일 또 볼래", href: "/app" }]} />;
}
