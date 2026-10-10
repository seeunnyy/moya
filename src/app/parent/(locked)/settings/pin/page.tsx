import { ParentSkeleton } from "@/components/ScreenSkeleton";

// /parent/settings/pin — 5-6 보호자 비밀번호 변경 (180:8200)
export default function Page() {
  return <ParentSkeleton code="5-6" name="비밀번호 변경" group={10} />;
}
