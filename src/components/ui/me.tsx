// 3-4 내 정보 부품 (180:7527): 프로필, 숫자 칸(눌러서 이동), 이번 주 로켓 도장, 보호자 메뉴 줄

import Link from "next/link";
import { Img } from "./Img";
import { IconCircle } from "./bars";

// 프로필: 아바타 72 + 이름(제목 L) + 캡션 (180:7531)
export function ProfileSummary({ name, caption }: { name: string; caption: string }) {
  return (
    <div className="flex w-full items-center gap-4 rounded-3xl p-[18px]">
      <Img src="/icons/avatar.svg" size={72} />
      <p className="flex min-w-px flex-1 flex-col items-start gap-0.5 whitespace-nowrap">
        <span className="type-moya-title-l text-text-strong">{name}</span>
        <span className="type-caption text-text-normal">{caption}</span>
      </p>
    </div>
  );
}

// 숫자 칸: 아이콘 + 값(제목 M) + 이름(캡션), 누르면 이동 (180:7545)
export function StatLink({
  href,
  icon,
  iconSize,
  value,
  label,
}: {
  href: string;
  icon: string;
  iconSize: number;
  value: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex min-w-px flex-1 flex-col items-center gap-1 rounded-[20px] px-2.5 py-3.5 whitespace-nowrap active:bg-brand-faint"
    >
      <Img src={icon} size={iconSize} />
      <span className="type-moya-title-m text-text-strong">{value}</span>
      <span className="type-caption text-text-normal">{label}</span>
    </Link>
  );
}

const WEEKDAYS = ["월", "화", "수", "목", "금", "토", "일"];

// 이번 주 로켓 도장 (180:7562): 월~일 7칸. 찍은 날 라임 + 로켓, 아직 안 찍은 오늘 점선 + 진보라 요일, 그 밖 빈 칸
export function WeekStampBoard({ days }: { days: { date: string; stamped: boolean; isToday: boolean }[] }) {
  return (
    <section className="flex w-full flex-col items-start gap-3 rounded-[22px] bg-brand-faint p-4">
      <h2 className="type-moya-label whitespace-nowrap text-text-strong">이번 주 로켓 도장</h2>
      <ol className="flex w-full items-start justify-between">
        {days.map((d, i) => (
          <li key={d.date} className="flex flex-col items-center gap-1.5">
            <span className={`type-caption whitespace-nowrap ${d.isToday ? "text-brand-deep" : "text-text-normal"}`}>
              {WEEKDAYS[i]}
            </span>
            {d.stamped ? (
              <span className="flex size-9 items-center justify-center rounded-[18px] bg-lime" aria-label="로켓 도장">
                <Img src="/icons/rocket.svg" size={20} />
              </span>
            ) : d.isToday ? (
              <span className="size-9 rounded-[18px] border-2 border-dashed border-brand-light bg-white" />
            ) : (
              <span className="size-9 rounded-[18px] bg-stamp-empty" />
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

// 메뉴 줄 (3-4 보호자 메뉴 180:7604): 아주 연한 보라, 아이콘 원 40 + 굵은 제목 + 캡션 + 화살표 18
export function MenuLinkRow({ href, icon, title, caption }: { href: string; icon: string; title: string; caption: string }) {
  return (
    <Link
      href={href}
      className="flex w-full items-center gap-3 rounded-[20px] bg-brand-faint py-3.5 pr-4 pl-3.5 active:bg-brand-lavender"
    >
      <IconCircle icon={icon} size={40} />
      <span className="flex min-w-px flex-1 flex-col items-start gap-px whitespace-nowrap">
        <span className="type-body-bold text-text-strong">{title}</span>
        <span className="type-caption text-text-normal">{caption}</span>
      </span>
      <Img src="/icons/chevron-right.svg" size={18} />
    </Link>
  );
}
