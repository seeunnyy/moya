import { KidSkeleton } from "@/components/ScreenSkeleton";

// /app/dictionary/[cardId] — 3-2 ~ 3-2e 카드 상세. 없는 id면 3-1로 (그룹 8, T15)
export default function Page() {
  return <KidSkeleton code="3-2" name="카드 상세" group={8} tab="words" links={[{ label: "지구 사전", href: "/app/dictionary" }]} />;
}
