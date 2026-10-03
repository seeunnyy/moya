"use client";

// 홈의 [모야한테 물어보기]. 이 기기에서 마이크 권한이 이미 허용돼 있으면 권한 안내를 건너뛰고 바로 묻기 화면으로 간다.
// 확인할 수 없으면 권한 안내(/app/mic)로 간다. 새 탭 열기(Ctrl·Cmd 클릭 등)는 그대로 둔다.

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { LinkButton } from "./Button";
import { micAlreadyGranted } from "./microphone";

export function AskMoyaLink({ className, children }: { className?: string; children: ReactNode }) {
  const router = useRouter();

  return (
    <LinkButton
      href="/app/mic"
      className={className}
      onClick={async (event) => {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        router.push((await micAlreadyGranted()) ? "/app/ask" : "/app/mic");
      }}
    >
      {children}
    </LinkButton>
  );
}
