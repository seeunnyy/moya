import { ParentSkeleton } from "@/components/ScreenSkeleton";

// /parent/settings — 5-4 설정 / 5-4a 알림, 5-7·5-8·5-9 확인 창 (180:7858)
export default function Page() {
  return <ParentSkeleton code="5-4" name="설정" group={10} links={[{ label: "아이 프로필", href: "/parent/settings/profile" }, { label: "보호자 비밀번호 변경", href: "/parent/settings/pin" }]} />;
}
