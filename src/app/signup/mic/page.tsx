import { OnboardingSkeleton } from "@/components/ScreenSkeleton";

// /signup/mic — 1-6 마이크 권한 안내 (180:7345). 1-7은 브라우저 권한 창
export default function Page() {
  return <OnboardingSkeleton code="1-6" name="마이크 권한 안내" group={9} links={[{ label: "나중에 할게요", href: "/signup/done" }]} />;
}
