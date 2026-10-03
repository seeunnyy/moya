// 헤더의 "<" + 화면 제목. 하단 탭이 없는 화면에서 돌아가는 길이다.
// 아이콘만 있는 버튼은 쓰지 않으므로 "<" 옆에 짧은 글자를 붙인다 (NFR-08).

import Link from "next/link";
import type { ReactNode } from "react";
import { buttonClass } from "./Button";
import { ScreenHeading } from "./ScreenHeading";

type Props = {
  href: string;
  backLabel: string; // 예: "홈"
  children: ReactNode; // 화면 제목
  focusKey?: string;
};

export function BackHeader({ href, backLabel, children, focusKey }: Props) {
  return (
    <header className="flex flex-col items-start gap-3">
      <Link href={href} className={buttonClass} aria-label={`${backLabel}으로 돌아가기`}>
        &lt; {backLabel}
      </Link>
      <ScreenHeading focusKey={focusKey}>{children}</ScreenHeading>
    </header>
  );
}
