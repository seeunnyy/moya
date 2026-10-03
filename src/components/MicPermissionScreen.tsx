// /app/mic 마이크 권한 안내 (S10, Figma 2).
// 지금은 두 버튼 모두 묻기 화면으로 간다. 실제 권한 요청(getUserMedia)은 작업 10.4에서 [권한 허용하기]에 붙인다.

import { LinkButton } from "./Button";
import { BackHeader } from "./BackHeader";
import { ImageSlot } from "./ImageSlot";

export function MicPermissionScreen() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-5 px-4 py-6">
      <BackHeader href="/app" backLabel="홈">
        마이크 권한 허용
      </BackHeader>
      <ImageSlot label="마이크 그림 자리" />
      <p className="text-lg break-keep">모야가 너의 목소리를 들으려면 마이크 권한이 필요해!</p>
      <LinkButton href="/app/ask">권한 허용하기</LinkButton>
      <LinkButton href="/app/ask" className="border-dashed">
        나중에 할래
      </LinkButton>
    </main>
  );
}
