import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createAskReducer,
  initialAskState,
  type AskAction,
  type AskState,
} from "../src/lib/askFlow.ts";
import { MOCK_WORDS } from "../src/data/words.mock.ts";
import { EXAMPLE_PROMPTS } from "../src/data/examplePrompts.ts";
import { BLOCKED_WORDS } from "../src/data/blocklist.ts";

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

test("[다시 녹음하기](retry) → idle, 다시 말하기 횟수는 그대로", () => {
  const failed = run([ask("공룡이 뭐야?"), { type: "reject" }, ask("공룡")]);
  assert.equal(failed.phase, "sttFailed");
  assert.deepEqual(run([{ type: "retry" }], failed), { phase: "idle", retryCount: 1 });
  const denied = run([{ type: "startListening" }, { type: "micDenied" }]);
  assert.equal(run([{ type: "retry" }], denied).phase, "idle");
  const confirm = run([ask("공룡이 뭐야?")]);
  assert.equal(run([{ type: "retry" }], confirm), confirm);
});

test("지금 상태에 맞지 않는 동작은 무시한다", () => {
  assert.equal(run([{ type: "confirmYes" }]), initialAskState);
  assert.equal(run([{ type: "cardSaved" }]), initialAskState);
  const confirm = run([ask("공룡이 뭐야?")]);
  assert.equal(run([ask("가바가 뭐야?")], confirm), confirm);
  const choose = run([ask("가바가 뭐야?"), { type: "pickContext" }]);
  assert.equal(run([{ type: "pickCandidate", entryId: "없음" }], choose), choose);
});

test("05 §5 데모 2~4단계: 예시 질문만으로 수박·가발 설명, 뿌잉뿌잉 물어볼 단어 (QA-11)", () => {
  const [dubak, gaba, ppuing] = EXAMPLE_PROMPTS;

  const confirm = run([ask(dubak)]);
  assert.equal(confirm.phase, "confirm");
  const suBak = run([{ type: "confirmYes" }], confirm);
  assert.equal(suBak.phase === "explaining" && suBak.entry.word, "수박");

  const choose = run([ask(gaba), { type: "pickContext", context: "tv" }]);
  assert.equal(choose.phase, "choose");
  if (choose.phase !== "choose") return;
  assert.equal(choose.candidates[0].entry.word, "가발");
  const gabal = run([{ type: "pickCandidate", entryId: choose.candidates[0].entry.id }], choose);
  assert.equal(gabal.phase === "explaining" && gabal.entry.word, "가발");

  assert.equal(run([ask(ppuing)]).phase, "unknown");
});

test("부적절 단어 → blocked, 후보 찾기·저장 단계로 가지 않는다 (content-safety)", () => {
  const guarded = createAskReducer(MOCK_WORDS, BLOCKED_WORDS);
  const s = guarded(initialAskState, ask(`${BLOCKED_WORDS[0]}이 뭐야?`));
  assert.equal(s.phase, "blocked");
  assert.ok(!("spokenAs" in s), "단어를 상태에 남기지 않는다");
  // 어떤 저장 트리거(explaining·unknown)로도 넘어가지 않는다
  const actions: AskAction[] = [
    { type: "confirmYes" },
    { type: "reject" },
    { type: "cardSaved" },
    { type: "pendingSaved" },
  ];
  for (const action of actions) {
    assert.equal(guarded(s, action).phase, "blocked");
  }
  assert.equal(guarded(s, { type: "restart" }).phase, "idle");
});

test("인식 후보 중 하나라도 부적절 단어면 blocked", () => {
  const guarded = createAskReducer(MOCK_WORDS, BLOCKED_WORDS);
  const s = guarded(initialAskState, {
    type: "recognized",
    transcripts: ["공룡이 뭐야", `${BLOCKED_WORDS[0]}이 뭐야`],
  });
  assert.equal(s.phase, "blocked");
});

test("목록에 없는 단어는 평소처럼 되묻기로 간다", () => {
  const guarded = createAskReducer(MOCK_WORDS, BLOCKED_WORDS);
  assert.equal(guarded(initialAskState, ask("공룡이 뭐야?")).phase, "confirm");
});
