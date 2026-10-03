// 하단 탭 [홈] [단어 카드] [보호자]. 홈(/app)과 단어 카드 목록(/app/cards)에만 둔다.

import Link from "next/link";
import { buttonClass } from "./Button";

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
    <nav aria-label="하단 탭" className="mt-auto pt-4">
      <ul className="grid grid-cols-3 gap-2">
        {TABS.map((tab) => (
          <li key={tab.key}>
            <Link
              href={tab.href}
              aria-current={tab.key === current ? "page" : undefined}
              className={`${buttonClass} w-full px-2 aria-[current=page]:border-dashed`}
            >
              {tab.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
