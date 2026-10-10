import type { ReactNode } from "react";
import { ParentLockProvider, RequireAccount } from "@/components/gates";

// 보호자 화면(/parent/*): 계정이 없으면 시작(1-1)으로. 잠금 해제 상태는 여기(메모리)에만 두어
// 보호자 주소 안에서 옮겨 다니는 동안만 유지되고, 새로고침하거나 아이 화면으로 나가면 다시 잠긴다.
export default function ParentLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAccount>
      <ParentLockProvider>{children}</ParentLockProvider>
    </RequireAccount>
  );
}
