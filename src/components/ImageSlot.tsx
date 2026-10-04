// Figma 이미지 자리 (03 §2): 사각 1270:62 "Image" / 원형 1270:64 "Aa".
// 모야 캐릭터·단어 그림·파형은 디자인 전까지 이 자리로 둔다. 장식이라 보조기기에는 읽히지 않게 한다.

type Props = {
  shape?: "square" | "circle";
  className?: string; // 크기 (예: "h-[160px] w-full")
};

export function ImageSlot({ shape = "square", className = "size-16" }: Props) {
  if (shape === "circle") {
    return (
      <div
        aria-hidden
        className={`flex shrink-0 items-center justify-center rounded-full bg-line text-label text-white ${className}`}
      >
        Aa
      </div>
    );
  }
  return (
    <div
      aria-hidden
      className={`flex min-h-12 min-w-12 shrink-0 items-center justify-center overflow-hidden rounded-box border border-dashed border-line bg-surface text-label text-placeholder ${className}`}
    >
      Image
    </div>
  );
}
