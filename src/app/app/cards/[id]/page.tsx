import { CardDetailScreen } from "@/components/CardDetailScreen";

// 카드는 이 기기(localStorage)에만 있어서, 서버는 id만 꺼내 넘기고 화면은 브라우저에서 읽는다.
export default async function CardDetailPage({ params }: PageProps<"/app/cards/[id]">) {
  const { id } = await params;
  return <CardDetailScreen id={id} />;
}
