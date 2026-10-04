"use client";

// /app 아이 모드 홈 (S9, Figma 1270:84).
// 복습 배너·[복습하기]는 반복 학습(베타)이라 눌러도 동작하지 않는다. 배너의 N은 저장한 카드 수, 0개면 숨긴다.

import Link from "next/link";
import { BottomTabs } from "./BottomTabs";
import { LinkButton } from "./Button";
import { Header } from "./Header";
import { ImageSlot } from "./ImageSlot";
import { ScreenHeading } from "./ScreenHeading";
import { boxClass } from "./styles";
import { useSavedWords } from "./useSavedWords";

export function HomeScreen() {
  const saved = useSavedWords();
  const cardCount = saved?.cards.length ?? 0;

  return (
    <>
      <Header title="아이 모드 홈 화면" />
      <main className="flex flex-col items-start gap-4 p-6">
        <div className="flex w-full flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <ImageSlot className="h-[160px] w-full" />
            <ScreenHeading>안녕! 나 모야야 👋</ScreenHeading>
            <p className="text-body font-semibold">오늘도 같이 단어 알아보자!</p>
          </div>

          {cardCount > 0 && (
            <div className={boxClass}>
              <div className="flex h-[72px] items-center gap-3">
                <ImageSlot className="h-12 flex-1" />
                <div className="flex h-[72px] min-w-0 flex-1 flex-col gap-1">
                  <p className="text-body font-semibold">오늘 복습할 단어가 있어요!</p>
                  <p className="text-caption">저장한 단어 {cardCount}개를 다시 만나봐요</p>
                </div>
              </div>
            </div>
          )}

          <section aria-labelledby="home-menu" className="flex flex-col gap-4">
            <h2 id="home-menu" className="text-title font-bold">
              뭐 할까?
            </h2>
            <div className="flex flex-col gap-3">
              {/* 권한 확인은 음성 녹음 화면의 [녹음 시작]에서 한다 */}
              <Link href="/app/ask" className={boxClass}>
                <span className="flex flex-col items-center gap-2">
                  <ImageSlot className="h-20 w-full" />
                  <span className="text-body font-semibold">모야한테 물어보기</span>
                  <span className="text-caption">모르는 단어를 말해봐!</span>
                </span>
              </Link>
              <div className="flex h-[140px] gap-3">
                <Link href="/app/cards" className={`${boxClass} min-w-0 flex-1`}>
                  <span className="flex flex-col items-center gap-2">
                    <ImageSlot className="h-16 w-full" />
                    <span className="text-body font-semibold">단어 카드</span>
                    <span className="text-caption">저장한 단어 보기</span>
                  </span>
                </Link>
                <div className={`${boxClass} min-w-0 flex-1`}>
                  <div className="flex flex-col items-center gap-2">
                    <ImageSlot className="h-16 w-full" />
                    <p className="text-body font-semibold">복습하기</p>
                    <p className="text-caption">베타</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <LinkButton href="/app/mic" className="self-start">
            마이크 사용 방법 안내
          </LinkButton>
        </div>
        <LinkButton href="/parent">보호자 메뉴</LinkButton>
      </main>
      <BottomTabs current="home" />
    </>
  );
}
