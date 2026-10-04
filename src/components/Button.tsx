// Figma 버튼 3종 (03 §2): primary(1270:7) / secondary(1270:9) / 링크(1270:3).
// 보이는 크기는 Figma 그대로, 누르는 영역은 touch-target으로 48px 이상 (NFR-08, design.md W3).

import Link from "next/link";
import type { ComponentProps } from "react";

export type ButtonVariant = "primary" | "secondary" | "link";

const base =
  "touch-target inline-flex shrink-0 items-center justify-center whitespace-nowrap text-button disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<ButtonVariant, string> = {
  primary: "min-w-[60px] rounded-box bg-ink px-4 py-2 font-medium text-white",
  secondary: "min-w-[60px] rounded-box border border-ink bg-white px-4 py-2 font-medium text-ink",
  link: "font-normal text-muted underline",
};

function buttonClass(variant: ButtonVariant = "primary") {
  return `${base} ${variants[variant]}`;
}

type ButtonProps = ComponentProps<"button"> & { variant?: ButtonVariant };

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  return <button type="button" className={`${buttonClass(variant)} ${className}`} {...props} />;
}

type LinkButtonProps = ComponentProps<typeof Link> & { variant?: ButtonVariant };

export function LinkButton({ variant = "link", className = "", ...props }: LinkButtonProps) {
  return <Link className={`${buttonClass(variant)} ${className}`} {...props} />;
}
