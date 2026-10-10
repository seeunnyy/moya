import { OnboardingSkeleton } from "@/components/ScreenSkeleton";

// /login — 1-0 로그인 (180:7434). 저장된 계정이 있을 때만 홈으로 (그룹 9)
export default function Page() {
  return <OnboardingSkeleton code="1-0" name="로그인" group={9} />;
}
