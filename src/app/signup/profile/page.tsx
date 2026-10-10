import { OnboardingSkeleton } from "@/components/ScreenSkeleton";

// /signup/profile — 1-3 아이 프로필 (180:7277)
export default function Page() {
  return <OnboardingSkeleton code="1-3" name="아이 프로필" group={9} links={[{ label: "다음", href: "/signup/consent" }]} />;
}
