import { test } from "node:test";
import assert from "node:assert/strict";
import { MAX_CANDIDATES, MAX_DISTANCE, MAX_RETRY } from "../src/lib/config.ts";

test("되묻기 설정값", () => {
  assert.equal(MAX_DISTANCE, 2);
  assert.equal(MAX_CANDIDATES, 3);
  assert.equal(MAX_RETRY, 1);
});
