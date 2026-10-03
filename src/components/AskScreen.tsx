"use client";

// /app 묻기 흐름 화면. 상태(04 §4)에 따라 S1~S6, E1, E2를 바꿔 보여준다 (03 §1).
// 스타일은 최소. 모야 캐릭터·색·폰트는 디자인 작업에서 입힌다.

import { useEffect, useReducer, useRef } from "react";
import { MOCK_WORDS } from "@/data/words.mock";
import { createAskReducer, initialAskState, type AskAction, type AskState } from "@/lib/askFlow";
import { addCard, addPending } from "@/lib/storage";
import { Button, LinkButton } from "./Button";
import { CandidatePicker } from "./CandidatePicker";
import { ContextPicker } from "./ContextPicker";
import { contextOption } from "./heardContext";
import { QuestionForm } from "./QuestionForm";

const askReducer = createAskReducer(MOCK_WORDS);

// crypto.randomUUID는 http(휴대폰에서 개발 서버 접속)에서 없을 수 있어 직접 만든다.
function newId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function heading(state: AskState): string {
  switch (state.phase) {
    case "idle":
      return "모야에게 물어보기";
    case "listening":
      return "듣는 중";
    case "thinking":
      return "생각 중";
    case "confirm":
      return "이 말 맞아?";
    case "context":
      return "어디서 들었어?";
    case "choose":
      return "어떤 말이야?";
    case "explaining":
    case "saved":
      return state.entry.word;
    case "unknown":
      return "물어볼 단어";
    case "micDenied":
      return "마이크를 쓸 수 없어";
    case "sttFailed":
      return "다시 말해줄래?";
  }
}

// 모야의 대사 (aria-live로 읽힘). 음성 출력은 9.1에서 같은 문장으로 붙인다.
function moyaLine(state: AskState): string {
  switch (state.phase) {
    case "idle":
      return state.retryCount > 0
        ? "그럼 한 번 더 말해 줄래?"
        : "궁금한 말이 있어? \"○○이 뭐야?\" 하고 물어봐!";
    case "listening":
      return "듣고 있어…";
    case "thinking":
      return "음… 생각 중이야";
    case "confirm":
      return `${state.candidate.entry.word} 말하는 거야? ${state.candidate.entry.hint}!`;
    case "context":
      return "어디서 들었어?";
    case "choose":
      return state.heardContext
        ? `${contextOption(state.heardContext)?.reply} 이 중에 있어?`
        : "괜찮아! 이 중에 있어?";
    case "explaining":
    case "saved":
      return state.entry.kidExplanation;
    case "unknown":
      return "모야도 아직 몰라. 나중에 같이 알아보자";
    case "micDenied":
      return "마이크를 쓸 수 없어. 글자로 물어봐 줄래?";
    case "sttFailed":
      return "다시 말해줄래?";
  }
}

export function AskScreen() {
  const [state, dispatch] = useReducer(askReducer, initialAskState);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const shownPhase = useRef(state.phase);

  // 화면이 바뀌면 제목으로 포커스를 옮겨, 키보드·스크린 리더 사용자가 새 화면 처음부터 진행하게 한다.
  // 첫 화면에서는 옮기지 않는다 (이미 입력칸을 누른 아이의 포커스를 빼앗지 않도록).
  useEffect(() => {
    if (shownPhase.current === state.phase) return;
    shownPhase.current = state.phase;
    headingRef.current?.focus();
  }, [state.phase]);

  // 상태를 바꾸고, 설명(S5)·물어볼 단어(S6)에 들어서는 순간 한 번만 저장한다.
  // 저장에 실패해도 흐름은 그대로 진행한다 (word-cards 스펙).
  function send(action: AskAction) {
    const next = askReducer(state, action);
    dispatch(action);

    if (next.phase === "explaining" && state.phase !== "explaining") {
      const saved = addCard({
        id: newId(),
        wordEntryId: next.entry.id,
        word: next.entry.word,
        dictDefinition: next.entry.dictDefinition,
        kidExplanation: next.entry.kidExplanation,
        example: next.entry.example,
        heardContext: next.heardContext,
        spokenAs: next.spokenAs,
        createdAt: new Date().toISOString(),
      });
      if (saved) dispatch({ type: "cardSaved" });
    }

    if (next.phase === "unknown" && state.phase !== "unknown") {
      const saved = addPending({
        id: newId(),
        spokenAs: next.spokenAs,
        heardContext: next.heardContext,
        createdAt: new Date().toISOString(),
      });
      if (saved) dispatch({ type: "pendingSaved" });
    }
  }

  const ask = (text: string) => send({ type: "recognized", transcripts: [text] });
  const restart = () => send({ type: "restart" });

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-5 px-4 py-6">
      <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-bold break-keep">
        {heading(state)}
      </h1>

      {/* 모야 자리 (캐릭터는 디자인 작업에서) + 대사 */}
      <section aria-label="모야" className="rounded-lg border-2 border-dashed border-current p-4">
        <p className="text-sm">모야</p>
        <p aria-live="polite" className="text-lg break-keep">
          {moyaLine(state)}
        </p>
      </section>

      {/* S1 묻기 대기 · E1 마이크 거부 · E2 인식 실패 */}
      {(state.phase === "idle" || state.phase === "micDenied" || state.phase === "sttFailed") && (
        <>
          <QuestionForm onAsk={ask} />
          {state.phase === "idle" && <LinkButton href="/app/cards">단어장</LinkButton>}
        </>
      )}

      {/* S2 듣는 중 / 생각 중 */}
      {state.phase === "listening" && (
        <Button onClick={() => send({ type: "stopListening" })}>그만하기</Button>
      )}

      {/* S3 확인 질문 */}
      {state.phase === "confirm" && (
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={() => send({ type: "confirmYes" })}>응</Button>
          <Button onClick={() => send({ type: "reject" })}>아니야</Button>
        </div>
      )}

      {/* S4 맥락 질문 → 후보 고르기 */}
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

      {/* S5 설명 */}
      {(state.phase === "explaining" || state.phase === "saved") && (
        <>
          <section aria-label="예문" className="flex flex-col gap-1">
            <p className="font-semibold">이렇게 써</p>
            <p className="break-keep">{state.entry.example}</p>
          </section>
          {state.heardContext && (
            <p className="break-keep">{contextOption(state.heardContext)?.label}에서 들은 말이야.</p>
          )}
          {state.phase === "saved" && (
            <p role="status" className="font-semibold">
              단어장에 저장했어!
            </p>
          )}
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={restart}>또 물어보기</Button>
            <LinkButton href="/app/cards">단어장</LinkButton>
          </div>
        </>
      )}

      {/* S6 물어볼 단어 */}
      {state.phase === "unknown" && (
        <>
          <p className="text-xl font-bold">{state.spokenAs}</p>
          {state.pendingSaved && (
            <p role="status" className="font-semibold">
              물어볼 단어에 적어 뒀어!
            </p>
          )}
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={restart}>또 물어보기</Button>
            <LinkButton href="/app/cards">단어장</LinkButton>
          </div>
        </>
      )}
    </main>
  );
}
