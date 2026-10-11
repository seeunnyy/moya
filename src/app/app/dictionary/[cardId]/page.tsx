import { DictionaryCardScreen } from "@/components/DictionaryCardScreen";

// /app/dictionary/[cardId] — 3-2 카드 상세 (3-2a~3-2e는 카드 상태·단어만 다름). 없는 id면 3-1로 (T15)
export default async function Page(props: PageProps<"/app/dictionary/[cardId]">) {
  const { cardId } = await props.params;
  return <DictionaryCardScreen cardId={cardId} />;
}
