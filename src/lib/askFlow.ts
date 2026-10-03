// /app 묻기 흐름 상태 기계 (04 §4). 단어 데이터를 받아 reducer를 만드는 순수 함수다.
// 저장(카드·물어볼 단어)은 reducer 밖에서 하고, 결과만 cardSaved / pendingSaved로 알려 준다.
//
// idle → listening → thinking ─┬→ confirm ──────────┬→ explaining → saved → idle
//                              ├→ context → choose ─┘
//                              └→ unknown → idle
// 오류: micDenied, sttFailed

import type { Candidate, HeardContext, WordEntry } from "../types/index.ts";
import { MAX_RETRY } from "./config.ts";
import { inferWord, orderByContext } from "./pronunciation/candidates.ts";
import { extractTargets } from "./pronunciation/extract.ts";

export type AskState =
  | { phase: "idle"; retryCount: number }
  | { phase: "listening"; retryCount: number }
  | { phase: "thinking"; retryCount: number }
  | { phase: "confirm"; retryCount: number; spokenAs: string; candidate: Candidate }
  | { phase: "context"; retryCount: number; spokenAs: string; candidates: Candidate[] }
  | {
      phase: "choose";
      retryCount: number;
      spokenAs: string;
      candidates: Candidate[];
      heardContext?: HeardContext;
    }
  | {
      phase: "unknown";
      retryCount: number;
      spokenAs: string;
      heardContext?: HeardContext;
      pendingSaved: boolean;
    }
  | {
      phase: "explaining" | "saved";
      retryCount: number;
      spokenAs: string;
      entry: WordEntry;
      heardContext?: HeardContext;
    }
  | { phase: "micDenied"; retryCount: number }
  | { phase: "sttFailed"; retryCount: number };

export type AskAction =
  | { type: "startListening" }
  | { type: "stopListening" } // [그만하기]
  | { type: "recordingDone" }
  | { type: "micDenied" }
  | { type: "sttFailed" }
  | { type: "recognized"; transcripts: string[] } // 인식 후보 또는 텍스트 입력 1개
  | { type: "confirmYes" } // [응]
  | { type: "reject" } // [아니야] / [다 아니야]
  | { type: "pickContext"; context?: HeardContext } // [모르겠어]면 context 없음
  | { type: "pickCandidate"; entryId: string } // [이거야!]
  | { type: "cardSaved" }
  | { type: "pendingSaved" }
  | { type: "restart" }; // 새 질문 시작

export const initialAskState: AskState = { phase: "idle", retryCount: 0 };

// 새 질문을 받을 수 있는 상태 (S1, E1, E2)
const ASKING = ["idle", "micDenied", "sttFailed", "thinking"];

export function createAskReducer(entries: WordEntry[]) {
  return function askReducer(state: AskState, action: AskAction): AskState {
    const { retryCount } = state;

    switch (action.type) {
      case "startListening":
        return ["idle", "micDenied", "sttFailed"].includes(state.phase)
          ? { phase: "listening", retryCount }
          : state;

      case "stopListening":
        return state.phase === "listening" ? { phase: "idle", retryCount } : state;

      case "recordingDone":
        return state.phase === "listening" ? { phase: "thinking", retryCount } : state;

      case "micDenied":
        return state.phase === "idle" || state.phase === "listening"
          ? { phase: "micDenied", retryCount }
          : state;

      case "sttFailed":
        return state.phase === "thinking" ? { phase: "sttFailed", retryCount } : state;

      case "recognized": {
        if (!ASKING.includes(state.phase)) return state;
        const targets = extractTargets(action.transcripts);
        if (targets.length === 0) return { phase: "sttFailed", retryCount };
        const spokenAs = targets[0];
        const result = inferWord(targets, entries);
        if (result.kind === "confirm") {
          return { phase: "confirm", retryCount, spokenAs, candidate: result.candidate };
        }
        if (result.kind === "choose") {
          return { phase: "context", retryCount, spokenAs, candidates: result.candidates };
        }
        return { phase: "unknown", retryCount, spokenAs, pendingSaved: false };
      }

      case "confirmYes":
        return state.phase === "confirm"
          ? {
              phase: "explaining",
              retryCount,
              spokenAs: state.spokenAs,
              entry: state.candidate.entry,
            }
          : state;

      case "reject": {
        if (state.phase !== "confirm" && state.phase !== "choose") return state;
        if (retryCount < MAX_RETRY) return { phase: "idle", retryCount: retryCount + 1 };
        return {
          phase: "unknown",
          retryCount,
          spokenAs: state.spokenAs,
          heardContext: state.phase === "choose" ? state.heardContext : undefined,
          pendingSaved: false,
        };
      }

      case "pickContext":
        return state.phase === "context"
          ? {
              phase: "choose",
              retryCount,
              spokenAs: state.spokenAs,
              candidates: orderByContext(state.candidates, action.context),
              heardContext: action.context,
            }
          : state;

      case "pickCandidate": {
        if (state.phase !== "choose") return state;
        const picked = state.candidates.find((c) => c.entry.id === action.entryId);
        if (!picked) return state;
        return {
          phase: "explaining",
          retryCount,
          spokenAs: state.spokenAs,
          entry: picked.entry,
          heardContext: state.heardContext,
        };
      }

      case "cardSaved":
        return state.phase === "explaining" ? { ...state, phase: "saved" } : state;

      case "pendingSaved":
        return state.phase === "unknown" ? { ...state, pendingSaved: true } : state;

      case "restart":
        return initialAskState;
    }
  };
}
