import { OnboardingSkeleton } from "@/components/ScreenSkeleton";

// /signup/done — 1-8 아이 모드 시작 (180:7397)
export default function Page() {
  return <OnboardingSkeleton code="1-8" name="아이 모드 시작" group={9} back={false} links={[{ label: "아이 모드 시작하기", href: "/app" }]} />;
}
