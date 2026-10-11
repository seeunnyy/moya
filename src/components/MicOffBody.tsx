"use client";

// E-2 마이크가 꺼져 있어요 (180:8444) 가운데 부분. 아이 묻기(/app)와 온보딩 1-6 거부 뒤에 같이 쓴다.
// 말풍선 290 + 모야 150(당황, 크림판) + 보호자 안내(피그마 문구 그대로, iPhone Safari 기준) + [↻ 다시 해 볼래] + 점선 버튼.
// below: 점선 버튼 아래에 겹쳐 두는 것(아이 묻기의 [글자로 물어볼래] — 레이아웃에 끼우지 않아 나머지는 피그마 자리 그대로).
// replace: 안내·버튼 자리를 바꿔 끼울 것(아이 묻기의 폴백).

import type { ReactNode } from "react";
import { MoyaImage } from "./ui/Moya";
import { SpeechBubble } from "./ui/SpeechBubble";
import { Button } from "./ui/buttons";
import { GuideBox } from "./ui/notices";

export const MIC_OFF_LINE = "마이크가 꺼져 있어서\n네 목소리가 안 들려!";

export function MicOffBody({
  onSpeak,
  playing,
  onRetry,
  secondary,
  below,
  replace,
}: {
  onSpeak: () => void;
  playing: boolean;
  onRetry: () => void; // 권한을 다시 요청 (브라우저가 이미 차단했으면 권한 창 없이 그대로)
  secondary: { label: string; icon?: string; onClick: () => void };
  below?: ReactNode;
  replace?: ReactNode;
}) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3 px-6 pt-[18px] pb-[14px]">
      <SpeechBubble text={MIC_OFF_LINE} onSpeak={onSpeak} playing={playing} className="w-[290px] max-w-full" />
      <MoyaImage expression="confused" background="cream" size={150} />
      {replace ?? (
        <>
          <GuideBox title="보호자님, 이렇게 켜 주세요" steps={["1. 설정 앱을 열어요", "2. Safari → 마이크를 눌러요", "3. ‘허용’으로 바꿔요"]} />
          <Button icon="/icons/retry-white.svg" onClick={onRetry}>
            다시 해 볼래
          </Button>
          <div className="relative w-full">
            <Button variant="dashed" icon={secondary.icon} onClick={secondary.onClick}>
              {secondary.label}
            </Button>
            {below}
          </div>
        </>
      )}
    </main>
  );
}
