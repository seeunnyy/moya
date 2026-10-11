import { ConsentScreen } from "@/components/OnboardingScreens";

// /signup/consent — 1-4 음성 수집 동의 (180:7308). ?from=settings면 철회 후 재동의 모드 (5-8 → 1-4 → 5-4)
export default async function Page({ searchParams }: PageProps<"/signup/consent">) {
  const { from } = await searchParams;
  return <ConsentScreen fromSettings={from === "settings"} />;
}
