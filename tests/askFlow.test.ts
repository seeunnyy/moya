import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createAskReducer,
  initialAskState,
  type AskAction,
  type AskState,
} from "../src/lib/askFlow.ts";
import { LEGACY_WORDS as MOCK_WORDS } from "./fixtures/legacyWords.ts";
import { BLOCKED_WORDS } from "../src/data/blocklist.ts";

const reduce = createAskReducer(MOCK_WORDS);
const run = (actions: AskAction[], from: AskState = initialAskState) =>
  actions.reduce(reduce, from);
const ask = (text: string): AskAction => ({ type: "recognized", transcripts: [text] });

test("마이크 경로: idle → listening → thinking → review", () => {
  const listening = run([{ type: "startListening" }]);
  assert.equal(listening.phase, "listening");
  const thinking = run([{ type: "recordingDone" }], listening);
  assert.equal(thinking.phase, "thinking");
  const review = run([ask("공룡이 뭐야")], thinking);
  assert.equal(review.phase, "review");
  if (review.phase !== "review") return;
  assert.equal(review.spokenAs, "공룡");
  assert.equal(review.result.kind, "confirm");
});

test("인식 실패 → sttFailed, \"<\"는 음성 녹음 대기로", () => {
  const s = run([{ type: "startListening" }, { type: "recordingDone" }, { type: "sttFailed" }]);
  assert.equal(s.phase, "sttFailed");
  assert.deepEqual(run([{ type: "back" }], s), initialAskState);
});

test("질문 형태가 아니거나 비어 있으면 sttFailed (QA-06)", () => {
  assert.equal(run([ask("공룡")]).phase, "sttFailed");
  assert.equal(run([ask("")]).phase, "sttFailed");
});

test("링크 \"다시 말하기\" → E2, [다시 녹음하기] → idle", () => {
  const guide = run([{ type: "showRetryGuide" }]);
  assert.equal(guide.phase, "sttFailed");
  assert.deepEqual(run([{ type: "retry" }], guide), initialAskState);
  assert.deepEqual(run([{ type: "back" }], guide), initialAskState);
  // 듣는 중에는 링크가 동작하지 않는다
  const listening = run([{ type: "startListening" }]);
  assert.equal(run([{ type: "showRetryGuide" }], listening), listening);
});

test("QA-01: 공룡 → review → 단어 확인 질문 → [네, 맞아요] → explaining → saved", () => {
  const confirm = run([ask("공룡이 뭐야?"), { type: "openConfirm" }]);
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

test("QA-02: 가바 → review(choose) → 후보 카드 선택 → 데이터 순(가방 먼저) → 카드 누름", () => {
  const review = run([ask("가바가 뭐야?")]);
  assert.equal(review.phase === "review" && review.result.kind, "choose");
  const choose = run([{ type: "openChoose" }], review);
  assert.equal(choose.phase, "choose");
  if (choose.phase !== "choose") return;
  assert.equal(choose.candidates[0].entry.word, "가방");

  const explaining = run([{ type: "pickCandidate", entryId: "gabal-1" }], choose);
  assert.equal(explaining.phase, "explaining");
  if (explaining.phase !== "explaining") return;
  assert.equal(explaining.entry.word, "가발");
  assert.equal(explaining.spokenAs, "가바");
});

test("되묻기 결과에 맞지 않는 버튼 동작은 무시한다", () => {
  const review = run([ask("가바가 뭐야?")]);
  assert.equal(run([{ type: "openConfirm" }], review), review);
  assert.equal(run([{ type: "openUnknown" }], review), review);
  const one = run([ask("두박이 뭐야?")]);
  assert.equal(run([{ type: "openChoose" }], one), one);
});

test("QA-03: 두박·대풍·저그통 → 되묻기 후보 1개 → 원래 단어 확인 질문", () => {
  for (const [text, word] of [
    ["두박이 뭐야?", "수박"],
    ["대풍이 뭐야?", "태풍"],
    ["저그통이 뭐야?", "저금통"],
  ]) {
    const s = run([ask(text), { type: "openConfirm" }]);
    assert.equal(s.phase, "confirm", text);
    if (s.phase === "confirm") assert.equal(s.candidate.entry.word, word);
  }
});

test("QA-04: 뿌잉뿌잉 → review(unknown) → 물어볼 단어 안내, spokenAs 뿌잉뿌잉", () => {
  const review = run([ask("뿌잉뿌잉이 뭐야?")]);
  assert.equal(review.phase === "review" && review.result.kind, "unknown");
  const s = run([{ type: "openUnknown" }], review);
  assert.equal(s.phase, "unknown");
  if (s.phase !== "unknown") return;
  assert.equal(s.spokenAs, "뿌잉뿌잉");
  assert.equal(s.pendingSaved, false);
  const saved = run([{ type: "pendingSaved" }], s);
  assert.equal(saved.phase === "unknown" && saved.pendingSaved, true);
});

test("QA-05: [아니에요] 두 번 → 첫 번째는 idle, 두 번째는 unknown", () => {
  const first = run([ask("공룡이 뭐야?"), { type: "openConfirm" }, { type: "reject" }]);
  assert.deepEqual(first, { phase: "idle", retryCount: 1 });

  const second = run([ask("공룡이 뭐야?"), { type: "openConfirm" }, { type: "reject" }], first);
  assert.equal(second.phase, "unknown");
  if (second.phase !== "unknown") return;
  assert.equal(second.spokenAs, "공룡");
  assert.equal(second.retryCount, 1);
});

test("[여기 없어요] 두 번 → unknown", () => {
  const first = run([ask("가바가 뭐야?"), { type: "openChoose" }, { type: "reject" }]);
  assert.deepEqual(first, { phase: "idle", retryCount: 1 });
  const second = run([ask("가바가 뭐야?"), { type: "openChoose" }, { type: "reject" }], first);
  assert.equal(second.phase, "unknown");
});

test("back: 단어 카드 → 확인 질문 → 되묻기 → 음성 녹음", () => {
  const card = run([ask("두박이 뭐야?"), { type: "openConfirm" }, { type: "confirmYes" }]);
  assert.equal(card.phase, "explaining");
  const confirm = run([{ type: "back" }], card);
  assert.equal(confirm.phase, "confirm");
  const review = run([{ type: "back" }], confirm);
  assert.equal(review.phase, "review");
  assert.deepEqual(run([{ type: "back" }], review), initialAskState);
  // 음성 녹음 화면에는 이전 화면이 없다 (화면이 홈으로 보낸다)
  assert.equal(run([{ type: "back" }]), initialAskState);
});

test("back: 후보 카드 선택 → 되묻기, 다시 말하기 횟수는 그대로", () => {
  const first = run([ask("공룡이 뭐야?"), { type: "openConfirm" }, { type: "reject" }]);
  const choose = run([ask("가바가 뭐야?"), { type: "openChoose" }], first);
  const review = run([{ type: "back" }], choose);
  assert.equal(review.phase, "review");
  assert.equal(review.retryCount, 1);
});

test("restart → 다시 말하기 횟수도 처음부터", () => {
  const s = run([ask("공룡이 뭐야?"), { type: "openConfirm" }, { type: "reject" }, { type: "restart" }]);
  assert.deepEqual(s, initialAskState);
});

test("[다시 녹음하기](retry) → idle, 다시 말하기 횟수는 그대로", () => {
  const failed = run([ask("공룡이 뭐야?"), { type: "openConfirm" }, { type: "reject" }, ask("공룡")]);
  assert.equal(failed.phase, "sttFailed");
  assert.deepEqual(run([{ type: "retry" }], failed), { phase: "idle", retryCount: 1 });
  const confirm = run([ask("공룡이 뭐야?"), { type: "openConfirm" }]);
  assert.equal(run([{ type: "retry" }], confirm), confirm);
});

test("지금 상태에 맞지 않는 동작은 무시한다", () => {
  assert.equal(run([{ type: "confirmYes" }]), initialAskState);
  assert.equal(run([{ type: "cardSaved" }]), initialAskState);
  assert.equal(run([{ type: "recordingDone" }]), initialAskState);
  const review = run([ask("공룡이 뭐야?")]);
  assert.equal(run([ask("가바가 뭐야?")], review), review);
  const listening = run([{ type: "startListening" }]);
  assert.equal(run([ask("공룡이 뭐야?")], listening), listening);
  const choose = run([ask("가바가 뭐야?"), { type: "openChoose" }]);
  assert.equal(run([{ type: "pickCandidate", entryId: "없음" }], choose), choose);
});

test("05 §5 데모: 예시 질문만으로 수박·가방 설명, 뿌잉뿌잉 물어볼 단어 (QA-11)", () => {
  // 옛 시연 문장 (픽스처 단어용). 새 흐름 테스트는 그룹 3에서 다시 쓴다
  const [dubak, gaba, ppuing] = ["두박이 뭐야?", "가바가 뭐야?", "뿌잉뿌잉이 뭐야?"];

  const suBak = run([ask(dubak), { type: "openConfirm" }, { type: "confirmYes" }]);
  assert.equal(suBak.phase === "explaining" && suBak.entry.word, "수박");

  const choose = run([ask(gaba), { type: "openChoose" }]);
  assert.equal(choose.phase, "choose");
  if (choose.phase !== "choose") return;
  const picked = run([{ type: "pickCandidate", entryId: choose.candidates[0].entry.id }], choose);
  assert.equal(picked.phase === "explaining" && picked.entry.word, "가방");

  assert.equal(run([ask(ppuing), { type: "openUnknown" }]).phase, "unknown");
});

test("부적절 단어 → blocked, 되묻기·저장 단계로 가지 않는다 (content-safety)", () => {
  const guarded = createAskReducer(MOCK_WORDS, BLOCKED_WORDS);
  const s = guarded(initialAskState, ask(`${BLOCKED_WORDS[0]}이 뭐야?`));
  assert.equal(s.phase, "blocked");
  assert.ok(!("spokenAs" in s), "단어를 상태에 남기지 않는다");
  // 어떤 저장 트리거(explaining·unknown)로도 넘어가지 않는다
  const actions: AskAction[] = [
    { type: "openConfirm" },
    { type: "openChoose" },
    { type: "openUnknown" },
    { type: "confirmYes" },
    { type: "reject" },
    { type: "cardSaved" },
    { type: "pendingSaved" },
  ];
  for (const action of actions) {
    assert.equal(guarded(s, action).phase, "blocked");
  }
  assert.equal(guarded(s, { type: "retry" }).phase, "idle");
  assert.equal(guarded(s, { type: "back" }).phase, "idle");
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
  assert.equal(guarded(initialAskState, ask("공룡이 뭐야?")).phase, "review");
});
