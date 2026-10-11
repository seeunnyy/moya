import { RedirectIfSignedIn } from "@/components/gates";
import { StartScreen } from "@/components/OnboardingScreens";

// / — 1-1 시작 (180:7216). 이 기기에 로그인된 계정이 있으면 홈(2-1, /app)으로 보낸다.
export default function Page() {
  return (
    <RedirectIfSignedIn>
      <StartScreen />
    </RedirectIfSignedIn>
  );
}
