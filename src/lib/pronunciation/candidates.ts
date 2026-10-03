// 대상 단어(1개 이상)와 역규칙 변형들로 단어 데이터와의 거리를 재서 후보를 만들고,
// 1개 / 여러 개 / 0개로 분기한다. 단어 데이터는 인자로 받아 순수 함수로 유지한다.

import type {
  Candidate,
  CandidateResult,
  HeardContext,
  WordEntry,
} from "../../types/index.ts";
import { MAX_CANDIDATES, MAX_DISTANCE } from "../config.ts";
import { jamoDistance } from "./distance.ts";
import { generateVariants } from "./rules.ts";

// 거리 기준 이하인 단어를 가까운 순으로 최대 MAX_CANDIDATES개 고른다.
// 대상 단어가 여러 개면 합치고, 같은 단어는 가장 가까운 거리만 남긴다.
// 거리가 같으면 단어 데이터 순서를 따른다.
export function findCandidates(
  targets: string[],
  entries: WordEntry[],
): Candidate[] {
  const variants = [...new Set(targets.flatMap((t) => generateVariants(t)))];
  if (variants.length === 0) return [];

  const candidates: Candidate[] = [];
  for (const entry of entries) {
    const distance = Math.min(
      ...variants.map((variant) => jamoDistance(variant, entry.word)),
    );
    if (distance <= MAX_DISTANCE) candidates.push({ entry, distance });
  }
  return candidates
    .sort((a, b) => a.distance - b.distance)
    .slice(0, MAX_CANDIDATES);
}

export function toResult(candidates: Candidate[]): CandidateResult {
  if (candidates.length === 0) return { kind: "unknown" };
  if (candidates.length === 1) return { kind: "confirm", candidate: candidates[0] };
  return { kind: "choose", candidates };
}

export function inferWord(targets: string[], entries: WordEntry[]): CandidateResult {
  return toResult(findCandidates(targets, entries));
}

// 들은 상황이 주어지면 거리가 같은 후보 중 그 상황 태그를 가진 단어를 앞에 둔다.
// 발음상 더 먼 단어가 상황 때문에 앞서지는 않는다. [모르겠어]면 context 없이 부른다.
export function orderByContext(
  candidates: Candidate[],
  context?: HeardContext,
): Candidate[] {
  if (!context) return candidates;
  return candidates
    .map((c) => ({ ...c, contextMatch: c.entry.contextTags.includes(context) }))
    .sort(
      (a, b) =>
        a.distance - b.distance || Number(b.contextMatch) - Number(a.contextMatch),
    );
}
