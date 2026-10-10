// 대상 단어(1개 이상)와 역규칙 변형들로 단어 데이터와의 거리를 재서 후보를 만들고,
// 1개 / 여러 개 / 0개로 분기한다. 단어 데이터·보호자가 알려 준 연결은 인자로 받아 순수 함수로 유지한다
// (저장소·외부 API를 읽지 않는다).

import type {
  Candidate,
  CandidateResult,
  HeardContext,
  WordEntry,
} from "../../types/index.ts";
import { MAX_CANDIDATES, MAX_DISTANCE } from "../config.ts";
import { jamoDistance } from "./distance.ts";
import { generateVariants } from "./rules.ts";

// 보호자가 알려 준 연결: 아이가 한 말(대상 단어) → 단어 데이터 id (5-3a). 저장소에서 읽어 호출하는 쪽이 넘긴다.
export type TaughtLinks = Readonly<Record<string, string>>;

// 거리 기준 이하인 단어를 가까운 순으로 최대 MAX_CANDIDATES개 고른다.
// 대상 단어가 여러 개면 합치고, 같은 단어는 가장 가까운 거리만 남긴다(맞은 대상 단어는 spokenAs).
// 거리가 같으면 단어 데이터 순서를 따른다.
// 보호자가 알려 준 단어가 있으면 거리와 상관없이 거리 0의 맨 앞 후보로 둔다(taught).
export function findCandidates(
  targets: string[],
  entries: WordEntry[],
  taught: TaughtLinks = {},
): Candidate[] {
  const taughtFirst: Candidate[] = [];
  for (const target of targets) {
    if (!Object.hasOwn(taught, target)) continue;
    const entry = entries.find((e) => e.id === taught[target]);
    if (entry && !taughtFirst.some((c) => c.entry.id === entry.id)) {
      taughtFirst.push({ entry, distance: 0, spokenAs: target, taught: true });
    }
  }

  const variantsByTarget = targets.map((target) => ({ target, variants: generateVariants(target) }));
  const candidates: Candidate[] = [];
  for (const entry of entries) {
    if (taughtFirst.some((c) => c.entry.id === entry.id)) continue;
    let best: Candidate | null = null;
    for (const { target, variants } of variantsByTarget) {
      for (const variant of variants) {
        const distance = jamoDistance(variant, entry.word);
        if (distance <= MAX_DISTANCE && (!best || distance < best.distance)) {
          best = { entry, distance, spokenAs: target };
        }
      }
    }
    if (best) candidates.push(best);
  }
  candidates.sort((a, b) => a.distance - b.distance);
  return [...taughtFirst, ...candidates].slice(0, MAX_CANDIDATES);
}

export function toResult(candidates: Candidate[]): CandidateResult {
  if (candidates.length === 0) return { kind: "unknown" };
  if (candidates.length === 1) return { kind: "confirm", candidate: candidates[0] };
  return { kind: "choose", candidates };
}

export function inferWord(
  targets: string[],
  entries: WordEntry[],
  taught: TaughtLinks = {},
): CandidateResult {
  return toResult(findCandidates(targets, entries, taught));
}

// 들은 상황이 주어지면 거리가 같은 후보 중 그 상황 태그를 가진 단어를 앞에 둔다.
// 발음상 더 먼 단어가 상황 때문에 앞서지는 않고, 보호자가 알려 준 단어는 맨 앞을 지킨다.
// [잘 모르겠어]면 context 없이 부른다.
export function orderByContext(
  candidates: Candidate[],
  context?: HeardContext,
): Candidate[] {
  if (!context) return candidates;
  return candidates
    .map((c) => ({ ...c, contextMatch: c.entry.contextTags.includes(context) }))
    .sort(
      (a, b) =>
        Number(!!b.taught) - Number(!!a.taught) ||
        a.distance - b.distance ||
        Number(b.contextMatch) - Number(a.contextMatch),
    );
}
