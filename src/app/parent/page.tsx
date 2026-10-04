import { Header } from "@/components/Header";
import { PrivacyNotice } from "@/components/PrivacyNotice";
import { ScreenHeading } from "@/components/ScreenHeading";
import { boxClass } from "@/components/styles";

// /parent 보호자 (S8, Figma 프레임 없음 → Figma 헤더와 카드 박스로만 조립). 부모 리포트는 베타.
export default function ParentPage() {
  return (
    <>
      <Header title="보호자 화면" back={{ href: "/app", label: "홈으로" }} />
      <main className="flex flex-col gap-4 p-6">
        <ScreenHeading>저장·전송 안내</ScreenHeading>
        <div className={boxClass}>
          <PrivacyNotice />
        </div>
      </main>
    </>
  );
}
