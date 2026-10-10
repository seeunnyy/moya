// 개발·시연용 시드 (작업 3.7). 버튼을 누르면 이 기기 저장소에 정해 둔 상태를 넣고 그 화면으로 간다.
// 운영 빌드(next build/start)에서는 404. 어느 화면에서도 링크하지 않는다.

import { notFound } from "next/navigation";
import { SeedPanel } from "./SeedPanel";

export const metadata = { title: "시드 (개발용)", robots: { index: false } };

export default function DevSeedPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <SeedPanel />;
}
