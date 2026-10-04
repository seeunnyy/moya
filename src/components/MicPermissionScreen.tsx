"use client";

// /app/mic 마이크 권한 안내 (S10, Figma 1270:141).
// [권한 허용하기]: 브라우저 권한을 요청해 허용되면 음성 녹음 화면, 거부되면 폴백(E1, /app/ask?mic=denied)으로 간다.
// [나중에 할래]: 홈으로 간다. "<": 이전 화면 (이전 화면이 없으면 홈).

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, LinkButton } from "./Button";
import { Header } from "./Header";
import { ImageSlot } from "./ImageSlot";
import { closeMic, openMic } from "./microphone";
import { ScreenHeading } from "./ScreenHeading";

export function MicPermissionScreen() {
  const router = useRouter();
  const [asking, setAsking] = useState(false);

  async function allow() {
    setAsking(true);
    const stream = await openMic();
    // 권한만 확인하고 바로 닫는다. 녹음은 음성 녹음 화면의 [녹음 시작]에서 다시 연다.
    if (stream) closeMic(stream);
    router.push(stream ? "/app/ask" : "/app/ask?mic=denied");
  }

  function back() {
    if (window.history.length > 1) router.back();
    else router.push("/app");
  }

  return (
    <>
      <Header title="마이크 권한 안내 화면" back={{ onClick: back, label: "이전 화면" }} />
      <main className="p-6">
        <div className="flex flex-col items-center gap-6">
          <ImageSlot className="h-[120px] w-full" />
          <ScreenHeading className="text-body font-semibold">마이크 권한 허용</ScreenHeading>
          <div className="flex w-full flex-col items-center gap-3 text-caption">
            <p>모야가 너의 목소리를 들으려면</p>
            <p>마이크 권한이 필요해!</p>
          </div>
          <div className="flex w-full flex-col items-start gap-4">
            <Button onClick={allow} disabled={asking}>
              권한 허용하기
            </Button>
            <LinkButton href="/app" variant="secondary">
              나중에 할래
            </LinkButton>
          </div>
        </div>
      </main>
    </>
  );
}
