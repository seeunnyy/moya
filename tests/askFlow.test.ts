import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createAskReducer,
  initialAskState,
  type AskAction,
  type AskState,
} from "../src/lib/askFlow.ts";
import { MOCK_WORDS } from "../src/data/words.mock.ts";

const reduce = createAskReducer(MOCK_WORDS);
const run = (actions: AskAction[], from: AskState = initialAskState) =>
  actions.reduce(reduce, from);
const ask = (text: string): AskAction => ({ type: "recognized", transcripts: [text] });

test("마이크 경로: idle → listening → thinking → confirm", () => {
  const s = run([{ type: "startListening" }, { type: "recordingDone" }, ask("공룡이 뭐야")]);
  assert.equal(s.phase, "confirm");
});

test("[그만하기] → idle", () => {
  assert.equal(run([{ type: "startListening" }, { type: "stopListening" }]).phase, "idle");
});

test("마이크 권한 거부 → micDenied, 텍스트로 계속", () => {
  const denied = run([{ type: "startListening" }, { type: "micDenied" }]);
  assert.equal(denied.phase, "micDenied");
  assert.equal(run([ask("공룡이 뭐야?")], denied).phase, "confirm");
});

test("인식 실패 → sttFailed", () => {
  const s = run([{ type: "startListening" }, { type: "recordingDone" }, { type: "sttFailed" }]);
  assert.equal(s.phase, "sttFailed");
});

test("질문 형태가 아니거나 비어 있으면 sttFailed (QA-06)", () => {
  assert.equal(run([ask("공룡")]).phase, "sttFailed");
  assert.equal(run([ask("")]).phase, "sttFailed");
});

test("QA-01: 공룡 → confirm → [응] → explaining → saved", () => {
  const confirm = run([ask("공룡이 뭐야?")]);
  assert.equal(confirm.phase, "confirm");
  if (confirm.phase !== "confirm") return;
  assert.equal(confirm.candidate.entry.word, "공룡");

  const explaining = run([{ type: "confirmYes" }], confirm);
  assert.equal(explaining.phase, "explaining");
  const saved = run([{ type: "cardSaved" }], explaining);
  assert.equal(saved.phase, "saved");
  if (saved.phase !== "saved") return;
  assert.equal(saved.entry.word, "공룡");
  assert.equal(saved.spokenAs, "공룡");
});

test("QA-02: 가바 → context → [TV] → 가발 먼저 → [이거야!] → heardContext tv", () => {
  const context = run([ask("가바가 뭐야?")]);
  assert.equal(context.phase, "context");
  const choose = run([{ type: "pickContext", context: "tv" }], context);
  assert.equal(choose.phase, "choose");
  if (choose.phase !== "choose") return;
  assert.equal(choose.candidates[0].entry.word, "가발");

  const explaining = run([{ type: "pickCandidate", entryId: "gabal-1" }], choose);
  assert.equal(explaining.phase, "explaining");
  if (explaining.phase !== "explaining") return;
  assert.equal(explaining.entry.word, "가발");
  assert.equal(explaining.heardContext, "tv");
  assert.equal(explaining.spokenAs, "가바");
});

test("QA-02 ③: [모르겠어] → 데이터 순서, heardContext 없음", () => {
  const choose = run([ask("가바가 뭐야?"), { type: "pickContext" }]);
  assert.equal(choose.phase, "choose");
  if (choose.phase !== "choose") return;
  assert.equal(choose.candidates[0].entry.word, "가방");
  assert.equal(choose.heardContext, undefined);
});

test("QA-03: 두박·대풍·저그통 → 원래 단어 확인 질문", () => {
  for (const [text, word] of [
    ["두박이 뭐야?", "수박"],
    ["대풍이 뭐야?", "태풍"],
    ["저그통이 뭐야?", "저금통"],
  ]) {
    const s = run([ask(text)]);
    assert.equal(s.phase, "confirm", text);
    if (s.phase === "confirm") assert.equal(s.candidate.entry.word, word);
  }
});

test("QA-04: 뿌잉뿌잉 → unknown, spokenAs 뿌잉뿌잉", () => {
  const s = run([ask("뿌잉뿌잉이 뭐야?")]);
  assert.equal(s.phase, "unknown");
  if (s.phase !== "unknown") return;
  assert.equal(s.spokenAs, "뿌잉뿌잉");
  assert.equal(s.pendingSaved, false);
  const saved = run([{ type: "pendingSaved" }], s);
  assert.equal(saved.phase === "unknown" && saved.pendingSaved, true);
});

test("QA-05: 두 번 [아니야] → 첫 번째는 idle, 두 번째는 unknown", () => {
  const first = run([ask("공룡이 뭐야?"), { type: "reject" }]);
  assert.deepEqual(first, { phase: "idle", retryCount: 1 });

  const second = run([ask("공룡이 뭐야?"), { type: "reject" }], first);
  assert.equal(second.phase, "unknown");
  if (second.phase !== "unknown") return;
  assert.equal(second.spokenAs, "공룡");
});

test("[다 아니야] 두 번 → unknown, 고른 상황이 남는다", () => {
  const first = run([ask("가바가 뭐야?"), { type: "pickContext", context: "tv" }, { type: "reject" }]);
  assert.equal(first.phase, "idle");
  const second = run(
    [ask("가바가 뭐야?"), { type: "pickContext", context: "tv" }, { type: "reject" }],
    first,
  );
  assert.equal(second.phase, "unknown");
  if (second.phase === "unknown") assert.equal(second.heardContext, "tv");
});

test("restart → 다시 말하기 횟수도 처음부터", () => {
  const s = run([ask("공룡이 뭐야?"), { type: "reject" }, { type: "restart" }]);
  assert.deepEqual(s, initialAskState);
});

test("지금 상태에 맞지 않는 동작은 무시한다", () => {
  assert.equal(run([{ type: "confirmYes" }]), initialAskState);
  assert.equal(run([{ type: "cardSaved" }]), initialAskState);
  const confirm = run([ask("공룡이 뭐야?")]);
  assert.equal(run([ask("가바가 뭐야?")], confirm), confirm);
  const choose = run([ask("가바가 뭐야?"), { type: "pickContext" }]);
  assert.equal(run([{ type: "pickCandidate", entryId: "없음" }], choose), choose);
});
