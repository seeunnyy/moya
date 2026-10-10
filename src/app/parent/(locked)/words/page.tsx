import { ParentSkeleton } from "@/components/ScreenSkeleton";

// /parent/words — 5-3 물어볼 단어 / 5-3a 알림 (180:7829, 180:7934)
export default function Page() {
  return <ParentSkeleton code="5-3" name="물어볼 단어" group={10} />;
}
