import { KidSkeleton } from "@/components/ScreenSkeleton";

// /app/me/stars — 3-5 내 별과 로켓 (180:7683)
export default function Page() {
  return <KidSkeleton code="3-5" name="내 별과 로켓" group={7} tab="me" />;
}
