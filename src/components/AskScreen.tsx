"use client";

// /app/ask 묻기 흐름 화면. 상태(04 §4)에 따라 Figma 화면을 바꿔 보여준다 (03 §1):
// 음성 녹음 S1(+폴백 E1) · 다시 말하기 안내 E2 · 부적절 단어 안내 E3 · 되묻기 S12 · 확인 질문 S3 ·
// 후보 카드 선택 S4 · 단어 카드 S5 · 물어볼 단어 안내 S6.
// 화면 글자는 Figma 문구뿐이고, 모야 대사는 보이지 않는 aria-live 영역과 소리로만 나온다.

import { useRouter } from "next/navigation";
import { useEffect, useReducer, useRef, useState, useSyncExternalStore } from "react";
import { BLOCKED_WORDS } from "@/data/blocklist";
import { MOCK_WORDS } from "@/data/words.mock";
import { createAskReducer, initialAskState, type AskAction, type AskState } from "@/lib/askFlow";
import { MAX_RECORDING_MS } from "@/lib/config";
import { speaker } from "@/lib/services/speech";
import { addCard, addPending } from "@/lib/storage";
import { Button } from "./Button";
import { CandidatePicker } from "./CandidatePicker";
import { ExamplePrompts } from "./ExamplePrompts";
import { Header, type HeaderBack } from "./Header";
import { ImageSlot } from "./ImageSlot";
import { closeMic, micPermission, micSupported, openMic } from "./microphone";
import { QuestionForm } from "./QuestionForm";
import { ScreenHeading } from "./ScreenHeading";
import { SoundButton } from "./SoundButton";
import { boxClass } from "./styles";
import { cardSpeech, WordCardView } from "./WordCardView";

const askReducer = createAskReducer(MOCK_WORDS, BLOCKED_WORDS);

// crypto.randomUUID는 http(휴대폰에서 개발 서버 접속)에서 없을 수 있어 직접 만든다.
function newId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

// 헤더 가운데 화면 이름 (Figma 화면 이름, Figma에 없는 화면은 design.md 2차 결정).
function screenName(state: AskState): string {
  switch (state.phase) {
    case "idle":
    case "listening":
    case "thinking":
      return "음성 녹음 화면";
    case "sttFailed":
      return "다시 말하기 안내 화면";
    case "blocked":
      return "부적절 단어 안내 화면";
    case "review":
      return "되묻기 화면";
    case "confirm":
      return "단어 확인 질문 화면";
    case "choose":
      return "후보 카드 선택 화면";
    case "explaining":
    case "saved":
      return "단어 카드 화면";
    case "unknown":
      return "물어볼 단어 안내 화면";
  }
}

// 모야의 대사 (보이지 않는 aria-live 영역). 소리로는 speechLine이 같은 문장을 읽는다.
function moyaLine(state: AskState, micUnavailable: boolean): string {
  switch (state.phase) {
    case "idle":
      if (state.retryCount > 0) return "그럼 한 번 더 말해 줄래?";
      if (micUnavailable) return "마이크를 쓸 수 없어. 글자로 물어봐 줄래?";
      return "궁금한 말이 있어? \"공룡이 뭐야?\"처럼 물어봐!";
    case "listening":
      return "듣고 있어…";
    case "thinking":
      return "음… 생각 중이야";
    case "sttFailed":
      return "다시 말해줄래? 처음부터 다시 시도해봐!";
    case "blocked":
      return "그 말은 엄마·아빠한테 물어보자!";
    case "review": {
      const { result } = state;
      if (result.kind === "confirm") return `혹시 ${result.candidate.entry.word} 말이야?`;
      if (result.kind === "choose") return "모야가 잘 못 들었어요. 아래 단어 중에 골라봐요!";
      return "모야가 아직 모르는 말이야.";
    }
    case "confirm":
      return `${state.candidate.entry.word} 말하는 거야? ${state.candidate.entry.hint}!`;
    case "choose":
      return "이 중에 네가 물어본 단어가 있어?";
    case "explaining":
    case "saved":
      return cardSpeech(state.entry.word, state.entry.kidExplanation);
    case "unknown":
      return "모야가 아직 모르는 단어들이에요. 엄마, 아빠와 함께 이 단어들을 알아보세요!";
  }
}

// 소리로 읽을 문장. 듣는 중·생각 중에는 읽지 않는다 (모야 목소리가 녹음에 들어가지 않게).
function speechLine(state: AskState, micUnavailable: boolean): string | null {
  if (state.phase === "listening" || state.phase === "thinking") return null;
  return moyaLine(state, micUnavailable);
}

// 마이크를 쓸 수 있는 브라우저인지. 서버에서는 쓸 수 있다고 그리고 브라우저에서 다시 확인한다.
const noSubscribe = () => () => {};
const supportedOnServer = () => true;

type Props = {
  micDenied?: boolean; // 권한 안내에서 거부하고 왔으면 폴백(E1)부터 보여준다 (/app/ask?mic=denied)
};

// 녹음 중인 것들. 화면을 떠나면 정리한다.
type Recording = { recorder: MediaRecorder; stream: MediaStream; timer: number };

export function AskScreen({ micDenied = false }: Props) {
  const router = useRouter();
  const [state, dispatch] = useReducer(askReducer, initialAskState);
  const [saveFailed, setSaveFailed] = useState(false);
  const [micBlocked, setMicBlocked] = useState(micDenied); // 권한 거부·마이크 없음
  const supported = useSyncExternalStore(noSubscribe, micSupported, supportedOnServer);
  const micUnavailable = micBlocked || !supported; // E1: 텍스트 입력·예시 버튼을 보인다
  const [mockHeard, setMockHeard] = useState<string | null>(null); // 개발용: mock STT가 돌려준 문장

  // 녹음·인식은 비동기로 끝나므로, 그때의 최신 상태를 알도록 send가 다음 상태를 여기에 같이 적는다.
  const current = useRef<AskState>(initialAskState);
  const recording = useRef<Recording | null>(null);
  const left = useRef(false); // 화면을 떠났으면 늦게 온 인식 결과를 버린다

  function apply(action: AskAction) {
    current.current = askReducer(current.current, action);
    dispatch(action);
  }

  // 상태를 바꾼다. 저장은 자동으로 하지 않는다: 단어 카드(S5)와 물어볼 단어(S6) 모두
  // [내 단어장에 저장하기]를 눌러야 저장한다 (saveCard·savePending).
  function send(action: AskAction) {
    apply(action);
    setSaveFailed(false);
  }

  // 이미 거부된 기기면 처음부터 폴백을 보인다.
  useEffect(() => {
    let active = true;
    void micPermission().then((permission) => {
      if (active && permission === "denied") setMicBlocked(true);
    });
    return () => {
      active = false;
    };
  }, []);

  // 화면을 떠나면 녹음을 멈추고 마이크를 닫는다 (녹음 내용은 보내지 않는다).
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

  // [녹음 시작]. 권한을 아직 묻지 않았으면 권한 안내(S10)로, 쓸 수 없으면 폴백(E1)을 보인다.
  async function startRecording() {
    speaker.stop(); // 모야 목소리가 녹음에 섞이지 않게 먼저 멈춘다
    if (!micSupported()) {
      setMicBlocked(true);
      return;
    }
    const permission = await micPermission();
    if (left.current) return;
    if (permission === "prompt") {
      router.push("/app/mic");
      return;
    }
    if (permission === "denied") {
      setMicBlocked(true);
      return;
    }
    const stream = await openMic();
    if (left.current) {
      if (stream) closeMic(stream);
      return;
    }
    if (!stream) {
      setMicBlocked(true);
      return;
    }
    setMicBlocked(false);

    const chunks: Blob[] = [];
    const recorder = new MediaRecorder(stream);
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data);
    };
    recorder.onstop = () => {
      closeMic(stream);
      if (left.current) return;
      void transcribe(new Blob(chunks, { type: recorder.mimeType }));
    };
    recorder.start();
    // [그만하기]를 누르지 않아도 최대 녹음 시간이 지나면 끝낸다.
    const timer = window.setTimeout(stopRecording, MAX_RECORDING_MS);
    recording.current = { recorder, stream, timer };
    send({ type: "startListening" });
  }

  // [그만하기] 또는 최대 녹음 시간 (듣는 중 → 생각 중). 녹음한 것을 인식으로 보낸다.
  function stopRecording() {
    const r = recording.current;
    recording.current = null;
    if (!r) return;
    window.clearTimeout(r.timer);
    send({ type: "recordingDone" });
    if (r.recorder.state !== "inactive") r.recorder.stop(); // → onstop → transcribe
  }

  // 오디오를 서버(/api/stt)로 보내 글자로 바꾼다. 오디오는 보낸 뒤 버린다 (NFR-04).
  // 네트워크 오류·서버 실패는 E2.
  async function transcribe(audio: Blob) {
    try {
      const form = new FormData();
      form.append("audio", audio, "question");
      const response = await fetch("/api/stt", { method: "POST", body: form });
      if (!response.ok) throw new Error(`STT ${response.status}`);
      const data: { transcripts?: unknown; provider?: string } = await response.json();
      const transcripts = Array.isArray(data.transcripts)
        ? data.transcripts.filter((t): t is string => typeof t === "string")
        : [];
      if (left.current) return;
      if (process.env.NODE_ENV === "development" && data.provider === "mock") {
        setMockHeard(transcripts.join(", ") || "(빈 결과)");
      }
      send({ type: "recognized", transcripts });
    } catch {
      if (!left.current) send({ type: "sttFailed" });
    }
  }

  // S5 [내 단어장에 저장하기]. 실패해도 흐름은 그대로, 다시 누를 수 있다 (word-cards 스펙).
  function saveCard() {
    const now = current.current;
    if (now.phase !== "explaining") return;
    const saved = addCard({
      id: newId(),
      wordEntryId: now.entry.id,
      word: now.entry.word,
      dictDefinition: now.entry.dictDefinition,
      kidExplanation: now.entry.kidExplanation,
      example: now.entry.example,
      spokenAs: now.spokenAs,
      createdAt: new Date().toISOString(),
    });
    if (saved) apply({ type: "cardSaved" });
    setSaveFailed(!saved);
  }

  // S6 [내 단어장에 저장하기].
  function savePending() {
    const now = current.current;
    if (now.phase !== "unknown" || now.pendingSaved) return;
    const saved = addPending({ id: newId(), spokenAs: now.spokenAs, createdAt: new Date().toISOString() });
    if (saved) apply({ type: "pendingSaved" });
    setSaveFailed(!saved);
  }

  const ask = (text: string) => send({ type: "recognized", transcripts: [text] });
  const retry = () => send({ type: "retry" });

  // "<": 음성 녹음·물어볼 단어 안내는 홈, 그 밖은 이전 화면 (03 §3).
  const toPrevious: HeaderBack = { onClick: () => send({ type: "back" }), label: "이전 화면" };
  const toHome: HeaderBack = { href: "/app", label: "홈으로" };
  const asking = state.phase === "idle" || state.phase === "listening" || state.phase === "thinking";
  const back = asking || state.phase === "unknown" ? toHome : toPrevious;

  // 화면(대사)이 바뀌면 모야가 그 문장을 소리로 읽는다. 미지원 기기에서는 아무 일도 없다 (FR-08).
  // 저장해서 explaining → saved가 돼도 문장이 같으니 다시 읽지 않는다.
  const spoken = speechLine(state, micUnavailable);
  useEffect(() => {
    if (spoken) speaker.speak(spoken);
  }, [spoken]);

  // 같은 화면 안에서 바뀌는 듣는 중·생각 중은 포커스를 옮기지 않는다.
  const focusKey = asking ? "asking" : state.phase === "saved" ? "explaining" : state.phase;

  return (
    <>
      <Header title={screenName(state)} back={back} />
      <main className="flex flex-col p-6">
        <p aria-live="polite" className="sr-only">
          {moyaLine(state, micUnavailable)}
        </p>

        {/* S1 음성 녹음 (1270:162). 듣는 중·생각 중은 버튼 글자만 바뀐다 */}
        {asking && (
          <div className="flex flex-col items-center gap-6">
            <ImageSlot className="h-[140px] w-full" />
            <ScreenHeading focusKey={focusKey}>뭐가 궁금해?</ScreenHeading>
            <ImageSlot className="h-16 w-full" />
            {state.phase === "idle" && <Button onClick={startRecording}>녹음 시작</Button>}
            {state.phase === "listening" && <Button onClick={stopRecording}>그만하기</Button>}
            {state.phase === "thinking" && <Button disabled>생각 중…</Button>}
            {/* E1 폴백: 마이크를 쓸 수 없을 때만 (권한 거부·마이크 없음·미지원·http) */}
            {micUnavailable && state.phase === "idle" && (
              <>
                <QuestionForm onAsk={ask} />
                <ExamplePrompts onAsk={ask} />
              </>
            )}
            <Button
              variant="link"
              onClick={() => send({ type: "showRetryGuide" })}
              disabled={state.phase !== "idle"}
            >
              다시 말하기
            </Button>
          </div>
        )}

        {/* E2 다시 말하기 안내 (1270:180) · E3 부적절 단어 안내 (E2 레이아웃). 다시 말하기 횟수는 그대로 */}
        {(state.phase === "sttFailed" || state.phase === "blocked") && (
          <div className="flex flex-col items-center gap-6">
            <ImageSlot className="h-[120px] w-full" />
            <div className="flex w-full flex-col items-center gap-2">
              {state.phase === "sttFailed" ? (
                <>
                  <ScreenHeading focusKey={focusKey}>다시 말해줄래?</ScreenHeading>
                  <p className="text-caption">처음부터 다시 시도해봐!</p>
                </>
              ) : (
                <ScreenHeading focusKey={focusKey} className="text-center text-title font-bold">
                  그 말은 엄마·아빠한테 물어보자!
                </ScreenHeading>
              )}
            </div>
            <Button onClick={retry}>다시 녹음하기</Button>
          </div>
        )}

        {/* S12 되묻기 (1270:196). 결과에 맞는 버튼 하나만 보인다 */}
        {state.phase === "review" && (
          <ReviewView
            state={state}
            focusKey={focusKey}
            onChoose={() => send({ type: "openChoose" })}
            onConfirm={() => send({ type: "openConfirm" })}
            onUnknown={() => send({ type: "openUnknown" })}
          />
        )}

        {/* S3 단어 확인 질문 (1270:246) */}
        {state.phase === "confirm" && (
          <div className="flex flex-col items-center gap-6">
            <ImageSlot shape="circle" className="size-[120px]" />
            <div className="flex w-full flex-col items-center gap-3">
              <ScreenHeading focusKey={focusKey}>이 단어 맞나요?</ScreenHeading>
              {/* Figma 회색 막대 자리에 힌트 글자를 넣는다 */}
              <p className="rounded-select bg-edge px-2 text-caption">{state.candidate.entry.hint}</p>
            </div>
            <div className="flex w-full flex-col gap-4">
              <div className={boxClass}>
                <div className="flex flex-col items-center gap-2">
                  <p className="text-body font-semibold">{state.candidate.entry.word}</p>
                  <SoundButton
                    label="음성 재생"
                    variant="link"
                    text={`${state.candidate.entry.word}. ${state.candidate.entry.hint}`}
                    ariaLabel={`${state.candidate.entry.word} 음성 재생`}
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-start justify-center gap-x-3">
                <Button onClick={() => send({ type: "confirmYes" })}>네, 맞아요</Button>
                <Button variant="secondary" onClick={() => send({ type: "reject" })}>
                  아니에요
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* S4 후보 카드 선택 (1270:273) */}
        {state.phase === "choose" && (
          <div className="flex flex-col items-start gap-4">
            <div className="flex w-full items-center gap-2">
              <ImageSlot className="h-[120px] flex-1" />
              <ScreenHeading focusKey={focusKey} className="shrink-0 text-body font-semibold">
                이 중에 네가 물어본 단어가 있어?
              </ScreenHeading>
            </div>
            <CandidatePicker
              candidates={state.candidates}
              onPick={(entryId) => send({ type: "pickCandidate", entryId })}
              onNone={() => send({ type: "reject" })}
            />
          </div>
        )}

        {/* S5 단어 카드 (1270:321). [내 단어장에 저장하기]를 눌러야 저장한다 */}
        {(state.phase === "explaining" || state.phase === "saved") && (
          <WordCardView
            word={state.entry.word}
            english={state.entry.english}
            kidExplanation={state.entry.kidExplanation}
            focusKey={focusKey}
            action={
              <>
                <Button onClick={saveCard} disabled={state.phase === "saved"}>
                  {state.phase === "saved" ? "저장했어!" : saveFailed ? "다시 저장하기" : "내 단어장에 저장하기"}
                </Button>
                <SaveStatus saved={state.phase === "saved"} failed={saveFailed} done="단어장에 저장했어!" />
              </>
            }
          />
        )}

        {/* S6 물어볼 단어 안내 (1270:351). [보호자 모드로 가기] 자리에 저장 버튼 */}
        {state.phase === "unknown" && (
          <div className="flex flex-col items-center gap-6">
            <ImageSlot className="h-[120px] w-full" />
            <ScreenHeading focusKey={focusKey} className="text-body font-semibold">
              물어볼 단어
            </ScreenHeading>
            <p className="text-caption">모야가 아직 모르는 단어들이에요</p>
            <div className={`${boxClass} flex w-full flex-col gap-3 text-caption`}>
              {/* Figma에 없는 줄: 이번에 물은 말 */}
              <p className="text-body font-semibold">{state.spokenAs}</p>
              <p>엄마, 아빠와 함께</p>
              <p>이 단어들을 알아보세요!</p>
            </div>
            <div aria-hidden className="h-0" />
            <div className="flex w-full items-center justify-center gap-4">
              <ImageSlot className="h-12 flex-1" />
              <p className="shrink-0 text-caption">보호자 모드에서 확인하기</p>
              <ImageSlot className="h-12 flex-1" />
            </div>
            <Button onClick={savePending} disabled={state.pendingSaved}>
              {state.pendingSaved ? "적어 뒀어!" : saveFailed ? "다시 저장하기" : "내 단어장에 저장하기"}
            </Button>
            <SaveStatus saved={state.pendingSaved} failed={saveFailed} done="물어볼 단어에 적어 뒀어!" />
          </div>
        )}

        {/* 개발 중에만: mock STT가 돌려준 문장 (작업 10.5 실제 STT 전 데모 확인용) */}
        {mockHeard !== null && (
          <p className="mt-6 text-caption text-muted">개발용 mock 인식: &ldquo;{mockHeard}&rdquo;</p>
        )}
      </main>
    </>
  );
}

// 저장 결과는 버튼 글자로만 보이고, 스크린 리더에는 따로 알린다.
function SaveStatus({ saved, failed, done }: { saved: boolean; failed: boolean; done: string }) {
  return (
    <p role="status" className="sr-only">
      {saved ? done : failed ? "저장하지 못했어. 다시 눌러 볼래?" : ""}
    </p>
  );
}

type ReviewProps = {
  state: Extract<AskState, { phase: "review" }>;
  focusKey: string;
  onChoose: () => void;
  onConfirm: () => void;
  onUnknown: () => void;
};

// S12 되묻기. 미리보기 카드는 가로 최대 3개, 폭은 1/3로 고정. 후보가 0개면 "혹시 이 말이야?" 영역을 숨긴다.
function ReviewView({ state, focusKey, onChoose, onConfirm, onUnknown }: ReviewProps) {
  const { result } = state;
  const candidates =
    result.kind === "choose" ? result.candidates : result.kind === "confirm" ? [result.candidate] : [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-center gap-2">
        <ImageSlot className="h-[160px] w-full" />
        <ScreenHeading focusKey={focusKey}>이 단어를 물어본 거야?</ScreenHeading>
        <p className="text-center text-caption">모야가 잘 못 들었어요. 아래 단어 중에 골라봐요!</p>
      </div>
      {candidates.length > 0 && (
        <>
          <div aria-hidden className="h-0" />
          <section aria-labelledby="review-candidates" className="flex flex-col gap-4">
            <h2 id="review-candidates" className="text-body font-semibold">
              혹시 이 말이야?
            </h2>
            <ul className="flex h-[204px] gap-3">
              {candidates.map(({ entry }) => (
                <li
                  key={entry.id}
                  className={`${boxClass} flex w-[calc((100%-24px)/3)] shrink-0 flex-col items-start gap-3 overflow-hidden`}
                >
                  <ImageSlot className="h-[100px] w-full" />
                  <p className="w-full text-body font-semibold">{entry.word}</p>
                  <SoundButton
                    label="들어보기"
                    text={`${entry.word}. ${entry.hint}`}
                    ariaLabel={`${entry.word} 들어보기`}
                  />
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
      <div aria-hidden className="h-0" />
      <div className="flex flex-col items-center gap-3">
        <ImageSlot className="h-12 w-full" />
        <p className="text-caption">다시 말해봐요!</p>
        {result.kind === "choose" && <Button onClick={onChoose}>후보 단어 고르기</Button>}
      </div>
      {result.kind !== "choose" && (
        <div className="flex flex-col items-center gap-2">
          {result.kind === "confirm" ? (
            <Button variant="link" onClick={onConfirm}>
              단어 확인 질문 보기
            </Button>
          ) : (
            <Button variant="link" onClick={onUnknown}>
              물어볼 단어 안내 보기
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
