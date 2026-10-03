"use client";

// 소리 버튼 ([🔈 들어보기], [음성 재생], 후보 카드 [들어보기]). 누르면 text를 처음부터 읽는다 (FR-08).
// 기기가 한국어 음성 출력을 못 하면 비활성으로 두고, 화면 글자만으로 진행한다.

import { useSyncExternalStore } from "react";
import { speaker } from "@/lib/services/speech";
import { Button } from "./Button";

// 브라우저가 음성 목록을 늦게 채우면 지원 여부가 바뀌므로 다시 확인한다.
function subscribe(onChange: () => void) {
  const synth = typeof window === "undefined" ? undefined : window.speechSynthesis;
  synth?.addEventListener?.("voiceschanged", onChange);
  return () => synth?.removeEventListener?.("voiceschanged", onChange);
}
const supportedOnClient = () => speaker.supported();
const supportedOnServer = () => true; // 서버에서는 켜진 모양으로 그리고, 브라우저에서 다시 확인한다

type Props = {
  label: string;
  text: string; // 읽을 문장
  ariaLabel?: string;
};

export function SoundButton({ label, text, ariaLabel }: Props) {
  const supported = useSyncExternalStore(subscribe, supportedOnClient, supportedOnServer);

  return (
    <Button
      onClick={() => speaker.speak(text)}
      disabled={!supported}
      aria-label={ariaLabel}
      title={supported ? undefined : "이 기기에서는 소리를 들을 수 없어요"}
    >
      {label}
    </Button>
  );
}
