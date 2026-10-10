import { OnboardingSkeleton } from "@/components/ScreenSkeleton";

// /signup/consent — 1-4 음성 수집 동의 (180:7308). ?from=settings면 철회 후 재동의 모드
export default function Page() {
  return <OnboardingSkeleton code="1-4" name="음성 수집 동의" group={9} links={[{ label: "동의하고 다음", href: "/signup/pin" }]} />;
}
