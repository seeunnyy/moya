// Figma 헤더 (03 §2, 1270:142): 왼쪽 "<"(20px 칸) + 화면 이름 가운데 + 오른쪽 20px 빈칸.
// 홈·단어 카드 목록은 "<" 없이 화면 이름만 둔다. 화면 이름은 h1이 아니다 (h1은 본문 제목, ScreenHeading).
// "<"는 글자 없이 aria-label만 단다 (와이어프레임 단계 예외, design.md W4).

import Link from "next/link";

export type HeaderBack =
  | { href: string; label: "홈으로" | "이전 화면" | "목록으로" }
  | { onClick: () => void; label: "홈으로" | "이전 화면" | "목록으로" };

type Props = {
  title: string; // Figma 화면 이름 (예: "음성 녹음 화면")
  back?: HeaderBack;
};

const backClass = "touch-target flex w-5 shrink-0 items-center justify-center text-title text-ink";

export function Header({ title, back }: Props) {
  return (
    <header className="flex shrink-0 items-center gap-4 border-b border-rule bg-white px-6 py-3">
      {back &&
        ("href" in back ? (
          <Link href={back.href} aria-label={back.label} className={backClass}>
            &lt;
          </Link>
        ) : (
          <button type="button" onClick={back.onClick} aria-label={back.label} className={backClass}>
            &lt;
          </button>
        ))}
      <p className="min-w-0 flex-1 text-center text-body font-medium">{title}</p>
      {back && <div aria-hidden className="w-5 shrink-0" />}
    </header>
  );
}
