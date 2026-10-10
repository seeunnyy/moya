import { OnboardingSkeleton } from "@/components/ScreenSkeleton";

// /signup/pin — 1-5 보호자 비밀번호 만들기 → 1-5a 확인 (180:7414, 180:7480). 단계는 컴포넌트 상태
export default function Page() {
  return <OnboardingSkeleton code="1-5 / 1-5a" name="보호자 비밀번호 만들기" group={9} links={[{ label: "다음", href: "/signup/mic" }]} />;
}
