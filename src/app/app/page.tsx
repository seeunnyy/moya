import { KidSkeleton } from "@/components/ScreenSkeleton";

// /app — 2-1 홈 (180:6819). 2-0·2-2~2-14·E-1·E-2는 이 주소의 askFlow 상태 (그룹 4~7, 11)
export default function Page() {
  return <KidSkeleton code="2-1" name="홈 (모야와 놀기)" group={4} tab="play" links={[{ label: "오늘의 단어", href: "/app/today" }]} />;
}
