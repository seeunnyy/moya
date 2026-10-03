import { AskScreen } from "@/components/AskScreen";

// 권한 안내에서 마이크를 거부하고 오면 ?mic=denied → E1부터 보여준다.
export default async function AskPage({ searchParams }: PageProps<"/app/ask">) {
  const { mic } = await searchParams;
  return <AskScreen micDenied={mic === "denied"} />;
}
