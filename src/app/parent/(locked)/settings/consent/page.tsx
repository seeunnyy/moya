import { ConsentScreen } from "@/components/OnboardingScreens";

// /parent/settings/consent — 5-8 철회 뒤 1-4 음성 수집 동의 (180:7308). 보호자 주소 안에 두어 잠금이 풀린 채로
// 다시 동의하면 5-4로 돌아간다 (T8)
export default function Page() {
  return <ConsentScreen fromSettings />;
}
