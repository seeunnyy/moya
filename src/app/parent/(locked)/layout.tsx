import type { ReactNode } from "react";
import { RequireParentUnlock } from "@/components/gates";

// 잠금을 풀어야 들어가는 보호자 화면. 풀지 않고 주소로 바로 들어오면 5-1(/parent)로 보낸다.
// (locked)는 주소에 나오지 않는 묶음 폴더다.
export default function LockedLayout({ children }: { children: ReactNode }) {
  return <RequireParentUnlock>{children}</RequireParentUnlock>;
}
