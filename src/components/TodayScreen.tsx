"use client";

// 3-3 오늘의 단어 (180:7515) / 3-3a 카드 모았다 (180:7613). 2-1 선물 버튼에서 온다.
// [지구 사전에 넣기] → 카드 + 별 1 (미션에는 세지 않음), 같은 화면이 3-3a로. 오늘 이미 넣었으면 처음부터 3-3a.
// 오늘의 단어가 없으면(모든 단어를 모음) 2-1로.

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MOCK_WORDS } from "@/data/words.mock";
import { newId } from "@/lib/id";
import { addTodayWordCard, pickTodayWord } from "@/lib/progress";
import { speaker } from "@/lib/services/speech";
import { readCards, readStars, readToday, writeCards, writeStars, writeToday } from "@/lib/storage";
import { KidTop } from "./KidTop";
import { useStored } from "./useStored";
import { SpeechBubble } from "./ui/SpeechBubble";
import { TabBar } from "./ui/TabBar";
import { Button } from "./ui/buttons";
import { WordCardSimple } from "./ui/cards";
import { MoyaImage, preloadMoya } from "./ui/Moya";

type Playing = "bubble" | "word" | null;

export function TodayScreen() {
  preloadMoya("excited", 100, "cream"); // 3-3a
  const router = useRouter();
  const cards = useStored(readCards);
  const saved = useStored(readToday);
  const [playing, setPlaying] = useState<Playing>(null);

  const today = cards && saved !== undefined ? pickTodayWord(MOCK_WORDS, cards, saved, new Date()) : undefined;
  const entry = today ? MOCK_WORDS.find((e) => e.id === today.wordEntryId) : undefined;

  // 처음 열면 '열어 봄'으로 저장 (2-1 선물의 새 표시가 꺼짐). 고를 단어가 없으면 2-1로
  useEffect(() => {
    if (today === null) router.replace("/app");
    else if (today && (!saved || saved.date !== today.date || !saved.opened)) writeToday({ ...today, opened: true });
  }, [today, saved, router]);

  if (!today || !entry) {
    return (
      <>
        <KidTop />
        <main className="flex-1" />
        <TabBar selected="play" />
      </>
    );
  }

  const added = today.added;
  const line = added
    ? `${entry.word} 카드 모았다!\n지구 사전에 넣었어!`
    : `오늘의 단어는 ‘${entry.word}’야!\n같이 알아볼까?`;

  function speak(text: string, what: Exclude<Playing, null>) {
    if (speaker.speak(text, () => setPlaying(null))) setPlaying(what);
  }

  function addToDictionary() {
    if (!today || !entry) return;
    const result = addTodayWordCard({ cards: readCards(), stars: readStars() }, { entry, now: new Date(), id: newId() });
    writeCards(result.cards);
    writeStars(result.stars);
    writeToday({ ...today, opened: true, added: true });
    speak(`${entry.word} 카드 모았다!\n지구 사전에 넣었어!`, "bubble");
  }

  const card = (
    <WordCardSimple
      word={entry.word}
      hint={entry.kidExplanation}
      image={entry.image}
      onSpeak={() => speak(`${entry.word}. ${entry.kidExplanation}`, "word")}
    />
  );

  return (
    <>
      <KidTop />
      {added ? (
        <main className="flex flex-1 flex-col items-center gap-3.5 px-6 pt-[18px] pb-3.5">
          <div className="flex w-full items-center gap-2">
            <MoyaImage expression="excited" background="cream" size={100} />
            <SpeechBubble
              text={line}
              tail="left"
              onSpeak={() => speak(line, "bubble")}
              playing={playing === "bubble"}
              className="min-w-px flex-1"
            />
          </div>
          {card}
          <Button onClick={() => router.push("/app/dictionary")}>지구 사전 보기</Button>
          <Button variant="dashed" icon="/icons/home.svg" onClick={() => router.push("/app")}>
            모야랑 놀기
          </Button>
        </main>
      ) : (
        <main className="flex flex-1 flex-col items-center gap-2.5 px-6 pt-3 pb-2.5">
          <div className="flex w-full items-center gap-2">
            <MoyaImage expression="greet" background="cream" size={104} />
            <SpeechBubble
              text={line}
              tail="left"
              onSpeak={() => speak(line, "bubble")}
              playing={playing === "bubble"}
              className="min-w-px flex-1"
            />
          </div>
          {card}
          <Button icon="/icons/plus-white.svg" onClick={addToDictionary}>
            지구 사전에 넣기
          </Button>
          <Button variant="dashed" onClick={() => router.push("/app")}>
            내일 또 볼래
          </Button>
        </main>
      )}
      <TabBar selected="play" />
    </>
  );
}
