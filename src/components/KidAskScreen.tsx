"use client";

// /app 아이 묻기 화면 (design.md "아이 묻기 흐름은 /app 한 주소 + 상태 기계").
// 헤더·탭은 그대로 두고 가운데만 askFlow 상태에 따라 바뀐다:
// 2-1 홈(idle) · 2-2 듣는 중(listening) · 2-3 생각 중(thinking) · 2-4 확인 질문(confirm) · 2-9 뜻 알려주기(explaining) · 2-10 카드 획득(collected).
// 2-5 어디서 들었어?(context) · 2-6 후보 고르기(choose)에서 고른 단어도 같은 2-9·2-10으로 간다(2-9b·2-9c·2-10b·2-10c).
// 2-7 다시 말해줄래(retry, [글자 카드로 고를래]면 폴백) · 2-8 물어볼 단어(unknown, 열릴 때 한 번 저장) · 부적절 단어(blocked).
// 2-11·2-12는 2-2·2-3과 같은 상태다. E-2 마이크가 꺼져 있어요(micOff): 2-1은 마이크 상태와 상관없이 늘 피그마 그대로이고,
// 마이크를 쓸 수 없으면(미지원·http·거부) 마이크를 눌렀을 때 E-2로 간다. 폴백(글자 입력·예시 알약)은 E-2 안 [글자로 물어볼래]에.
// E-1 연결이 끊겼어요(networkError)는 어댑터가 한 번 다시 시도한 뒤에도 실패할 때.
// 녹음은 MediaRecorder, 인식은 우리 서버(/api/stt) 어댑터, 모야 목소리는 speechSynthesis. 음성 원본은 보내고 버린다.

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { preload } from "react-dom";
import { BLOCKED_WORDS } from "@/data/blocklist";
import { EXAMPLE_PROMPTS } from "@/data/examplePrompts";
import { MOCK_WORDS } from "@/data/words.mock";
import type { HeardContext } from "@/types";
import { createAskReducer, initialAskState, type AskAction, type AskState } from "@/lib/askFlow";
import { MISSION_SUCCESS_DELAY_MS } from "@/lib/config";
import { addPendingOnce, collectAskedCard, pickTodayWord, STARS_PER_MISSION } from "@/lib/progress";
import { createRecognizer, listenLimitMs } from "@/lib/services/recognize";
import { newId } from "@/lib/id";
import { speaker } from "@/lib/services/speech";
import {
  readCards,
  readMission,
  readPending,
  readStars,
  readTaught,
  readToday,
  writeCards,
  writeMission,
  writePending,
  writeStars,
} from "@/lib/storage";
import { closeMic, micSupported, openMic } from "./microphone";
import { MIC_OFF_LINE, MicOffBody } from "./MicOffBody";
import { useStored } from "./useStored";
import { KidTop, LISTEN_PARAM } from "./KidTop";
import { MissionSuccess } from "./ui/mission";
import { MicArea } from "./ui/MicButton";
import { GiftButton, MoyaImage, MoyaListening, MoyaStage, preloadMoya, Sparkle } from "./ui/Moya";
import { SpeechBubble } from "./ui/SpeechBubble";
import { TabBar } from "./ui/TabBar";
import { TextFallback } from "./ui/TextFallback";
import { Button, CircleButton } from "./ui/buttons";
import { CandidateCard, ContextChip, LetterTiles, WordCardDetailed, WordCardSimple } from "./ui/cards";
import { PendingWordNotice } from "./ui/notices";

// 카드 날짜 "10월 8일"
function cardDate(iso: string | undefined): string {
  const d = iso ? new Date(iso) : new Date();
  const day = Number.isNaN(d.getTime()) ? new Date() : d;
  return `${day.getMonth() + 1}월 ${day.getDate()}일`;
}

// E-1 화면의 아이콘 (말풍선 스피커·재생 중, 다시 해 볼래, 처음으로)
const OFFLINE_ICONS = ["/icons/speaker-sm.svg", "/icons/speaker-sm-playing.svg", "/icons/retry-white.svg", "/icons/home.svg"];

// 말풍선 대사 (피그마 문구 그대로)
const LINES = {
  idle: "궁금한 점이 생겼어?\n나랑 함께 알아보자!",
  listening: "응응, 듣고 있어!",
  thinking: "음… 무슨 말인지\n찾아볼게!",
  context: "번역기가 헷갈렸어.\n어디서 들었어?",
  choose: "이 중에 있어?\n눌러서 골라 줘!",
  retry: "앗, 잘 못 들었어.\n한 번만 더 말해줄래?",
  unknown: "나도 아직 몰라!\n엄마 아빠랑 같이 알아볼게.",
  micOff: MIC_OFF_LINE,
  networkError: "앗, 모야 우주선 신호가 약해!\n다시 해 볼까?",
  blocked: "그 말은 엄마·아빠한테\n물어보자!", // 피그마에 없음 — 문구는 CLAUDE.md, 배치는 PM 확인 2026-10-11
} as const;

// 2-5 들은 곳 (피그마 순서·문구). 학교·TV·밖에서 아이콘은 28px 원본(24px 판을 키우면 선이 굵어짐)
const PLACES: { value: HeardContext; label: string; icon: string }[] = [
  { value: "home", label: "집", icon: "/icons/home.svg" },
  { value: "school", label: "유치원·학교", icon: "/icons/school-28.svg" },
  { value: "tv", label: "TV·영상", icon: "/icons/tv-28.svg" },
  { value: "book", label: "책", icon: "/icons/book.svg" },
  { value: "outside", label: "밖에서", icon: "/icons/tree-28.svg" },
];

function bubbleLine(state: AskState): string | null {
  switch (state.phase) {
    case "idle":
    case "listening":
    case "thinking":
    case "context":
    case "choose":
    case "retry":
    case "unknown":
    case "blocked":
    case "micOff":
    case "networkError":
      return LINES[state.phase];
    case "confirm":
      return `${state.candidates[0].entry.word} 말하는 거야?`;
    case "explaining":
      return state.entry.bubbleExplanation || state.entry.kidExplanation;
    case "collected":
      // 이미 있던 단어여도 피그마 문구 그대로 (잠정 T10). 세 번째 새 카드면 2-13 문구
      return state.missionCompleted
        ? `${state.entry.word} 카드 모았다!\n오늘의 미션 끝!`
        : `${state.entry.word} 카드 모았다!\n별 1개 받았어!`;
    default:
      return null;
  }
}

// 카드 머리띠·별 (2-10은 새 카드. 이미 있던 단어면 그 카드의 상태를 보여 준다, T10)
const CARD_STATUS = {
  new: { label: "새 카드", stars: 0 },
  reviewing: { label: "복습 중", stars: 1 },
  mastered: { label: "다 앎", stars: 3 },
} as const;


const MISSION_SUCCESS_LINE = "오늘의 미션 성공! 모르는 말 3개를 물어봤어";

type Recording = { recorder: MediaRecorder; stream: MediaStream; timer: number };
type Playing = "bubble" | "card" | "spoken" | null;

export function KidAskScreen() {
  const router = useRouter();
  const cards = useStored(readCards);
  // 2-1 오늘의 단어 선물: 고를 단어가 없으면 숨기고, 오늘 아직 안 열어 봤으면 새 표시
  const savedToday = useStored(readToday);
  const todayWord = cards && savedToday !== undefined ? pickTodayWord(MOCK_WORDS, cards, savedToday, new Date()) : undefined;
  const taught = useStored(readTaught);

  // 보호자가 알려 준 연결이 바뀌면 reducer를 다시 만든다 (askFlow 옵션)
  const reducer = useMemo(
    () => createAskReducer(MOCK_WORDS, { blockedWords: BLOCKED_WORDS, taught: taught ?? {} }),
    [taught],
  );
  const [state, setState] = useState<AskState>(initialAskState);
  // 녹음·인식은 비동기로 끝나므로 그때의 최신 상태를 여기에서 읽는다
  const current = useRef<AskState>(initialAskState);
  const reducerRef = useRef(reducer);
  useEffect(() => {
    reducerRef.current = reducer;
  }, [reducer]);

  // 상태를 바꾸고, 말풍선 대사가 바뀌었으면 모야가 읽는다. 듣는 중(녹음 중)은 읽지 않는다.
  // 처음 연 2-1은 send를 거치지 않아 읽지 않는다 (브라우저도 누르기 전에는 소리를 막는다)
  function send(action: AskAction) {
    const prev = current.current;
    const next = reducerRef.current(prev, action);
    current.current = next;
    setState(next);
    if (next.phase !== "micOff") setTyping(false);
    // 2-8이 열릴 때 물어볼 단어로 저장 (같은 말은 한 번만)
    if (next.phase === "unknown" && prev.phase !== "unknown") savePending(next.spokenAs);
    const line = bubbleLine(next);
    if (line && next.phase !== "listening" && line !== bubbleLine(prev)) speak(line, "bubble");
    // 2-14가 열리면 창의 글을 읽는다
    if (next.phase === "collected" && next.missionSuccessOpen && !(prev.phase === "collected" && prev.missionSuccessOpen))
      speak(MISSION_SUCCESS_LINE, "bubble");
  }

  const recognizer = useMemo(() => createRecognizer(), []);
  const provider = useRef<string | null>(null);
  const providerReady = useRef<Promise<void> | null>(null); // STT 종류를 다 물었는지 (화면이 열리자마자 마이크를 눌러도 mock이면 2.5초)
  const recording = useRef<Recording | null>(null);
  const opening = useRef(false); // 마이크 여는 중(권한 창) — 두 번 눌러도 한 번만
  const left = useRef(false); // 화면을 떠났으면 늦게 온 결과를 버린다
  const [playing, setPlaying] = useState<Playing>(null);

  // E-2에서 [글자로 물어볼래]를 눌러 폴백을 보이는 중 (E-2를 떠나면 다시 안내로)
  const [typing, setTyping] = useState(false);

  // 2-13 → 1.5초 뒤 2-14 (실제로도 1.5초, design.md 이동표)
  const waitingSuccess = state.phase === "collected" && state.missionCompleted && !state.missionSuccessOpen;
  useEffect(() => {
    if (!waitingSuccess) return;
    const t = window.setTimeout(() => send({ type: "openMissionSuccess" }), MISSION_SUCCESS_DELAY_MS);
    return () => window.clearTimeout(t);
    // send는 ref로 최신 상태를 읽으므로 의존성에 넣지 않는다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [waitingSuccess]);

  // 다른 화면의 2-0 [지금 물어볼래] → /app?listen=1 → 열리자마자 듣기(2-2)
  const startRef = useRef<() => void>(() => {});
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get(LISTEN_PARAM) !== "1") return;
    // 주소 정리는 실제로 시작할 때 한다 (개발 모드에서 효과가 두 번 돌아도 한 번은 시작하게)
    const t = window.setTimeout(() => {
      window.history.replaceState(null, "", "/app");
      startRef.current();
    }, 0);
    return () => window.clearTimeout(t);
  }, []);
  const askTyped = (text: string) => send({ type: "recognized", transcripts: [text] });

  // mock STT인지 미리 물어 둔다 (mock이면 2.5초 뒤 자동으로 녹음을 끝낸다)
  useEffect(() => {
    let active = true;
    providerReady.current = recognizer.provider().then((p) => {
      if (active) provider.current = p;
    });
    return () => {
      active = false;
    };
  }, [recognizer]);

  // 화면을 떠나면 녹음을 멈추고 마이크를 닫는다 (녹음 내용은 보내지 않는다)
  useEffect(() => {
    left.current = false;
    return () => {
      left.current = true;
      speaker.stop();
      const r = recording.current;
      recording.current = null;
      if (!r) return;
      window.clearTimeout(r.timer);
      if (r.recorder.state !== "inactive") r.recorder.stop();
      closeMic(r.stream);
    };
  }, []);

  function speak(text: string, what: Exclude<Playing, null>) {
    if (speaker.speak(text, () => setPlaying(null))) setPlaying(what);
  }

  function stopSpeaking() {
    speaker.stop();
    setPlaying(null);
  }

  // 2-1 마이크 · 2-10 [또 물어볼래] → 2-2. 처음이면 브라우저가 권한 창을 띄운다.
  // 쓸 수 없으면(미지원·거부·http) E-2.
  async function startListening() {
    if (opening.current || recording.current) return;
    stopSpeaking(); // 모야 목소리가 녹음에 섞이지 않게
    if (!micSupported()) {
      send({ type: "micUnavailable" });
      return;
    }
    opening.current = true;
    const stream = await openMic();
    if (stream && providerReady.current) {
      // STT 종류를 아직 모르면 잠깐(최대 1초) 기다린다. 모르면 실제 STT처럼 최대 녹음 시간까지 듣는다
      await Promise.race([providerReady.current, new Promise((r) => window.setTimeout(r, 1000))]);
    }
    opening.current = false;
    if (left.current) {
      if (stream) closeMic(stream);
      return;
    }
    if (!stream) {
      send({ type: "micUnavailable" });
      return;
    }
    const chunks: Blob[] = [];
    const recorder = new MediaRecorder(stream);
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data);
    };
    recorder.onstop = () => {
      closeMic(stream);
      if (!left.current) void recognize(new Blob(chunks, { type: recorder.mimeType }));
    };
    recorder.start();
    const timer = window.setTimeout(stopListening, listenLimitMs(provider.current));
    recording.current = { recorder, stream, timer };
    send({ type: "startListening" });
  }

  useEffect(() => {
    startRef.current = () => void startListening();
  });

  // 2-2 마이크 다시 누름 · mock 2.5초 · 최대 녹음 시간 → 2-3
  function stopListening() {
    const r = recording.current;
    recording.current = null;
    if (!r) return;
    window.clearTimeout(r.timer);
    send({ type: "stopListening" });
    if (r.recorder.state !== "inactive") r.recorder.stop(); // → onstop → recognize
  }

  async function recognize(audio: Blob) {
    const result = await recognizer.recognize(audio);
    if (left.current || current.current.phase !== "thinking") return;
    send(result.ok ? { type: "recognized", transcripts: result.transcripts } : { type: "recognitionFailed", reason: result.reason });
  }

  // 2-8 물어볼 단어 (실패해도 흐름은 그대로)
  function savePending(spokenAs: string) {
    const { list, added } = addPendingOnce(readPending(), { id: newId(), spokenAs, createdAt: new Date().toISOString() });
    if (added) writePending(list);
  }

  // 2-9 [알았어!]: 카드 자동 저장 + 별 +1 + 미션. 이미 있는 단어면 아무것도 늘지 않는다 (T10).
  // 저장에 실패해도 2-10으로 넘어간다 (카드 내용은 단어 데이터로 보여 줌)
  function collect() {
    const s = current.current;
    if (s.phase !== "explaining") return;
    const result = collectAskedCard(
      { cards: readCards(), stars: readStars(), mission: readMission() },
      { entry: s.entry, spokenAs: s.spokenAs, heardContext: s.heardContext, now: new Date(), id: newId() },
    );
    let saved = true;
    if (result.isNew) {
      saved = writeCards(result.cards);
      if (saved) {
        writeStars(result.stars);
        writeMission(result.mission);
      }
    }
    send({
      type: "cardCollected",
      cardId: saved ? result.card.id : null,
      isNew: result.isNew && saved,
      missionCompleted: result.missionCompleted && saved,
    });
  }

  function goHome() {
    const r = recording.current;
    recording.current = null;
    if (r) {
      window.clearTimeout(r.timer);
      r.recorder.onstop = () => closeMic(r.stream); // 녹음한 것은 보내지 않는다
      if (r.recorder.state !== "inactive") r.recorder.stop();
    }
    stopSpeaking();
    send({ type: "goHome" });
  }

  // 이 흐름에서 나올 모야 그림을 미리 받아 둔다 (2-2·2-3 궁금 270, 2-4 궁금 104, 2-9 설명 210, 2-10 신남 96, 2-7 당황 200, 2-8 설명 190)
  preloadMoya("curious", 270, "cream");
  preloadMoya("curious", 104, "cream");
  preloadMoya("explain", 210);
  preloadMoya("excited", 96, "cream");
  preloadMoya("confused", 200, "cream"); // 2-7
  preloadMoya("explain", 190); // 2-8 · 부적절 단어
  preloadMoya("confused", 150, "cream"); // 2-7 폴백 · E-2
  preloadMoya("confused", 210, "cream"); // E-1
  // E-1은 연결이 끊긴 뒤에 열리므로 그때 받을 수 없는 아이콘을 미리 받아 둔다 (안 받아 두면 깨진 그림으로 보임)
  for (const icon of OFFLINE_ICONS) preload(icon, { as: "image" });

  const line = bubbleLine(state);
  const bubbleSpeak = () => line && speak(line, "bubble");
  const card = state.phase === "collected" && state.cardId ? cards?.find((c) => c.id === state.cardId) : undefined;

  return (
    <>
      {/* 2-13: 미션 별 +3은 2-14가 열릴 때 보인다 (피그마 2-13 헤더 26, 2-14 29) */}
      <KidTop
        onAsk={() => void startListening()}
        starsHidden={waitingSuccess ? STARS_PER_MISSION : 0}
        bumpStars={state.phase === "collected" && state.isNew}
      />

      {(state.phase === "idle" || state.phase === "listening" || state.phase === "thinking") && (
        <main className="flex flex-1 flex-col items-center justify-center gap-[18px] px-6 pt-[18px] pb-[14px]">
          {state.phase === "idle" ? (
            <>
              <SpeechBubble text={LINES.idle} onSpeak={bubbleSpeak} playing={playing === "bubble"} className="w-[270px]" />
              {/* 반짝이(왼쪽 30)와 오늘의 단어(오른쪽 12)는 앱 틀 가장자리 기준, 높이는 모야 무대 기준 (피그마 절대 위치).
                  마이크 상태와 상관없이 늘 피그마 2-1 그대로 (PM 결정 2026-10-11) */}
              <div className="relative -mx-6 flex justify-center self-stretch">
                <MoyaStage expression="explain" />
                <Sparkle className="top-[54px] left-[30px]" />
                {todayWord !== null && (
                  <span className="absolute top-[84px] right-3">
                    <GiftButton hasNew={!!todayWord && !todayWord.opened} onClick={() => router.push("/app/today")} />
                  </span>
                )}
              </div>
              <MicArea state="idle" onPress={() => void startListening()} />
            </>
          ) : (
            <>
              <SpeechBubble text={LINES[state.phase]} className="w-[240px]" />
              {state.phase === "listening" ? (
                <MoyaListening />
              ) : (
                <MoyaImage expression="curious" background="cream" size={270} />
              )}
              <MicArea state={state.phase} onPress={state.phase === "listening" ? stopListening : undefined} />
            </>
          )}
        </main>
      )}

      {state.phase === "confirm" && (
        <main className="flex flex-1 flex-col items-center gap-4 px-6 pt-[18px] pb-[14px]">
          <div className="flex w-full items-center gap-2">
            <MoyaImage expression="curious" background="cream" size={104} />
            <SpeechBubble
              text={bubbleLine(state) ?? ""}
              tail="left"
              onSpeak={bubbleSpeak}
              playing={playing === "bubble"}
              className="min-w-px flex-1"
            />
          </div>
          <WordCardSimple
            word={state.candidates[0].entry.word}
            // 2-4 힌트는 2-6 힌트에 느낌표 (피그마 "돈을 모아 두는 통!")
            hint={state.candidates[0].entry.hint ? `${state.candidates[0].entry.hint}!` : ""}
            image={state.candidates[0].entry.image}
            onSpeak={() => speak(state.candidates[0].entry.word, "card")}
          />
          <div className="flex w-full items-start gap-3">
            {/* 피그마 폭 173 : 169 */}
            <Button variant="secondary" className="min-w-px flex-[1_1_173px]" onClick={() => send({ type: "answerNo" })}>
              아니야
            </Button>
            <Button icon="/icons/check-white.svg" className="min-w-px flex-[1_1_169px]" onClick={() => send({ type: "answerYes" })}>
              맞아!
            </Button>
          </div>
        </main>
      )}

      {(state.phase === "context" || state.phase === "choose") && (
        <main className={`flex flex-1 flex-col items-center px-6 pt-[18px] pb-[14px] ${state.phase === "context" ? "gap-[18px]" : "gap-3"}`}>
          <div className="flex w-full items-center gap-2">
            <MoyaImage expression="curious" background="cream" size={104} />
            <SpeechBubble
              text={LINES[state.phase]}
              tail="left"
              onSpeak={bubbleSpeak}
              playing={playing === "bubble"}
              className="min-w-px flex-1"
            />
          </div>
          {state.phase === "context" ? (
            <>
              {/* 들은 곳 5개: 3 + 2, 가운데 정렬 (간격 14). 375px처럼 좁으면 가로 간격만 줄여 3 + 2를 지킨다 */}
              <div className="flex w-full flex-wrap justify-center gap-x-[min(14px,calc((100%-300px)/2))] gap-y-3.5">
                {PLACES.map((p) => (
                  <ContextChip
                    key={p.value}
                    label={p.label}
                    icon={p.icon}
                    onClick={() => send({ type: "pickContext", context: p.value })}
                  />
                ))}
              </div>
              <p className="type-body-small whitespace-nowrap text-text-normal">들은 곳을 알려 주면 더 잘 찾을 수 있어!</p>
              <Button variant="dashed" onClick={() => send({ type: "pickContext", context: null })}>
                잘 모르겠어
              </Button>
            </>
          ) : (
            <>
              {/* 카드를 한 번 누르면 그 단어의 2-9. 스피커는 소리만 */}
              {state.candidates.map((c) => (
                <CandidateCard
                  key={c.entry.id}
                  word={c.entry.word}
                  hint={c.entry.hint}
                  image={c.entry.image}
                  onSelect={() => send({ type: "pickCandidate", entryId: c.entry.id })}
                  onSpeak={() => speak(c.entry.word, "card")}
                />
              ))}
              <Button variant="dashed" onClick={() => send({ type: "noneOfThese" })}>
                다 아니야
              </Button>
            </>
          )}
        </main>
      )}

      {state.phase === "retry" && (
        <main className="flex flex-1 flex-col items-center justify-center gap-3 px-6 pt-[18px] pb-[14px]">
          <SpeechBubble text={LINES.retry} onSpeak={bubbleSpeak} playing={playing === "bubble"} className="w-[280px]" />
          {state.fallback ? (
            // [글자 카드로 고를래]: 후보가 없어 늘 폴백 (잠정 T3). 마이크 자리 대신 글자 입력, 모야는 150으로
            <>
              <MoyaImage expression="confused" background="cream" size={150} />
              <TextFallback examples={EXAMPLE_PROMPTS} onAsk={askTyped} onVoice={() => void startListening()} />
            </>
          ) : (
            <>
              <MoyaImage expression="confused" background="cream" size={200} />
              <MicArea state="retry" onPress={() => void startListening()} />
              <Button variant="dashed" icon="/icons/card-book.svg" onClick={() => send({ type: "chooseByLetters" })}>
                글자 카드로 고를래
              </Button>
            </>
          )}
        </main>
      )}

      {(state.phase === "unknown" || state.phase === "blocked") && (
        // 2-8 물어볼 단어 · 부적절 단어(2-8 틀, 단어를 보여 주지 않고 저장도 하지 않음 — PM 확인 2026-10-11)
        <main className="flex flex-1 flex-col items-center justify-center gap-3 px-6 pt-[18px] pb-[14px]">
          <SpeechBubble
            text={LINES[state.phase]}
            onSpeak={bubbleSpeak}
            playing={playing === "bubble"}
            className="w-[290px] max-w-full"
          />
          <MoyaImage expression="explain" size={190} />
          {state.phase === "unknown" && (
            <PendingWordNotice
              spoken={state.spokenAs}
              onSpeak={() => speak(state.spokenAs, "spoken")}
              playing={playing === "spoken"}
            />
          )}
          <Button icon="/icons/check-white.svg" onClick={goHome}>
            알았어!
          </Button>
          <Button variant="secondary" icon="/icons/mic.svg" onClick={() => void startListening()}>
            다른 말 물어볼래
          </Button>
        </main>
      )}

      {state.phase === "explaining" && (
        <main className="flex flex-1 flex-col items-center justify-center gap-3.5 px-6 pt-[18px] pb-[14px]">
          <LetterTiles word={state.entry.word} />
          <MoyaImage expression="explain" size={210} />
          <SpeechBubble
            text={bubbleLine(state) ?? ""}
            tail="up"
            onSpeak={bubbleSpeak}
            playing={playing === "bubble"}
            className="w-[340px] max-w-full"
          />
          <Button icon="/icons/check-white.svg" onClick={collect}>
            알았어!
          </Button>
        </main>
      )}

      {state.phase === "collected" && (
        <main className="flex flex-1 flex-col items-center gap-3 px-6 pt-[18px] pb-[14px]">
          <div className="flex w-full items-center gap-2">
            <MoyaImage expression="excited" background="cream" size={96} />
            <SpeechBubble
              text={bubbleLine(state) ?? ""}
              tail="left"
              onSpeak={bubbleSpeak}
              playing={playing === "bubble"}
              className="min-w-px flex-1"
            />
          </div>
          <WordCardDetailed
            word={state.entry.word}
            image={state.entry.image}
            status={CARD_STATUS[card?.status ?? "new"].label}
            date={cardDate(card?.createdAt)}
            spoken={card ? card.spokenAs : state.spokenAs}
            onSpeakSpoken={() => speak(card ? card.spokenAs : state.spokenAs, "spoken")}
            playingSpoken={playing === "spoken"}
            explanation={state.entry.kidExplanation}
            example={state.entry.example}
            stars={CARD_STATUS[card?.status ?? "new"].stars}
            reviewText="며칠 뒤 모야가 다시 물어볼게!"
            className="motion-safe:animate-card-spin"
          />
          <div className="flex w-full items-center gap-3">
            <Button icon="/icons/mic-white.svg" className="min-w-px flex-1" onClick={() => void startListening()}>
              또 물어볼래
            </Button>
            <CircleButton icon="/icons/card-book.svg" label="지구 사전" onClick={() => router.push("/app/dictionary")} />
          </div>
        </main>
      )}

      {state.phase === "micOff" && (
        // E-2 마이크가 꺼져 있어요 (180:8444). 폴백은 [글자로 물어볼래]를 누르면 안내·버튼 자리에 (PM 확인 2026-10-11)
        <MicOffBody
          onSpeak={bubbleSpeak}
          playing={playing === "bubble"}
          onRetry={() => void startListening()}
          secondary={{ label: "보호자에게 도움 요청", icon: "/icons/lock.svg", onClick: () => router.push("/parent") }}
          below={
            <button
              type="button"
              onClick={() => setTyping(true)}
              className="absolute top-full left-1/2 mt-2 -translate-x-1/2 py-1 type-moya-label whitespace-nowrap text-brand-deep touch-target"
            >
              글자로 물어볼래
            </button>
          }
          replace={
            typing ? (
              <TextFallback
                examples={EXAMPLE_PROMPTS}
                onAsk={askTyped}
                onVoice={() => void startListening()}
                voiceLabel="마이크 다시 해 볼래"
              />
            ) : undefined
          }
        />
      )}

      {state.phase === "networkError" && (
        // E-1 연결이 끊겼어요 (180:8433). 어댑터가 한 번 자동으로 다시 시도한 뒤에도 연결이 안 될 때
        <main className="flex flex-1 flex-col items-center justify-center gap-3 px-6 pt-[18px] pb-[14px]">
          <SpeechBubble
            text={LINES.networkError}
            onSpeak={bubbleSpeak}
            playing={playing === "bubble"}
            className="w-[300px] max-w-full"
          />
          <MoyaImage expression="confused" background="cream" size={210} />
          <p className="type-caption whitespace-nowrap text-text-faint">자동으로 한 번 다시 시도했어요</p>
          <Button icon="/icons/retry-white.svg" onClick={() => void startListening()}>
            다시 해 볼래
          </Button>
          <Button variant="dashed" icon="/icons/home.svg" onClick={goHome}>
            처음으로
          </Button>
        </main>
      )}

      <TabBar selected="play" onSelect={(key) => key === "play" && goHome()} />

      {state.phase === "collected" && state.missionSuccessOpen && (
        <MissionSuccess onOk={() => router.push("/app/me/stars")} />
      )}
    </>
  );
}
