// 모야 그림·무대 (모야 표정 180:6098, 2-1 '모야 무대' 180:6824, '오늘의 단어 버튼' 180:6836)

import Image, { getImageProps } from "next/image";
import type { ButtonHTMLAttributes } from "react";
import { preload } from "react-dom";
import { FillImg, Img } from "./Img";

// 표정 심볼 이름: 인사·설명·궁금·당황·신남. 화면의 심볼은 투명판(clear)을 쓴다
export type MoyaExpression = "greet" | "explain" | "curious" | "confused" | "excited";

export function MoyaImage({
  expression,
  size,
  background = "clear",
  priority = false,
  className = "",
}: {
  expression: MoyaExpression;
  size: number;
  background?: "clear" | "cream";
  priority?: boolean;
  className?: string;
}) {
  return (
    <Image
      {...moyaProps(expression, size, background)}
      alt=""
      preload={priority}
      className={`shrink-0 object-contain ${className}`}
      style={{ width: size, height: size }}
      draggable={false}
    />
  );
}

function moyaProps(expression: MoyaExpression, size: number, background: "clear" | "cream") {
  return { src: `/moya/moya-${expression}-${background}.png`, width: size, height: size, sizes: `${size}px` };
}

// 다음 화면의 모야 그림을 미리 받아 둔다 (그림이 커서 화면이 바뀐 뒤 늦게 뜨지 않게). 화면을 그릴 때 부른다.
// 화면의 <Image>와 같은 srcset으로 받아야 브라우저가 같은 파일로 알아본다.
export function preloadMoya(expression: MoyaExpression, size: number, background: "clear" | "cream" = "clear") {
  const { props } = getImageProps({ ...moyaProps(expression, size, background), alt: "" });
  preload(props.src, { as: "image", imageSrcSet: props.srcSet, imageSizes: props.sizes });
}

// 모야 무대: 뒤 빛(300) + 바닥 그림자(170×24) + 모야(290). 2-1 홈 기준 위치
export function MoyaStage({ expression = "explain" }: { expression?: MoyaExpression }) {
  return (
    <div className="relative h-[276px] w-[300px]" aria-hidden="true">
      <span className="absolute -top-[22px] left-0 size-[300px]">
        <FillImg src="/ui/stage-glow.svg" className="inset-0" />
      </span>
      <span className="absolute top-[252px] left-[65px] h-6 w-[170px]">
        <FillImg src="/ui/stage-shadow.svg" className="inset-[-16.67%_-2.35%]" />
      </span>
      <span className="absolute -top-[14px] left-[5px]">
        <MoyaImage expression={expression} size={290} priority />
      </span>
    </div>
  );
}

// 홈의 오늘의 단어 선물 버튼: 선물 그림 60 + 이름, 아직 안 봤으면 빨간 점
export function GiftButton({
  hasNew = false,
  className = "",
  ...rest
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & { hasNew?: boolean }) {
  return (
    <button
      type="button"
      aria-label={hasNew ? "오늘의 단어 (새 단어 있음)" : "오늘의 단어"}
      className={`relative flex w-[60px] flex-col items-center gap-0.5 ${className}`}
      {...rest}
    >
      <Img src="/words/seonmul.svg" size={60} />
      <span className="type-caption whitespace-nowrap text-text-normal">오늘의 단어</span>
      {hasNew && (
        <span className="absolute top-0.5 left-[50px] size-3.5">
          <FillImg src="/ui/new-dot.svg" className="inset-[-14.29%]" />
        </span>
      )}
    </button>
  );
}

// 소리 물결 30×44 (2-2 180:6846·180:6852). 그림 26.5×43을 피그마 inset 그대로 놓고, 왼쪽은 좌우 뒤집는다
function SoundWave({ side }: { side: "left" | "right" }) {
  return (
    <span className="relative h-11 w-[30px] shrink-0 overflow-clip">
      <span className={`absolute top-[0.5px] h-[43px] w-[26.5px] ${side === "left" ? "left-px -scale-x-100" : "left-[2.5px]"}`}>
        {/* 모션: 물결이 울렁 (스토리보드 장면 4). 좌우 뒤집기와 겹치지 않게 안쪽에 */}
        <span className={`absolute inset-0 motion-safe:animate-wave ${side === "right" ? "[animation-delay:0.45s]" : ""}`}>
          <FillImg src="/ui/sound-wave.svg" className="inset-0" />
        </span>
      </span>
    </span>
  );
}

// 듣는 중 모야 (2-2 '모야 + 소리 물결' 180:6845): 물결 + 모야 270 + 물결
export function MoyaListening() {
  return (
    <div className="flex items-center" aria-hidden="true">
      <SoundWave side="left" />
      <MoyaImage expression="curious" background="cream" size={270} />
      <SoundWave side="right" />
    </div>
  );
}

// 반짝이 (2-1 180:6834, 1-1 180:7227~7231, 1-8 180:7410·180:7412). 같은 모양, 색 3가지 × 크기
const SPARKLE_COLOR = { yellow: "/ui/sparkle.svg", purple: "/ui/sparkle-purple.svg", pink: "/ui/sparkle-pink.svg" } as const;

export function Sparkle({
  size = 18,
  color = "yellow",
  className = "",
}: {
  size?: number;
  color?: keyof typeof SPARKLE_COLOR;
  className?: string;
}) {
  return (
    <span className={`pointer-events-none absolute ${className}`} aria-hidden="true">
      {/* 모션: 반짝반짝 (크기마다 박자를 조금씩 어긋나게) */}
      <span className="block motion-safe:animate-twinkle" style={{ animationDelay: `${(size % 5) * 0.35}s` }}>
        <Img src={SPARKLE_COLOR[color]} size={size} />
      </span>
    </span>
  );
}
