import { RedirectIfSignedIn } from "@/components/gates";
import { OnboardingSkeleton } from "@/components/ScreenSkeleton";

// / — 1-1 시작 (180:7216). 이 기기에 로그인된 계정이 있으면 홈(2-1, /app)으로 보낸다.
export default function Page() {
  return (
    <RedirectIfSignedIn>
      <OnboardingSkeleton
        code="1-1"
        name="시작"
        group={9}
        back={false}
        links={[
          { label: "시작하기", href: "/signup" },
          { label: "이미 계정이 있어요", href: "/login" },
        ]}
      />
    </RedirectIfSignedIn>
  );
}
