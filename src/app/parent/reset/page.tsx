import { ParentSkeleton } from "@/components/ScreenSkeleton";

// /parent/reset — 5-1b 보호자 비밀번호 재설정 (180:7918). 메일을 보내지 않고 5-1로
export default function Page() {
  return <ParentSkeleton code="5-1b" name="비밀번호 재설정" group={10} links={[{ label: "재설정 링크 보내기", href: "/parent" }]} />;
}
