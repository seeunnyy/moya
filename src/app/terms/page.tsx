import { OnboardingSkeleton } from "@/components/ScreenSkeleton";

// /terms — 1-2a 약관 보기 (180:7457). [확인했어요]·"<"는 브라우저 뒤로
export default function Page() {
  return <OnboardingSkeleton code="1-2a" name="약관 보기" group={9} />;
}
