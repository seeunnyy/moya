// /app 아이 모드 홈 (S9, Figma 1). 스타일은 최소. 캐릭터·색·폰트는 디자인 작업에서 입힌다.
// "오늘 복습할 단어가 있어요" 배너는 반복 학습(베타)이라 만들지 않는다.

import Link from "next/link";
import { Button, LinkButton } from "./Button";
import { BottomTabs } from "./BottomTabs";
import { ImageSlot } from "./ImageSlot";
import { ScreenHeading } from "./ScreenHeading";

const textLinkClass = "inline-flex min-h-12 items-center underline underline-offset-4 break-keep";

export function HomeScreen() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-5 px-4 py-6">
      <ImageSlot label="모야 캐릭터 자리" />
      <div className="flex flex-col gap-1">
        <ScreenHeading>안녕! 나 모야야 👋</ScreenHeading>
        <p className="text-lg break-keep">오늘도 같이 단어 알아보자!</p>
      </div>

      <section aria-labelledby="home-menu" className="flex flex-col gap-3">
        <h2 id="home-menu" className="text-xl font-bold">
          뭐 할까?
        </h2>
        <LinkButton href="/app/mic" className="min-h-24 text-xl">
          모야한테 물어보기
        </LinkButton>
        <LinkButton href="/app/cards" className="min-h-20 flex-col">
          <span>단어 카드</span>
          <span className="text-sm font-normal">저장한 단어 보기</span>
        </LinkButton>
        <Button disabled className="min-h-20 flex-col border-dashed">
          <span>복습하기</span>
          <span className="text-sm font-normal">베타 · 곧 열려요</span>
        </Button>
      </section>

      <div className="flex flex-col items-start">
        <Link href="/app/mic" className={textLinkClass}>
          마이크 사용 방법 안내
        </Link>
        <Link href="/parent" className={textLinkClass}>
          보호자 메뉴
        </Link>
      </div>

      <BottomTabs current="home" />
    </main>
  );
}
