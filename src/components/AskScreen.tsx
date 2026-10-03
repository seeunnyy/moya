"use client";

// /app/ask 묻기 흐름 화면. 상태(04 §4)에 따라 S1~S6, E1, E2를 바꿔 보여준다 (03 §1, Figma 3~9).
// 스타일은 최소. 모야 캐릭터·색·폰트는 디자인 작업에서 입힌다. 이미지는 점선 자리 박스.

import { useEffect, useReducer, useRef, useState } from "react";
import { BLOCKED_WORDS } from "@/data/blocklist";
import { MOCK_WORDS } from "@/data/words.mock";
import { createAskReducer, initialAskState, type AskAction, type AskState } from "@/lib/askFlow";
import { MAX_RECORDING_MS } from "@/lib/config";
import { speaker } from "@/lib/services/speech";
import { addCard, addPending } from "@/lib/storage";
import { BackHeader } from "./BackHeader";
import { Button, LinkButton } from "./Button";
import { CandidatePicker } from "./CandidatePicker";
import { ContextPicker } from "./ContextPicker";
import { ExamplePrompts } from "./ExamplePrompts";
import { ImageSlot } from "./ImageSlot";
import { closeMic, openMic } from "./microphone";
import { PrivacyNotice } from "./PrivacyNotice";
import { contextOption } from "./heardContext";
import { QuestionForm } from "./QuestionForm";
import { SoundButton } from "./SoundButton";
import { cardSpeech, WordCardView } from "./WordCardView";

const askReducer = createAskReducer(MOCK_WORDS, BLOCKED_WORDS);

// crypto.randomUUID는 http(휴대폰에서 개발 서버 접속)에서 없을 수 있어 직접 만든다.
function newId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

// 화면 제목. 문구는 Figma 그대로 (말투 통일은 design.md Open Questions).
function heading(state: AskState): string {
  switch (state.phase) {
    case "idle":
      return "뭐가 궁금해?";
    case "listening":
      return "듣는 중";
    case "thinking":
      return "생각 중";
    case "confirm":
      return "이 단어 맞나요?";
    case "context":
      return "어디서 들었어?";
    case "choose":
      return "이 중에 네가 물어본 단어가 있어?";
    case "explaining":
    case "saved":
      return "단어 카드";
    case "unknown":
      return "물어볼 단어";
    case "blocked":
      return "엄마·아빠한테 물어보자";
    case "micDenied":
      return "마이크를 쓸 수 없어";
    case "sttFailed":
      return "다시 말해줄래?";
  }
}

// 모야의 대사 (aria-live로 읽힘). 소리로는 speechLine이 같은 문장을 읽는다.
function moyaLine(state: AskState): string {
  switch (state.phase) {
    case "idle":
      return state.retryCount > 0
        ? "그럼 한 번 더 말해 줄래?"
        : "궁금한 말이 있어? \"공룡이 뭐야?\"처럼 물어봐!";
    case "listening":
      return "듣고 있어…";
    case "thinking":
      return "음… 생각 중이야";
    case "confirm":
      return `${state.candidate.entry.word} 말하는 거야? ${state.candidate.entry.hint}!`;
    case "context":
      return "어디서 들었어?";
    case "choose": {
      // 되묻기 화면(Figma 5)은 따로 두지 않고 그 안내 문구만 여기서 쓴다 (D1).
      const reply = state.heardContext ? contextOption(state.heardContext)?.reply : "괜찮아!";
      return `${reply} 모야가 잘 못 들었어요. 아래 단어 중에 골라봐요!`;
    }
    case "explaining":
    case "saved":
      return state.entry.kidExplanation;
    case "unknown":
      return "모야가 아직 모르는 단어들이에요. 엄마, 아빠와 함께 이 단어들을 알아보세요!";
    case "blocked":
      return "그 말은 엄마·아빠한테 물어보자!";
    case "micDenied":
      return "마이크를 쓸 수 없어. 글자로 물어봐 줄래?";
    case "sttFailed":
      return "처음부터 다시 시도해봐!";
  }
}

// 소리로 읽을 문장. 화면의 모야 대사와 같다.
// 듣는 중·생각 중에는 읽지 않는다 (모야 목소리가 녹음에 들어가지 않게).
// 단어 카드(S5)는 대사 영역 대신 카드의 "○○이 뭐야? <쉬운 설명>"을 읽는다.
function speechLine(state: AskState): string | null {
  switch (state.phase) {
    case "listening":
    case "thinking":
      return null;
    case "explaining":
    case "saved":
      return cardSpeech(state.entry.word, state.entry.kidExplanation);
    default:
      return moyaLine(state);
  }
}

type Props = {
  micDenied?: boolean; // 권한 안내에서 거부하고 왔으면 E1부터 보여준다 (/app/ask?mic=denied)
};

// 녹음 중인 것들. 화면을 떠나면 정리한다.
type Recording = { recorder: MediaRecorder; stream: MediaStream; timer: number };

export function AskScreen({ micDenied = false }: Props) {
  const startState: AskState = micDenied ? { phase: "micDenied", retryCount: 0 } : initialAskState;
  const [state, dispatch] = useReducer(askReducer, startState);
  const [saveFailed, setSaveFailed] = useState(false);
  const [mockHeard, setMockHeard] = useState<string | null>(null); // 개발용: mock STT가 돌려준 문장

  // 녹음·인식은 비동기로 끝나므로, 그때의 최신 상태를 알도록 send가 다음 상태를 여기에 같이 적는다.
  const current = useRef<AskState>(startState);
  const recording = useRef<Recording | null>(null);
  const left = useRef(false); // 화면을 떠났으면 늦게 온 인식 결과를 버린다

  function apply(action: AskAction) {
    current.current = askReducer(current.current, action);
    dispatch(action);
  }

  // 상태를 바꾼다. 저장은 자동으로 하지 않는다: 단어 카드(S5)와 물어볼 단어(S6) 모두
  // [내 단어장에 저장하기]를 눌러야 저장한다 (D4, saveCard·savePending).
  function send(action: AskAction) {
    apply(action);
    setSaveFailed(false);
  }

  // S6 [내 단어장에 저장하기]. 실패해도 흐름은 그대로, 다시 누를 수 있다 (word-cards 스펙).
  function savePending() {
    const now = current.current;
    if (now.phase !== "unknown" || now.pendingSaved) return;
    const saved = addPending({
      id: newId(),
      spokenAs: now.spokenAs,
      heardContext: now.heardContext,
      createdAt: new Date().toISOString(),
    });
    if (saved) apply({ type: "pendingSaved" });
    setSaveFailed(!saved);
  }

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

  // [녹음 시작] (S1 → S2 듣는 중). 마이크를 못 쓰면 E1.
  async function startRecording() {
    speaker.stop(); // 모야 목소리가 녹음에 섞이지 않게 먼저 멈춘다
    const stream = await openMic();
    if (left.current) {
      if (stream) closeMic(stream);
      return;
    }
    if (!stream) {
      send({ type: "micDenied" });
      return;
    }

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

  // [그만하기] 또는 최대 녹음 시간 (S2 듣는 중 → 생각 중). 녹음한 것을 인식으로 보낸다.
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

  function saveCard() {
    if (state.phase !== "explaining") return;
    const saved = addCard({
      id: newId(),
      wordEntryId: state.entry.id,
      word: state.entry.word,
      dictDefinition: state.entry.dictDefinition,
      kidExplanation: state.entry.kidExplanation,
      example: state.entry.example,
      heardContext: state.heardContext,
      spokenAs: state.spokenAs,
      createdAt: new Date().toISOString(),
    });
    if (saved) apply({ type: "cardSaved" });
    setSaveFailed(!saved);
  }

  const ask = (text: string) => send({ type: "recognized", transcripts: [text] });
  const restart = () => send({ type: "restart" });
  const showCard = state.phase === "explaining" || state.phase === "saved";

  // 화면(대사)이 바뀌면 모야가 그 문장을 소리로 읽는다. 미지원 기기에서는 아무 일도 없다 (FR-08).
  // 저장해서 explaining → saved가 돼도 문장이 같으니 다시 읽지 않는다.
  const spoken = speechLine(state);
  useEffect(() => {
    if (spoken) speaker.speak(spoken);
  }, [spoken]);

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-5 px-4 py-6">
      {/* "<"는 홈으로 간다. 페이지를 떠나면 흐름 상태도 사라지므로 restart와 같다. */}
      <BackHeader href="/app" backLabel="홈" focusKey={state.phase}>
        {heading(state)}
      </BackHeader>

      {/* 모야 자리 + 대사. 단어 카드(S5)에서는 카드 안의 "○○이 뭐야?"가 그 역할을 한다 */}
      {!showCard && (
        <section aria-label="모야" className="flex flex-col gap-2">
          <ImageSlot label="모야 캐릭터 자리" className="h-24" />
          <p aria-live="polite" className="text-lg break-keep">
            {moyaLine(state)}
          </p>
        </section>
      )}

      {/* S1 묻기 대기 (Figma 3) */}
      {state.phase === "idle" && (
        <>
          <ImageSlot label="소리 파형 자리" className="h-16" />
          <Button onClick={startRecording} className="min-h-16 text-lg">
            녹음 시작
          </Button>
        </>
      )}

      {/* E1 마이크를 쓸 수 없음. 아래 텍스트·예시로 계속한다 */}
      {state.phase === "micDenied" && (
        <p className="text-sm break-keep">
          브라우저 설정에서 마이크를 허용하면 다시 말로 물어볼 수 있어.
        </p>
      )}

      {/* E2 다시 말하기 안내 (Figma 4). 다시 말하기 횟수는 그대로 둔다 (retry) */}
      {state.phase === "sttFailed" && (
        <Button onClick={() => send({ type: "retry" })}>다시 녹음하기</Button>
      )}

      {/* S1 · E1 · E2 폴백: 텍스트 입력 + 예시 버튼 (Figma에 없음, 시연 안정성) */}
      {(state.phase === "idle" || state.phase === "micDenied" || state.phase === "sttFailed") && (
        <>
          <QuestionForm onAsk={ask} />
          <ExamplePrompts onAsk={ask} />
          {state.phase === "idle" && <PrivacyNotice />}
        </>
      )}

      {/* S2 듣는 중 / 생각 중 */}
      {state.phase === "listening" && (
        <>
          <ImageSlot label="소리 파형 자리 (듣는 중)" className="h-16" />
          <Button onClick={stopRecording} className="min-h-16 text-lg">
            그만하기
          </Button>
          <p className="-mt-3 text-sm break-keep">다 말했으면 [그만하기]를 눌러 줘.</p>
        </>
      )}

      {/* S3 단어 확인 질문 (Figma 6) */}
      {state.phase === "confirm" && (
        <>
          <section
            aria-label="모야가 찾은 단어"
            className="flex flex-col gap-2 rounded-lg border-2 border-current p-4"
          >
            <ImageSlot label="단어 그림 자리" />
            <p className="text-3xl font-bold break-keep">{state.candidate.entry.word}</p>
            <p className="break-keep">{state.candidate.entry.hint}</p>
            <SoundButton
              label="음성 재생"
              text={`${state.candidate.entry.word}. ${state.candidate.entry.hint}`}
              ariaLabel={`${state.candidate.entry.word} 음성 재생`}
            />
          </section>
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={() => send({ type: "confirmYes" })}>네, 맞아요</Button>
            <Button onClick={() => send({ type: "reject" })}>아니에요</Button>
          </div>
        </>
      )}

      {/* S4 맥락 질문 (Figma에 없음, D2) → 후보 카드 선택 (Figma 7) */}
      {state.phase === "context" && (
        <ContextPicker onPick={(context) => send({ type: "pickContext", context })} />
      )}
      {state.phase === "choose" && (
        <CandidatePicker
          candidates={state.candidates}
          onPick={(entryId) => send({ type: "pickCandidate", entryId })}
          onNone={() => send({ type: "reject" })}
        />
      )}

      {/* S5 단어 카드 (Figma 8). [내 단어장에 저장하기]를 눌러야 저장한다 (D4) */}
      {showCard && (
        <>
          <WordCardView
            word={state.entry.word}
            kidExplanation={state.entry.kidExplanation}
            example={state.entry.example}
            heardContext={state.heardContext}
          />
          <Button onClick={saveCard} disabled={state.phase === "saved"}>
            {state.phase === "saved" ? "저장했어!" : "내 단어장에 저장하기"}
          </Button>
          <p role="status" className="-mt-3 text-sm break-keep">
            {state.phase === "saved" && <span className="sr-only">단어장에 저장했어!</span>}
            {saveFailed && "저장하지 못했어. 다시 눌러 볼래?"}
          </p>
          <LinkButton href="/app/cards">단어 카드 목록으로</LinkButton>
          {/* Figma에 없는 보조 버튼. 시연 때 장면을 이어서 보여주기 위해 둔다 */}
          <Button onClick={restart} className="border-dashed">
            또 물어보기
          </Button>
        </>
      )}

      {/* 부적절 단어 안내 (content-safety, Figma에 없음). 단어를 보여주거나 저장하지 않는다 */}
      {state.phase === "blocked" && (
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={restart}>또 물어보기</Button>
          <LinkButton href="/app/cards">단어 카드 목록</LinkButton>
        </div>
      )}

      {/* S6 물어볼 단어 안내 (Figma 9) */}
      {state.phase === "unknown" && (
        <>
          <section
            aria-label="이번에 물은 말"
            className="rounded-lg border-2 border-dashed border-current p-4"
          >
            <p className="text-xl font-bold break-keep">{state.spokenAs}</p>
          </section>
          {/* 물어볼 단어도 눌러야 저장한다. 버튼 이름은 단어 카드(S5)와 같다 */}
          <Button onClick={savePending} disabled={state.pendingSaved}>
            {state.pendingSaved ? "물어볼 단어에 적어 뒀어!" : "내 단어장에 저장하기"}
          </Button>
          <p role="status" className="-mt-3 text-sm break-keep">
            {state.pendingSaved && <span className="sr-only">물어볼 단어에 적어 뒀어!</span>}
            {saveFailed && "저장하지 못했어. 다시 눌러 볼래?"}
          </p>
          {/* Figma에 없는 보조 버튼. 시연 때 장면을 이어서 보여주기 위해 둔다 */}
          <Button onClick={restart} className="border-dashed">
            또 물어보기
          </Button>
        </>
      )}

      {/* 개발 중에만: mock STT가 돌려준 문장 (작업 10.5 실제 STT 전 데모 확인용) */}
      {mockHeard !== null && (
        <p className="text-xs break-keep opacity-70">개발용 mock 인식: &ldquo;{mockHeard}&rdquo;</p>
      )}
    </main>
  );
}
