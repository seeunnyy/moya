"use client";

// 화면 본문 제목(h1). 화면이 열리거나 focusKey가 바뀌면 제목으로 포커스를 옮겨,
// 키보드·스크린 리더 사용자가 새 화면 처음부터 진행하게 한다 (NFR-08).
// 모양은 화면마다 Figma 값이 달라 className으로 받는다.

import { useEffect, useRef, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  focusKey?: string; // 같은 페이지 안에서 화면이 바뀌는 경우(묻기 흐름의 상태)
  className?: string;
};

export function ScreenHeading({ children, focusKey, className = "text-title font-bold" }: Props) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, [focusKey]);

  return (
    <h1 ref={ref} tabIndex={-1} className={className}>
      {children}
    </h1>
  );
}
