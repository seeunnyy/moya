import { OnboardingSkeleton } from "@/components/ScreenSkeleton";

// /signup — 1-2 보호자 가입 (180:7233). 카카오·이메일 모두 기기 저장 mock
export default function Page() {
  return <OnboardingSkeleton code="1-2" name="보호자 가입" group={9} links={[{ label: "다음", href: "/signup/profile" }, { label: "약관 보기", href: "/terms" }]} />;
}
