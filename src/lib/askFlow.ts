// /app/ask 묻기 흐름 상태 기계 (04 §4). 단어 데이터를 받아 reducer를 만드는 순수 함수다.
// 저장(카드·물어볼 단어)은 reducer 밖에서 하고, 결과만 cardSaved / pendingSaved로 알려 준다.
//
// idle(S1) → listening → thinking ─┬→ review(S12) ─┬ openChoose  → choose(S4) ─카드→ explaining(S5) → saved
//    │                             │               ├ openConfirm → confirm(S3) ─[네, 맞아요]→ explaining
//    │                             │               └ openUnknown → unknown(S6)
//    │                             ├→ sttFailed(E2)  (인식 실패·추출 실패)
//    │                             └→ blocked(E3)    (부적절 단어, 후보 찾기·저장 없음)
//    └ 링크 "다시 말하기"(showRetryGuide) → sttFailed ─[다시 녹음하기](retry)→ idle (retryCount 유지)
// back: 각 상태가 직전 상태(from)를 들고 있어 "<"로 돌아간다.
// 마이크를 쓸 수 없는 것(E1)은 상태가 아니라 화면 쪽 표시다.

import type { Candidate, CandidateResult, WordEntry } from "../types/index.ts";
import { MAX_RETRY } from "./config.ts";
import { inferWord } from "./pronunciation/candidates.ts";
import { extractTargets } from "./pronunciation/extract.ts";

// 음성 녹음 화면(S1)의 상태. 듣는 중·생각 중은 같은 화면에서 버튼 글자만 바뀐다.
export type AskingState = {
  phase: "idle" | "listening" | "thinking";
  retryCount: number;
};

export type AskState =
  | AskingState
  | { phase: "sttFailed"; retryCount: number; from: AskState }
  | { phase: "blocked"; retryCount: number; from: AskState } // 부적절 단어. 단어는 기록하지 않는다
  | { phase: "review"; retryCount: number; spokenAs: string; result: CandidateResult; from: AskState }
  | { phase: "confirm"; retryCount: number; spokenAs: string; candidate: Candidate; from: AskState }
  | { phase: "choose"; retryCount: number; spokenAs: string; candidates: Candidate[]; from: AskState }
  | { phase: "unknown"; retryCount: number; spokenAs: string; pendingSaved: boolean; from: AskState }
  | {
      phase: "explaining" | "saved";
      retryCount: number;
      spokenAs: string;
      entry: WordEntry;
      from: AskState;
    };

export type AskAction =
  | { type: "startListening" } // [녹음 시작]
  | { type: "recordingDone" } // [그만하기] 또는 최대 녹음 시간
  | { type: "sttFailed" }
  | { type: "showRetryGuide" } // 링크 "다시 말하기"
  | { type: "retry" } // E2·E3 [다시 녹음하기]. restart와 달리 retryCount를 유지한다
  | { type: "recognized"; transcripts: string[] } // 인식 후보 또는 텍스트 입력 1개
  | { type: "openConfirm" } // 되묻기: "단어 확인 질문 보기"
  | { type: "openChoose" } // 되묻기: [후보 단어 고르기]
  | { type: "openUnknown" } // 되묻기: "물어볼 단어 안내 보기"
  | { type: "confirmYes" } // [네, 맞아요]
  | { type: "reject" } // [아니에요] / [여기 없어요]
  | { type: "pickCandidate"; entryId: string } // 후보 카드 누름
  | { type: "cardSaved" }
  | { type: "pendingSaved" }
  | { type: "back" } // 헤더 "<" (이전 화면)
  | { type: "restart" }; // 새 질문 시작

export const initialAskState: AskState = { phase: "idle", retryCount: 0 };

// "<"로 돌아갈 음성 녹음 화면. 듣는 중·생각 중이 아니라 대기 상태로 돌아간다.
const askingScreen = (retryCount: number): AskState => ({ phase: "idle", retryCount });

// blockedWords: 대상 단어가 이 목록에 있으면 후보 찾기·설명·저장을 하지 않는다 (content-safety).
export function createAskReducer(entries: WordEntry[], blockedWords: string[] = []) {
  return function askReducer(state: AskState, action: AskAction): AskState {
    const { retryCount } = state;

    switch (action.type) {
      case "startListening":
        return state.phase === "idle" ? { phase: "listening", retryCount } : state;

      case "recordingDone":
        return state.phase === "listening" ? { phase: "thinking", retryCount } : state;

      case "sttFailed":
        return state.phase === "thinking"
          ? { phase: "sttFailed", retryCount, from: askingScreen(retryCount) }
          : state;

      case "showRetryGuide":
        return state.phase === "idle" ? { phase: "sttFailed", retryCount, from: state } : state;

      case "retry":
        return state.phase === "sttFailed" || state.phase === "blocked"
          ? askingScreen(retryCount)
          : state;

      case "recognized": {
        // 마이크 경로(thinking) 또는 폴백 텍스트·예시 입력(idle)
        if (state.phase !== "idle" && state.phase !== "thinking") return state;
        const from = askingScreen(retryCount);
        const targets = extractTargets(action.transcripts);
        if (targets.length === 0) return { phase: "sttFailed", retryCount, from };
        // 인식 후보 중 하나라도 부적절 단어면 막는다.
        if (targets.some((t) => blockedWords.includes(t))) {
          return { phase: "blocked", retryCount, from };
        }
        const spokenAs = targets[0];
        return { phase: "review", retryCount, spokenAs, result: inferWord(targets, entries), from };
      }

      case "openConfirm":
        return state.phase === "review" && state.result.kind === "confirm"
          ? {
              phase: "confirm",
              retryCount,
              spokenAs: state.spokenAs,
              candidate: state.result.candidate,
              from: state,
            }
          : state;

      case "openChoose":
        return state.phase === "review" && state.result.kind === "choose"
          ? {
              phase: "choose",
              retryCount,
              spokenAs: state.spokenAs,
              candidates: state.result.candidates,
              from: state,
            }
          : state;

      case "openUnknown":
        return state.phase === "review" && state.result.kind === "unknown"
          ? { phase: "unknown", retryCount, spokenAs: state.spokenAs, pendingSaved: false, from: state }
          : state;

      case "confirmYes":
        return state.phase === "confirm"
          ? {
              phase: "explaining",
              retryCount,
              spokenAs: state.spokenAs,
              entry: state.candidate.entry,
              from: state,
            }
          : state;

      case "reject": {
        if (state.phase !== "confirm" && state.phase !== "choose") return state;
        if (retryCount < MAX_RETRY) return askingScreen(retryCount + 1);
        return {
          phase: "unknown",
          retryCount,
          spokenAs: state.spokenAs,
          pendingSaved: false,
          from: state,
        };
      }

      case "pickCandidate": {
        if (state.phase !== "choose") return state;
        const picked = state.candidates.find((c) => c.entry.id === action.entryId);
        if (!picked) return state;
        return {
          phase: "explaining",
          retryCount,
          spokenAs: state.spokenAs,
          entry: picked.entry,
          from: state,
        };
      }

      case "cardSaved":
        return state.phase === "explaining" ? { ...state, phase: "saved" } : state;

      case "pendingSaved":
        return state.phase === "unknown" ? { ...state, pendingSaved: true } : state;

      case "back":
        return "from" in state ? state.from : state;

      case "restart":
        return initialAskState;
    }
  };
}
