import { BackHeader } from "@/components/BackHeader";

// /parent 보호자 (S8). 부모 리포트는 베타. 지금은 홈으로 돌아가는 길만 둔다.
export default function ParentPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-5 px-4 py-6">
      <BackHeader href="/app" backLabel="홈">
        부모 리포트
      </BackHeader>
    </main>
  );
}
