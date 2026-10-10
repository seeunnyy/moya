import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createAskReducer,
  initialAskState,
  type AskAction,
  type AskState,
} from "../src/lib/askFlow.ts";
import { MOCK_WORDS } from "../src/data/words.mock.ts";
import { BLOCKED_WORDS } from "../src/data/blocklist.ts";
import { MOCK_STT_TURNS } from "../src/data/examplePrompts.ts";

const reduce = createAskReducer(MOCK_WORDS, { blockedWords: BLOCKED_WORDS });
const run = (actions: AskAction[], from: AskState = initialAskState, r = reduce) => actions.reduce(r, from);
const heard = (...transcripts: string[]): AskAction => ({ type: "recognized", transcripts });
const listenThenHear = (...transcripts: string[]): AskAction[] => [
  { type: "startListening" },
  { type: "stopListening" },
  heard(...transcripts),
];
const words = (s: AskState) =>
  "candidates" in s ? s.candidates.map((c) => c.entry.word) : [];

test("바로 알아들음: 2-1 → 2-2 → 2-3 → 2-4 저금통 → [맞아!] 2-9 → 카드 획득 2-10", () => {
  const listening = run([{ type: "startListening" }]);
  assert.equal(listening.phase, "listening");
  const thinking = run([{ type: "stopListening" }], listening);
  assert.equal(thinking.phase, "thinking");
  const confirm = run([heard("저금통이 뭐야?")], thinking);
  assert.equal(confirm.phase, "confirm");
  assert.equal(words(confirm)[0], "저금통");

  const explaining = run([{ type: "answerYes" }], confirm);
  assert.equal(explaining.phase, "explaining");
  if (explaining.phase !== "explaining") return;
  assert.equal(explaining.entry.word, "저금통");
  assert.equal(explaining.spokenAs, "저금통");

  const collected = run(
    [{ type: "cardCollected", cardId: "c1", isNew: true, missionCompleted: false }],
    explaining,
  );
  assert.deepEqual(collected, {
    phase: "collected",
    entry: explaining.entry,
    spokenAs: "저금통",
    cardId: "c1",
    isNew: true,
    missionCompleted: false,
    missionSuccessOpen: false,
  });
});

test("헷갈릴 때: mock 첫 묶음 → 2-4 저금통 → [아니야] 2-5 → [잘 모르겠어] 2-6 저금통·저울·조금 → 저울 → 2-9", () => {
  const confirm = run(listenThenHear(...MOCK_STT_TURNS[0]));
  assert.equal(confirm.phase, "confirm");
  assert.deepEqual(words(confirm), ["저금통", "저울", "조금"]);

  const context = run([{ type: "answerNo" }], confirm);
  assert.equal(context.phase, "context");
  const choose = run([{ type: "pickContext", context: null }], context);
  assert.equal(choose.phase, "choose");
  // 2-4에서 아니라고 한 저금통도 남는다
  assert.deepEqual(words(choose), ["저금통", "저울", "조금"]);
  assert.equal(choose.phase === "choose" && choose.heardContext, undefined);

  const explaining = run([{ type: "pickCandidate", entryId: "jeoul-1" }], choose);
  assert.equal(explaining.phase, "explaining");
  if (explaining.phase !== "explaining") return;
  assert.equal(explaining.entry.word, "저울");
  // '내가 말한 소리'는 저울과 맞은 인식 후보
  assert.equal(explaining.spokenAs, "저욷");
});

test("헷갈릴 때: 들은 곳을 고르면 같은 거리 후보 중 그 태그가 앞에 오고, 카드에 들은 곳이 남는다", () => {
  const choose = run([...listenThenHear(...MOCK_STT_TURNS[0]), { type: "answerNo" }, { type: "pickContext", context: "outside" }]);
  assert.equal(choose.phase, "choose");
  assert.deepEqual(words(choose), ["저울", "저금통", "조금"]); // 저울만 밖에서 태그
  const explaining = run([{ type: "pickCandidate", entryId: "jogeum-1" }], choose);
  assert.equal(explaining.phase === "explaining" && explaining.heardContext, "outside");
  assert.equal(explaining.phase === "explaining" && explaining.spokenAs, "조굼");
});

test("다 아니야 → 2-8, 말한 소리는 첫 대상 단어", () => {
  const unknown = run([
    ...listenThenHear(...MOCK_STT_TURNS[0]),
    { type: "answerNo" },
    { type: "pickContext", context: "book" },
    { type: "noneOfThese" },
  ]);
  assert.deepEqual(unknown, { phase: "unknown", spokenAs: "저굼통" });
});

test("모르는 단어: 저구멍 → 2-8, [알았어!] → 2-1, [다른 말 물어볼래] → 2-2", () => {
  const unknown = run(listenThenHear(...MOCK_STT_TURNS[1]));
  assert.deepEqual(unknown, { phase: "unknown", spokenAs: "저구멍" });
  assert.deepEqual(run([{ type: "goHome" }], unknown), initialAskState);
  assert.equal(run([{ type: "startListening" }], unknown).phase, "listening");
});

test("못 알아들음: 빈 결과·질문 형태 아님 → 2-7, 마이크 → 2-2", () => {
  for (const transcripts of [MOCK_STT_TURNS[2], ["저금통"], [""]]) {
    const retry = run(listenThenHear(...transcripts));
    assert.deepEqual(retry, { phase: "retry", fallback: false }, JSON.stringify(transcripts));
    assert.equal(run([{ type: "startListening" }], retry).phase, "listening");
  }
  const failed = run([{ type: "startListening" }, { type: "stopListening" }, { type: "recognitionFailed", reason: "empty" }]);
  assert.deepEqual(failed, { phase: "retry", fallback: false });
});

test("2-7 [글자 카드로 고를래] → 고를 후보가 없어 폴백, 글자 입력으로 같은 흐름", () => {
  const fallback = run([...listenThenHear(), { type: "chooseByLetters" }]);
  assert.deepEqual(fallback, { phase: "retry", fallback: true });
  assert.equal(run([heard("우싼이 뭐야?")], fallback).phase, "confirm");
});

test("네트워크 오류 → E-1, [다시 해 볼래] → 2-2, [처음으로] → 2-1", () => {
  const error = run([{ type: "startListening" }, { type: "stopListening" }, { type: "recognitionFailed", reason: "network" }]);
  assert.deepEqual(error, { phase: "networkError" });
  assert.equal(run([{ type: "startListening" }], error).phase, "listening");
  assert.deepEqual(run([{ type: "goHome" }], error), initialAskState);
});

test("마이크 불가 → E-2, 폴백 글자 입력으로 진행, 권한을 다시 받으면 2-2", () => {
  const off = run([{ type: "micUnavailable" }]);
  assert.deepEqual(off, { phase: "micOff" });
  const confirm = run([heard("저굼통이 뭐야?")], off);
  assert.equal(confirm.phase, "confirm");
  assert.equal(words(confirm)[0], "저금통");
  assert.equal(run([{ type: "startListening" }], off).phase, "listening");
});

test("2-1 폴백 예시 버튼은 생각 중과 같은 흐름", () => {
  assert.equal(run([heard("우싼이 뭐야?")]).phase, "confirm");
});

test("부적절 단어 → blocked (후보 찾기 없음), 마이크로 다시", () => {
  const blocked = run(listenThenHear(`${BLOCKED_WORDS[0]}이 뭐야?`, "저굼통이 뭐야?"));
  assert.deepEqual(blocked, { phase: "blocked" });
  assert.equal(run([{ type: "startListening" }], blocked).phase, "listening");
});

test("미션 세 번째 카드: 우싼 → 2-4 우산 → 2-9 → 2-13 → 1.5초 뒤 2-14", () => {
  const collected = run([
    ...listenThenHear(...MOCK_STT_TURNS[3]),
    { type: "answerYes" },
    { type: "cardCollected", cardId: "c3", isNew: true, missionCompleted: true },
  ]);
  assert.equal(collected.phase, "collected");
  if (collected.phase !== "collected") return;
  assert.equal(collected.entry.word, "우산");
  assert.equal(collected.spokenAs, "우싼");
  assert.equal(collected.missionCompleted, true);
  assert.equal(collected.missionSuccessOpen, false);
  const success = run([{ type: "openMissionSuccess" }], collected);
  assert.equal(success.phase === "collected" && success.missionSuccessOpen, true);
});

test("이미 있던 단어는 미션 성공으로 보지 않고, 미션 창도 열리지 않는다", () => {
  const collected = run([
    heard("우싼이 뭐야?"),
    { type: "answerYes" },
    { type: "cardCollected", cardId: "old", isNew: false, missionCompleted: true },
  ]);
  assert.equal(collected.phase === "collected" && collected.missionCompleted, false);
  assert.equal(run([{ type: "openMissionSuccess" }], collected), collected);
});

test("보호자가 알려 준 단어가 2-4 첫 후보", () => {
  const taughtReduce = createAskReducer(MOCK_WORDS, { taught: { 저구멍: "jeogeumtong-1" } });
  const confirm = run(listenThenHear("저구멍이 뭐야?"), initialAskState, taughtReduce);
  assert.equal(confirm.phase, "confirm");
  assert.equal(words(confirm)[0], "저금통");
});

test("그 상태에 맞지 않는 액션은 무시한다", () => {
  const idle = initialAskState;
  for (const action of [
    { type: "stopListening" },
    { type: "answerYes" },
    { type: "answerNo" },
    { type: "pickContext", context: "home" },
    { type: "pickCandidate", entryId: "jeoul-1" },
    { type: "noneOfThese" },
    { type: "chooseByLetters" },
    { type: "recognitionFailed", reason: "network" },
    { type: "cardCollected", cardId: null, isNew: true, missionCompleted: false },
    { type: "openMissionSuccess" },
  ] satisfies AskAction[]) {
    assert.equal(run([action], idle), idle, action.type);
  }
  // 듣는 중·생각 중에는 마이크를 다시 눌러도 새로 시작하지 않는다
  const thinking = run([{ type: "startListening" }, { type: "stopListening" }]);
  assert.equal(run([{ type: "startListening" }], thinking), thinking);
  // 2-4에서는 들은 말이 다시 들어와도 무시
  const confirm = run([heard("저굼통이 뭐야?")]);
  assert.equal(run([heard("우싼이 뭐야?")], confirm), confirm);
  // 2-6에 없는 카드
  const choose = run([{ type: "answerNo" }, { type: "pickContext", context: null }], confirm);
  assert.equal(run([{ type: "pickCandidate", entryId: "usan-1" }], choose), choose);
});
