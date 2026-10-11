import { ConsentScreen } from "@/components/OnboardingScreens";

// /signup/consent — 1-4 음성 수집 동의 (180:7308). 설정에서 철회한 뒤 다시 동의하는 1-4는 /parent/settings/consent
// (잠금 유지, T8). ?from=settings도 같은 모드로 남겨 둔다
export default async function Page({ searchParams }: PageProps<"/signup/consent">) {
  const { from } = await searchParams;
  return <ConsentScreen fromSettings={from === "settings"} />;
}
