// Figma 하단 탭 (03 §2, 1270:71): [홈] [단어 카드] [보호자]. 홈(/app)과 단어 카드 목록(/app/cards)에만 둔다.
// 칸마다 20px 회색 아이콘 자리 + 링크 글자. 현재 탭은 Figma에 구분이 없어 aria-current로만 알린다.

import Link from "next/link";

const TABS = [
  { key: "home", href: "/app", label: "홈" },
  { key: "cards", href: "/app/cards", label: "단어 카드" },
  { key: "parent", href: "/parent", label: "보호자" },
] as const;

type Props = {
  current: "home" | "cards";
};

export function BottomTabs({ current }: Props) {
  return (
    <nav aria-label="하단 탭" className="mt-auto shrink-0 border-t border-rule bg-tabbar">
      <ul className="flex gap-4">
        {TABS.map((tab) => (
          <li key={tab.key} className="flex min-w-0 flex-1">
            <Link
              href={tab.href}
              aria-current={tab.key === current ? "page" : undefined}
              className="flex flex-1 flex-col items-center justify-center gap-1 py-2"
            >
              <span aria-hidden className="size-5 rounded-box bg-line" />
              <span className="text-button text-muted underline">{tab.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
