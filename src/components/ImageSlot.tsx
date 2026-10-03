// 이미지 자리 (D6). 디자인 전까지 이름 붙인 점선 박스로 둔다. 그림 데이터는 추가하지 않는다.

type Props = {
  label: string; // 예: "모야 캐릭터 자리"
  className?: string; // 높이 등
};

export function ImageSlot({ label, className = "h-32" }: Props) {
  return (
    <div
      className={`flex items-center justify-center rounded-lg border-2 border-dashed border-current p-2 text-center text-sm break-keep ${className}`}
    >
      {label}
    </div>
  );
}
