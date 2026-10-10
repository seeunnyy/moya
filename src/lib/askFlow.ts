// /app 아이 묻기 흐름 상태 기계 (design.md "askFlow를 새 흐름으로", 04 §4). 단어 데이터를 받아 reducer를 만드는 순수 함수다.
// 저장(카드·물어볼 단어)과 별·미션 계산은 reducer 밖(progress.ts)에서 하고, 결과만 cardCollected로 알려 준다.
//
// idle(2-1) → listening(2-2/2-11) → thinking(2-3/2-12) ─┬→ confirm(2-4) ─[맞아!]→ explaining(2-9) ─[알았어!]→ collected(2-10/2-13)
//                                                       │      └[아니야]→ context(2-5) ─들은 곳/잘 모르겠어→ choose(2-6) ─카드→ explaining
//                                                       │                                                     └[다 아니야]→ unknown(2-8)
//                                                       ├→ unknown(2-8)    후보 0개
//                                                       ├→ retry(2-7)      인식 결과가 비었거나 대상 단어를 꺼내지 못함
//                                                       ├→ blocked         부적절 단어 (후보 찾기·저장 없음)
//                                                       └→ networkError(E-1)  어댑터가 한 번 다시 시도한 뒤에도 네트워크 오류
// micOff(E-2): 마이크를 쓸 수 없음. 마이크가 있는 화면 어디서든 갈 수 있다.
// 아이 묻기 화면에는 "<"가 없다. 새로고침·goHome이면 2-1로.

import type { Candidate, HeardContext, WordEntry } from "../types/index.ts";
import { findCandidates, orderByContext, type TaughtLinks } from "./pronunciation/candidates.ts";
import { extractTargets } from "./pronunciation/extract.ts";

export type AskState =
  | { phase: "idle" } // 2-1
  | { phase: "listening" } // 2-2 · 2-11
  | { phase: "thinking" } // 2-3 · 2-12
  | { phase: "confirm"; spokenAs: string; candidates: Candidate[] } // 2-4: candidates[0]을 묻는다
  | { phase: "context"; spokenAs: string; candidates: Candidate[] } // 2-5
  | { phase: "choose"; spokenAs: string; candidates: Candidate[]; heardContext?: HeardContext } // 2-6
  | { phase: "retry"; fallback: boolean } // 2-7. fallback: [글자 카드로 고를래]인데 후보가 없어 글자 입력·예시 버튼을 보임
  | { phase: "unknown"; spokenAs: string } // 2-8 (열릴 때 화면이 물어볼 단어로 저장)
  | { phase: "explaining"; entry: WordEntry; spokenAs: string; heardContext?: HeardContext } // 2-9
  | {
      phase: "collected"; // 2-10 · 2-13
      entry: WordEntry;
      spokenAs: string;
      cardId: string | null; // 저장한(또는 이미 있던) 카드. 저장 실패면 null
      isNew: boolean; // false면 이미 있던 단어라 별·미션이 늘지 않음 (T10)
      missionCompleted: boolean; // 이 카드로 오늘의 미션 성공 → 2-13 말풍선, 1.5초 뒤 2-14
      missionSuccessOpen: boolean; // 2-14 창
    }
  | { phase: "blocked" } // 부적절 단어 안내
  | { phase: "networkError" } // E-1
  | { phase: "micOff" }; // E-2 (폴백 표시)

export type AskAction =
  | { type: "startListening" } // 마이크 · [다른 말 물어볼래] · [또 물어볼래] · [다시 해 볼래] · 2-0 [지금 물어볼래]
  | { type: "stopListening" } // 마이크 다시 누름 · 최대 녹음 시간 · mock 2.5초
  | { type: "recognized"; transcripts: string[] } // 인식 후보(마이크) 또는 글자 입력·예시 버튼 1개(폴백)
  | { type: "recognitionFailed"; reason: "network" | "empty" }
  | { type: "answerYes" } // 2-4 [맞아!]
  | { type: "answerNo" } // 2-4 [아니야]
  | { type: "pickContext"; context: HeardContext | null } // 2-5 들은 곳 · [잘 모르겠어](null)
  | { type: "pickCandidate"; entryId: string } // 2-6 카드
  | { type: "noneOfThese" } // 2-6 [다 아니야]
  | { type: "chooseByLetters" } // 2-7 [글자 카드로 고를래]
  | {
      type: "cardCollected"; // 2-9 [알았어!] → 화면이 저장·별 계산 후 알림
      cardId: string | null;
      isNew: boolean;
      missionCompleted: boolean;
    }
  | { type: "openMissionSuccess" } // 2-13 1.5초 뒤 2-14
  | { type: "micUnavailable" } // 권한 거부·마이크 없음·미지원·http
  | { type: "goHome" }; // 2-8 [알았어!] · E-1 [처음으로] · 탭 · 2-14 닫힘 뒤 등

export const initialAskState: AskState = { phase: "idle" };

const IDLE: AskState = initialAskState;

export type AskReducerOptions = {
  blockedWords?: string[]; // 대상 단어가 여기에 있으면 후보 찾기·설명·저장을 하지 않는다 (content-safety)
  taught?: TaughtLinks; // 보호자가 알려 준 연결 (저장소에서 읽어 넘김). 바뀌면 reducer를 다시 만든다
};

// 폴백 입력을 받는 상태: 2-1(마이크 아래), 2-7 폴백, E-2
const ACCEPTS_TYPED = new Set<AskState["phase"]>(["idle", "retry", "micOff"]);

export function createAskReducer(entries: WordEntry[], options: AskReducerOptions = {}) {
  const { blockedWords = [], taught = {} } = options;

  function afterRecognition(transcripts: string[]): AskState {
    const targets = extractTargets(transcripts);
    if (targets.length === 0) return { phase: "retry", fallback: false };
    // 인식 후보 중 하나라도 부적절 단어면 막는다.
    if (targets.some((t) => blockedWords.includes(t))) return { phase: "blocked" };
    const candidates = findCandidates(targets, entries, taught);
    if (candidates.length === 0) return { phase: "unknown", spokenAs: targets[0] };
    return { phase: "confirm", spokenAs: targets[0], candidates };
  }

  return function askReducer(state: AskState, action: AskAction): AskState {
    switch (action.type) {
      case "startListening":
        return state.phase === "listening" || state.phase === "thinking" ? state : { phase: "listening" };

      case "stopListening":
        return state.phase === "listening" ? { phase: "thinking" } : state;

      case "recognized":
        return state.phase === "thinking" || ACCEPTS_TYPED.has(state.phase)
          ? afterRecognition(action.transcripts)
          : state;

      case "recognitionFailed":
        if (state.phase !== "thinking") return state;
        return action.reason === "network" ? { phase: "networkError" } : { phase: "retry", fallback: false };

      case "answerYes": {
        if (state.phase !== "confirm") return state;
        const first = state.candidates[0];
        return { phase: "explaining", entry: first.entry, spokenAs: first.spokenAs ?? state.spokenAs };
      }

      case "answerNo":
        return state.phase === "confirm"
          ? { phase: "context", spokenAs: state.spokenAs, candidates: state.candidates }
          : state;

      case "pickContext":
        if (state.phase !== "context") return state;
        return {
          phase: "choose",
          spokenAs: state.spokenAs,
          candidates: orderByContext(state.candidates, action.context ?? undefined),
          ...(action.context ? { heardContext: action.context } : {}),
        };

      case "pickCandidate": {
        if (state.phase !== "choose") return state;
        const picked = state.candidates.find((c) => c.entry.id === action.entryId);
        if (!picked) return state;
        return {
          phase: "explaining",
          entry: picked.entry,
          spokenAs: picked.spokenAs ?? state.spokenAs,
          ...(state.heardContext ? { heardContext: state.heardContext } : {}),
        };
      }

      case "noneOfThese":
        return state.phase === "choose" ? { phase: "unknown", spokenAs: state.spokenAs } : state;

      case "chooseByLetters":
        // 2-7은 인식에 실패해서 오므로 고를 후보가 없다 → 글자 입력·예시 버튼 폴백 (잠정 T3)
        return state.phase === "retry" ? { phase: "retry", fallback: true } : state;

      case "cardCollected":
        if (state.phase !== "explaining") return state;
        return {
          phase: "collected",
          entry: state.entry,
          spokenAs: state.spokenAs,
          cardId: action.cardId,
          isNew: action.isNew,
          missionCompleted: action.isNew && action.missionCompleted,
          missionSuccessOpen: false,
        };

      case "openMissionSuccess":
        return state.phase === "collected" && state.missionCompleted
          ? { ...state, missionSuccessOpen: true }
          : state;

      case "micUnavailable":
        return { phase: "micOff" };

      case "goHome":
        return IDLE;
    }
  };
}
