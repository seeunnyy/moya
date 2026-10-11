import { test } from "node:test";
import assert from "node:assert/strict";
import { startSilence, stepSilence } from "../src/lib/silence.ts";

// 0.1초마다 크기를 넣어 끝난 시각(ms)을 돌려준다
function run(levels: number[]): number | null {
  let s = startSilence(0);
  for (let i = 0; i < levels.length; i++) {
    const r = stepSilence(s, levels[i], (i + 1) * 100);
    s = r.state;
    if (r.done) return (i + 1) * 100;
  }
  return null;
}
const quiet = (n: number) => Array(n).fill(0.01);
const voice = (n: number) => Array(n).fill(0.1);

test("말한 뒤 1.2초 조용하면 끝", () => {
  // 1.0초까지 말함, 1.1초부터 조용 → 2.3초에 끝
  assert.equal(run([...voice(10), ...quiet(20)]), 2300);
});

test("말을 안 하면 끝내지 않는다 (최대 녹음 시간이 끝냄)", () => {
  assert.equal(run(quiet(80)), null);
});

test("중간에 잠깐 쉬어도 1.2초가 안 되면 이어서 듣는다", () => {
  assert.equal(run([...voice(5), ...quiet(8), ...voice(5), ...quiet(5)]), null);
});

test("처음 0.8초 안에는 끝내지 않는다", () => {
  // 0.1초 말하고 0.2초부터 조용 → 조용 1.2초가 되는 1.4초에 끝 (그때는 0.8초가 지났다)
  assert.equal(run([...voice(1), ...quiet(20)]), 1400);
});

test("녹음 0.8초 전에는 조용한 시간이 길어도 끝내지 않는다", () => {
  const spoke = stepSilence(startSilence(0), 0.1, 100).state;
  // 조용한 시간을 길게 만들어 넣어도(1.5초) 녹음 시작 0.5초 시점이면 끝내지 않는다
  assert.equal(stepSilence({ ...spoke, quietSince: -1000 }, 0.01, 500).done, false);
});
