import { KidSkeleton } from "@/components/ScreenSkeleton";

// /app/me — 3-4 내 정보 (180:7527)
export default function Page() {
  return <KidSkeleton code="3-4" name="내 정보" group={8} tab="me" links={[{ label: "내 별과 로켓", href: "/app/me/stars" }, { label: "보호자 메뉴", href: "/parent" }]} />;
}
