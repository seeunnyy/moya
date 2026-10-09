// 모야 말풍선 (컴포넌트 보드 '말풍선' 180:6681): 꼬리 아래·위·왼쪽·없음, 오른쪽에 다시 듣기 버튼.
// 대사는 화면에 보이고, 바뀔 때 보조기기가 읽도록 aria-live로 둔다(child-accessibility).

import { FillImg } from "./Img";
import { SpeakerButton } from "./buttons";

const TAIL = {
  down: { src: "/ui/bubble-tail-down.svg", box: "-bottom-[14px] left-1/2 h-[14px] w-6 -translate-x-1/2" },
  up: { src: "/ui/bubble-tail-up.svg", box: "-top-[14px] left-1/2 h-[14px] w-6 -translate-x-1/2" },
  left: { src: "/ui/bubble-tail-left.svg", box: "top-1/2 -left-[14px] h-6 w-[14px] -translate-y-1/2" },
} as const;

export function SpeechBubble({
  text,
  tail = "down",
  onSpeak,
  playing = false,
  className = "",
}: {
  text: string; // 줄바꿈은 \n
  tail?: keyof typeof TAIL | "none";
  onSpeak?: () => void; // 없으면 스피커를 두지 않는다
  playing?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`relative flex items-center gap-3 rounded-[18px] border-2 border-bubble-line bg-white py-[18px] pr-4 pl-[22px] drop-shadow-bubble ${className}`}
    >
      <p aria-live="polite" className="min-w-px flex-1 type-moya-bubble whitespace-pre-line text-text-strong">
        {text}
      </p>
      {onSpeak && <SpeakerButton onClick={onSpeak} playing={playing} label="모야 말 다시 듣기" />}
      {tail !== "none" && (
        <span className={`absolute ${TAIL[tail].box}`}>
          <FillImg src={TAIL[tail].src} className="inset-0" />
        </span>
      )}
    </div>
  );
}
