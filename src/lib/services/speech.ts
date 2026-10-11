// 음성 출력 래퍼 — 브라우저 내장 speechSynthesis (외부 API 아님, design.md "녹음은 MediaRecorder, 음성 출력은 speechSynthesis").
// 한국어(ko-KR)로 읽는다. 지원하지 않는 기기·한국어 음성이 없는 기기에서는 아무것도 하지 않고, 화면 글자만으로 흐름이 이어진다 (FR-08).

// 테스트에서 가짜를 넣을 수 있게 필요한 것만 받는다.
export type SpeechEnv = {
  speechSynthesis?: Pick<SpeechSynthesis, "speak" | "cancel" | "getVoices">;
  SpeechSynthesisUtterance?: new (text: string) => SpeechSynthesisUtterance;
};

export type Speaker = {
  supported(): boolean;
  // 읽기 시작했으면 true. onEnd는 이 말이 끝나거나 실패했을 때 한 번 (다음 말에 끊기면 부르지 않는다) — 스피커 '재생 중' 표시용
  speak(text: string, onEnd?: () => void): boolean;
  stop(): void;
};

const LANG = "ko-KR";

export function createSpeaker(getEnv: () => SpeechEnv | undefined): Speaker {
  // 음성 목록이 이미 있는데 한국어가 하나도 없으면 영어 음성으로 엉뚱하게 읽으므로 쓰지 않는다.
  // 목록이 아직 비어 있으면(브라우저가 늦게 채움) lang만 정해 두고 브라우저에 맡긴다.
  function koreanVoice(env: SpeechEnv): SpeechSynthesisVoice | null | "none" {
    const voices = env.speechSynthesis?.getVoices() ?? [];
    if (voices.length === 0) return null;
    return voices.find((v) => v.lang.toLowerCase().startsWith("ko")) ?? "none";
  }

  function usable(env: SpeechEnv | undefined): env is Required<SpeechEnv> {
    return !!env?.speechSynthesis && !!env.SpeechSynthesisUtterance;
  }

  let current = 0; // 지금 읽는 말의 번호. 끊긴 말의 끝 알림은 버린다

  return {
    supported() {
      const env = getEnv();
      return usable(env) && koreanVoice(env) !== "none";
    },

    speak(text, onEnd) {
      const env = getEnv();
      if (!usable(env) || !text.trim()) return false;
      const voice = koreanVoice(env);
      if (voice === "none") return false;
      try {
        env.speechSynthesis.cancel(); // 읽던 말은 끊고 새 말을 처음부터
        const id = ++current;
        const utterance = new env.SpeechSynthesisUtterance(text);
        utterance.lang = LANG;
        if (onEnd) {
          const done = () => {
            if (id === current) onEnd();
          };
          utterance.onend = done;
          utterance.onerror = done;
        }
        if (voice) utterance.voice = voice;
        env.speechSynthesis.speak(utterance);
        return true;
      } catch {
        return false;
      }
    },

    stop() {
      current += 1;
      const env = getEnv();
      try {
        env?.speechSynthesis?.cancel();
      } catch {
        // 멈추지 못해도 흐름은 계속한다
      }
    },
  };
}

// 브라우저용 하나. 서버 렌더링에서는 window가 없어 아무것도 하지 않는다.
export const speaker = createSpeaker(() =>
  typeof window === "undefined" ? undefined : (window as unknown as SpeechEnv),
);
