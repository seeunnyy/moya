"use client";

import { useRouter } from "next/navigation";
import { ParentSkeleton } from "@/components/ScreenSkeleton";

// /parent/home — 5-2 보호자 홈 (180:7784). [아이 모드로 돌아가기]는 2-1로.
// 보호자 주소를 벗어나면 잠금 상태를 가진 /parent 레이아웃이 사라져 다시 잠긴다.
// (여기서 먼저 잠그면 잠금 화면으로 가는 이동이 2-1 이동을 앞지른다)
export default function Page() {
  const router = useRouter();
  return (
    <ParentSkeleton
      code="5-2"
      name="보호자 홈"
      group={10}
      links={[
        { label: "설정", href: "/parent/settings" },
        { label: "물어볼 단어", href: "/parent/words" },
        { label: "아이 모드로 돌아가기", onClick: () => router.push("/app") },
      ]}
    />
  );
}
