"use client";

// 겹쳐 뜨는 부품 (2-0 미션 시트 180:7049, 5-7 확인 창 180:8062, 5-3a 알림 180:7965, 어두운 배경 180:8061)
// 앱 틀(최대 402px) 안에 겹치고, Esc·바깥 누름으로 닫는다.

import { useEffect, useRef, type ReactNode } from "react";
import { Img } from "./Img";
import { Button } from "./buttons";

function useEscape(onClose: () => void) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
}

function Overlay({ onClose, label, children }: { onClose: () => void; label: string; children: ReactNode }) {
  useEscape(onClose);
  return (
    <div className="fixed inset-0 z-50 mx-auto max-w-[402px]" role="dialog" aria-modal="true" aria-label={label}>
      <button type="button" aria-label="닫기" onClick={onClose} className="absolute inset-0 bg-dim" />
      {children}
    </div>
  );
}

// 바텀 시트: 크림 바탕, 위 모서리 32, 손잡이 44×5
export function BottomSheet({ onClose, label, children }: { onClose: () => void; label: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => ref.current?.focus(), []);
  return (
    <Overlay onClose={onClose} label={label}>
      <div
        ref={ref}
        tabIndex={-1}
        className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-4 rounded-t-[32px] bg-cream px-6 pt-3 pb-[max(42px,env(safe-area-inset-bottom))]"
      >
        <span className="h-[5px] w-11 rounded-[3px] bg-sheet-handle" aria-hidden="true" />
        {children}
      </div>
    </Overlay>
  );
}

// 확인 창: 제목(보호자/소제목) + 설명(본문) + [취소][확인]. 지우기·철회는 danger, 로그아웃은 primary
export function ConfirmDialog({
  title,
  body,
  cancelLabel = "취소",
  confirmLabel,
  tone = "danger",
  onCancel,
  onConfirm,
}: {
  title: string;
  body: string;
  cancelLabel?: string;
  confirmLabel: string;
  tone?: "danger" | "primary";
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Overlay onClose={onCancel} label={title}>
      <div className="absolute top-1/2 left-1/2 flex w-[350px] max-w-[calc(100%-32px)] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-3 rounded-[26px] bg-white px-[22px] pt-[26px] pb-[22px]">
        <p className="w-full text-center type-parent-subtitle text-text-strong">{title}</p>
        <p className="w-full text-center type-body text-text-normal">{body}</p>
        <div className="flex w-full gap-2.5 pt-2">
          <Button variant="secondary" onClick={onCancel} className="min-w-px flex-1">
            {cancelLabel}
          </Button>
          <Button variant={tone} onClick={onConfirm} className="min-w-px flex-1">
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Overlay>
  );
}

// 알림(토스트): 진한 바탕 + 라임 체크. 위치는 화면이 정한다
export function Toast({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      role="status"
      className={`flex items-center gap-2.5 rounded-[18px] bg-text-strong py-3.5 pr-[18px] pl-3.5 ${className}`}
    >
      <span className="flex size-6 shrink-0 items-center justify-center rounded-xl bg-lime">
        <Img src="/icons/check.svg" size={14} />
      </span>
      <p className="min-w-px flex-1 type-body-bold text-white">{children}</p>
    </div>
  );
}
