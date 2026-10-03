// 최소 스타일 버튼. 글자 필수, 터치 영역 48px 이상 (NFR-08). 색·폰트는 디자인 작업에서 입힌다.

import Link from "next/link";
import type { ComponentProps } from "react";

export const buttonClass =
  "inline-flex min-h-12 min-w-12 items-center justify-center rounded-lg border-2 border-current px-4 py-2 text-base font-semibold break-keep disabled:cursor-not-allowed disabled:opacity-60";

export function Button({ className = "", ...props }: ComponentProps<"button">) {
  return <button type="button" className={`${buttonClass} ${className}`} {...props} />;
}

export function LinkButton({ className = "", ...props }: ComponentProps<typeof Link>) {
  return <Link className={`${buttonClass} ${className}`} {...props} />;
}
