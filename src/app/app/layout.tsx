import type { ReactNode } from "react";
import { RequireAccount } from "@/components/gates";

// 아이 화면(/app/*): 이 기기에 로그인된 계정이 없으면 시작(1-1)으로 보낸다.
export default function KidLayout({ children }: { children: ReactNode }) {
  return <RequireAccount>{children}</RequireAccount>;
}
