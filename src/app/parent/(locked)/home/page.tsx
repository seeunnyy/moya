import { ParentHomeScreen } from "@/components/ParentScreens";

// /parent/home — 5-2 보호자 홈 (180:7784). [아이 모드로 돌아가기]는 2-1로.
// 보호자 주소를 벗어나면 잠금 상태를 가진 /parent 레이아웃이 사라져 다시 잠긴다.
export default function Page() {
  return <ParentHomeScreen />;
}
