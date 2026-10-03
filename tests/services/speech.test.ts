import { test } from "node:test";
import assert from "node:assert/strict";
import { createSpeaker, type SpeechEnv } from "../../src/lib/services/speech.ts";

type Voice = { lang: string; name: string };

function fakeEnv(voices: Voice[]) {
  const log: string[] = [];
  const spoken: { text: string; lang: string; voice?: Voice }[] = [];
  class Utterance {
    text: string;
    lang = "";
    voice?: Voice;
    constructor(text: string) {
      this.text = text;
    }
  }
  const env = {
    speechSynthesis: {
      speak: (u: Utterance) => {
        log.push("speak");
        spoken.push({ text: u.text, lang: u.lang, voice: u.voice });
      },
      cancel: () => log.push("cancel"),
      getVoices: () => voices,
    },
    SpeechSynthesisUtterance: Utterance,
  } as unknown as SpeechEnv;
  return { env, log, spoken };
}

test("ko-KR로 읽고, 한국어 음성이 있으면 그 음성을 쓴다", () => {
  const ko = { lang: "ko-KR", name: "Korean" };
  const { env, spoken } = fakeEnv([{ lang: "en-US", name: "English" }, ko]);
  const s = createSpeaker(() => env);
  assert.equal(s.supported(), true);
  assert.equal(s.speak("수박 말하는 거야? 여름에 먹는 크고 둥근 과일!"), true);
  assert.deepEqual(spoken, [{ text: "수박 말하는 거야? 여름에 먹는 크고 둥근 과일!", lang: "ko-KR", voice: ko }]);
});

test("새로 읽기 전에 읽던 말을 끊는다 ([들어보기]는 처음부터 다시)", () => {
  const { env, log } = fakeEnv([{ lang: "ko-KR", name: "Korean" }]);
  const s = createSpeaker(() => env);
  s.speak("첫 번째");
  s.speak("두 번째");
  assert.deepEqual(log, ["cancel", "speak", "cancel", "speak"]);
});

test("음성 목록이 아직 비어 있으면 lang만 정해 읽는다", () => {
  const { env, spoken } = fakeEnv([]);
  assert.equal(createSpeaker(() => env).speak("공룡"), true);
  assert.equal(spoken[0].lang, "ko-KR");
  assert.equal(spoken[0].voice, undefined);
});

test("한국어 음성이 없는 기기에서는 읽지 않는다 (영어 음성으로 엉뚱하게 읽지 않게)", () => {
  const { env, log } = fakeEnv([{ lang: "en-US", name: "English" }]);
  const s = createSpeaker(() => env);
  assert.equal(s.supported(), false);
  assert.equal(s.speak("공룡"), false);
  assert.deepEqual(log, []);
});

test("speechSynthesis가 없으면(미지원·서버) 오류 없이 아무것도 하지 않는다", () => {
  const s = createSpeaker(() => undefined);
  assert.equal(s.supported(), false);
  assert.equal(s.speak("공룡"), false);
  assert.doesNotThrow(() => s.stop());
  assert.equal(createSpeaker(() => ({})).speak("공룡"), false);
});

test("빈 문장은 읽지 않고, speak가 예외를 던져도 false로 끝난다", () => {
  const { env } = fakeEnv([{ lang: "ko-KR", name: "Korean" }]);
  const s = createSpeaker(() => env);
  assert.equal(s.speak("  "), false);
  const broken = { ...env, speechSynthesis: { ...env.speechSynthesis!, speak: () => { throw new Error("x"); } } };
  assert.equal(createSpeaker(() => broken).speak("공룡"), false);
});
