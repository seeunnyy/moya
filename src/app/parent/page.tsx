"use client";

import { useRouter } from "next/navigation";
import { useParentLock } from "@/components/gates";
import { ParentSkeleton, type SkeletonLink } from "@/components/ScreenSkeleton";

// /parent — 5-1 보호자 비밀번호 입력 / 5-1a 틀림 (180:7768, 180:7902). "×"는 내 정보(3-4)로 (T7).
// 키패드는 그룹 10. 그 전까지 개발 중에만 잠금을 푸는 버튼을 둔다 (운영 빌드에는 없음).
export default function Page() {
  const router = useRouter();
  const { unlock } = useParentLock();
  const links: SkeletonLink[] = [{ label: "비밀번호를 잊으셨나요?", href: "/parent/reset" }];
  if (process.env.NODE_ENV === "development") {
    links.push({
      label: "개발용: 잠금 풀기",
      onClick: () => {
        unlock();
        router.push("/parent/home");
      },
    });
  }
  return (
    <ParentSkeleton
      code="5-1"
      name="보호자 비밀번호"
      group={10}
      left="close"
      onLeft={() => router.push("/app/me")}
      links={links}
    />
  );
}
