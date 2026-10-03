"use client";

// /app/mic 마이크 권한 안내 (S10, Figma 2).
// [권한 허용하기]: 브라우저 권한을 요청해 허용되면 묻기 화면, 거부되면 E1(/app/ask?mic=denied)로 간다.
// [나중에 할래]: 마이크 없이 묻기 화면으로 가서 텍스트·예시로 진행한다.

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, LinkButton } from "./Button";
import { BackHeader } from "./BackHeader";
import { ImageSlot } from "./ImageSlot";
import { closeMic, openMic } from "./microphone";

export function MicPermissionScreen() {
  const router = useRouter();
  const [asking, setAsking] = useState(false);

  async function allow() {
    setAsking(true);
    const stream = await openMic();
    // 권한만 확인하고 바로 닫는다. 녹음은 묻기 화면의 [녹음 시작]에서 다시 연다.
    if (stream) closeMic(stream);
    router.push(stream ? "/app/ask" : "/app/ask?mic=denied");
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-5 px-4 py-6">
      <BackHeader href="/app" backLabel="홈">
        마이크 권한 허용
      </BackHeader>
      <ImageSlot label="마이크 그림 자리" />
      <p className="text-lg break-keep">모야가 너의 목소리를 들으려면 마이크 권한이 필요해!</p>
      <Button onClick={allow} disabled={asking}>
        {asking ? "허용을 기다리는 중…" : "권한 허용하기"}
      </Button>
      <LinkButton href="/app/ask" className="border-dashed">
        나중에 할래
      </LinkButton>
    </main>
  );
}
