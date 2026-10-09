// 하단 탭바 (컴포넌트 보드 '탭바' 180:6388, 탭 아이템 상태 180:5756: 선택됨·기본·호버·누름·비활성)
// 탭 아이콘은 상태마다 색이 달라 그림이 따로 있다. 아래 여백은 46px과 기기 안전 영역 중 큰 쪽.

import Link from "next/link";
import { FillImg } from "./Img";

export type TabKey = "play" | "words" | "me";

const TABS: { key: TabKey; label: string; href: string }[] = [
  { key: "play", label: "모야와 놀기", href: "/app" },
  { key: "words", label: "단어 또 보기", href: "/app/dictionary" },
  { key: "me", label: "내 정보", href: "/app/me" },
];

function TabIcons({ k, selected }: { k: TabKey; selected: boolean }) {
  if (selected) return <FillImg src={`/tabs/${k}-selected.svg`} className="inset-0" />;
  return (
    <>
      <FillImg src={`/tabs/${k}-default.svg`} className="inset-0 group-hover:hidden group-active:hidden" />
      <FillImg src={`/tabs/${k}-hover.svg`} className="hidden inset-0 group-hover:block group-active:hidden" />
      <FillImg src={`/tabs/${k}-pressed.svg`} className="hidden inset-0 group-active:block" />
    </>
  );
}

export function TabBar({
  selected,
  hrefs,
  disabled = [],
}: {
  selected: TabKey;
  hrefs?: Partial<Record<TabKey, string>>; // 주소는 그룹 3 라우트 뼈대에서 확정 (기본값은 design.md 표)
  disabled?: TabKey[];
}) {
  return (
    <nav
      aria-label="아래 메뉴"
      className="w-full rounded-t-[28px] bg-white px-5 pt-3 shadow-tabbar pb-safe-46"
    >
      <ul className="flex items-center">
        {TABS.map((t) => {
          const isSelected = t.key === selected;
          const isDisabled = disabled.includes(t.key);
          const pill = isSelected
            ? "bg-brand-lavender"
            : isDisabled
              ? ""
              : "group-hover:bg-brand-faint group-active:bg-lavender-press";
          const text = isSelected
            ? "text-text-strong"
            : isDisabled
              ? "text-tab-disabled"
              : "text-text-faint group-hover:text-text-normal group-active:text-text-strong";
          const body = (
            <>
              <span className={`flex h-[34px] w-14 items-center justify-center rounded-[17px] ${pill}`}>
                <span className="relative size-[26px]">
                  {isDisabled ? (
                    <FillImg src={`/tabs/${t.key}-disabled.svg`} className="inset-0" />
                  ) : (
                    <TabIcons k={t.key} selected={isSelected} />
                  )}
                </span>
              </span>
              <span className={`w-[61px] text-center font-nanum-round text-xs leading-[14px] font-extrabold ${text}`}>
                {t.label}
              </span>
            </>
          );
          return (
            <li key={t.key} className="flex min-w-px flex-1 justify-center">
              {isDisabled ? (
                <span className="flex flex-col items-center gap-1" aria-disabled="true">
                  {body}
                </span>
              ) : (
                <Link
                  href={hrefs?.[t.key] ?? t.href}
                  aria-current={isSelected ? "page" : undefined}
                  className="group flex flex-col items-center gap-1 touch-target"
                >
                  {body}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
