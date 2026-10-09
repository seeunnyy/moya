import Image from "next/image";

// public/ 그림을 피그마 크기 그대로 놓는다. 장식 그림이라 alt는 비운다(뜻은 버튼의 aria-label·글자가 맡음).
// SVG는 next/image가 자동으로 최적화 없이 보낸다.
export function Img({
  src,
  size,
  width,
  height,
  className = "",
}: {
  src: string;
  size?: number;
  width?: number;
  height?: number;
  className?: string;
}) {
  const w = width ?? size ?? 24;
  const h = height ?? size ?? 24;
  return (
    <Image
      src={src}
      alt=""
      width={w}
      height={h}
      className={`shrink-0 ${className}`}
      style={{ width: w, height: h }}
      draggable={false}
    />
  );
}

// 피그마처럼 그림이 틀 밖으로 넘치는 경우(마이크 빛, 꼬리 등): 틀 안에서 inset으로 늘린다.
export function FillImg({ src, className }: { src: string; className: string }) {
  return (
    <span className={`pointer-events-none absolute ${className}`}>
      <Image src={src} alt="" fill sizes="200px" draggable={false} />
    </span>
  );
}
