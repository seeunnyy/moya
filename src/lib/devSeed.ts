// 개발·시연용 시드 (작업 3.7, design.md "데모 시드 데이터"). 이 기기 저장소에 정해 둔 상태를 넣는다.
// 개발용 주소 /dev/seed 에서만 부른다(운영 빌드에서는 404, 어느 화면에서도 링크하지 않음).
// 실제 첫 사용은 빈 상태에서 시작한다.
//
// 시드 계정: 이메일 parent@moya.test, 보호자 비밀번호 1234, 아이 "지우"(만 7세).

import { MOCK_WORDS } from "../data/words.mock.ts";
import type { CardStatus, WordCard } from "../types/index.ts";
import { collectAskedCard, localDateKey, type Progress } from "./progress.ts";
import {
  ALL_KEYS,
  DEFAULT_SETTINGS,
  EMPTY_MISSION,
  writeAccount,
  writeCards,
  writeConsent,
  writeMission,
  writePin,
  writeProfile,
  writeSettings,
  writeStars,
  type KeyValueStore,
  type Mission,
  type StarRecord,
} from "./storage/index.ts";

export type SeedStore = KeyValueStore & Pick<Storage, "removeItem">;

export const SEED_EMAIL = "parent@moya.test";
export const SEED_PIN = "1234";
export const SEED_NICKNAME = "지우";

export type SeedPreset = "reset" | "signedUp" | "beforeMission" | "cards3" | "figma";

export const SEED_PRESETS: { key: SeedPreset; label: string; description: string; goTo: string }[] = [
  { key: "reset", label: "처음 상태로 되돌리기", description: "모든 기록을 지워요. 시작(1-1)부터 봐요.", goTo: "/" },
  {
    key: "signedUp",
    label: "가입 끝난 상태로 홈 보기",
    description: "가입·프로필·동의·비밀번호만 있고 카드·별은 0이에요.",
    goTo: "/app",
  },
  {
    key: "beforeMission",
    label: "미션 직전 (오늘 카드 2장)",
    description: "오늘 편의점·나비를 모은 상태. 다음 새 카드가 세 번째(2-13)예요.",
    goTo: "/app",
  },
  {
    key: "cards3",
    label: "카드 3장 모은 상태",
    description: "오늘 저금통·저울·조금을 모아 미션을 끝낸 상태(별 6개, 오늘 로켓 도장).",
    goTo: "/app",
  },
  {
    key: "figma",
    label: "피그마 화면 상태",
    description: "지구 사전 6장(새 카드·복습 중·다 앎), 별 24개, 연속 3일. 피그마와 겹쳐 볼 때.",
    goTo: "/app/dictionary",
  },
];

const entry = (word: string) => {
  const found = MOCK_WORDS.find((e) => e.word === word);
  if (!found) throw new Error(`시드 단어 없음: ${word}`);
  return found;
};

function daysAgo(now: Date, days: number, hour = 10): Date {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - days, hour);
  return d;
}

function writeSignedUp(store: SeedStore, now: Date) {
  const createdAt = daysAgo(now, 6).toISOString(); // "모야랑 7일째"
  writeAccount({ method: "email", email: SEED_EMAIL, loggedIn: true, createdAt }, store);
  writeProfile({ nickname: SEED_NICKNAME, age: 7, createdAt }, store);
  writeConsent({ required: true, optional: false, updatedAt: createdAt }, store);
  writePin(SEED_PIN, store);
  writeSettings(DEFAULT_SETTINGS, store);
}

// 오늘 물어서 모은 카드들 (실제 흐름과 같은 계산으로 만든다)
function askedToday(now: Date, asked: [word: string, spokenAs: string][]): Progress {
  let progress: Progress = { cards: [], stars: [], mission: EMPTY_MISSION };
  asked.forEach(([word, spokenAs], i) => {
    const at = new Date(now.getTime() - (asked.length - i) * 60_000);
    progress = collectAskedCard(progress, { entry: entry(word), spokenAs, now: at, id: `seed-${i + 1}` });
  });
  return progress;
}

function writeProgress(store: SeedStore, p: Progress) {
  writeCards(p.cards, store);
  writeStars(p.stars, store);
  writeMission(p.mission, store);
}

// 피그마 3-1의 6장. '내가 말한 소리'는 피그마 카드에 있는 것(저굼통·우싼·펴니점)만 넣고 나머지는 단어 그대로.
function figmaProgress(now: Date): Progress {
  const cardSpec: [word: string, spokenAs: string, status: CardStatus, daysBefore: number][] = [
    ["씨앗", "씨앗", "mastered", 9],
    ["무지개", "무지개", "mastered", 8],
    ["나비", "나비", "reviewing", 5],
    ["편의점", "펴니점", "reviewing", 3],
    ["우산", "우싼", "new", 2],
    ["저금통", "저굼통", "new", 1],
  ];
  const cards: WordCard[] = cardSpec.map(([word, spokenAs, status, d], i) => {
    const e = entry(word);
    return {
      id: `seed-${i + 1}`,
      wordEntryId: e.id,
      word: e.word,
      dictDefinition: e.dictDefinition,
      kidExplanation: e.kidExplanation,
      example: e.example,
      spokenAs,
      createdAt: daysAgo(now, d).toISOString(),
      status,
    };
  });
  // 연속 3일(어제까지) + 그 전 끊긴 3일. 별: 카드 6 + 미션 6번 × 3 = 24
  const stampDays = [1, 2, 3, 5, 6, 7];
  const stars: StarRecord[] = [
    ...cards.map((c) => ({ reason: "card" as const, amount: 1, at: c.createdAt, word: c.word })),
    ...stampDays.map((d) => ({ reason: "mission" as const, amount: 3, at: daysAgo(now, d, 18).toISOString() })),
  ];
  const mission: Mission = {
    date: localDateKey(now),
    collectedCount: 0,
    completed: false,
    stampDates: stampDays.map((d) => localDateKey(daysAgo(now, d))),
  };
  return { cards, stars, mission };
}

// 고른 상태를 넣는다. 다른 상태 위에 넣어도 섞이지 않게 먼저 모두 지운다.
export function applySeed(preset: SeedPreset, store: SeedStore, now: Date = new Date()): void {
  for (const key of ALL_KEYS) store.removeItem(key);
  if (preset === "reset") return;
  writeSignedUp(store, now);
  if (preset === "beforeMission") writeProgress(store, askedToday(now, [["편의점", "펴니점"], ["나비", "나비"]]));
  if (preset === "cards3")
    writeProgress(store, askedToday(now, [["저금통", "저굼통"], ["저울", "저욷"], ["조금", "조굼"]]));
  if (preset === "figma") writeProgress(store, figmaProgress(now));
}
