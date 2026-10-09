// 개발용 부품 모음 (작업 2.6). 피그마와 겹쳐 비교할 때만 쓴다.
// 운영 빌드(next build/start)에서는 404. 어느 화면에서도 링크하지 않는다.

import { notFound } from "next/navigation";
import { ComponentGallery } from "./ComponentGallery";

export const metadata = { title: "부품 모음 (개발용)", robots: { index: false } };

export default function DevComponentsPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <ComponentGallery />;
}
