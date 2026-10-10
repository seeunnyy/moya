"use client";

// 주소별 들어가기 조건 (design.md "화면 ↔ 주소").
// - 계정: 이 기기에 로그인된 보호자 계정이 없으면 아이·보호자 주소에서 시작(1-1, "/")으로 보낸다.
// - 보호자 잠금: 잠금 해제는 메모리(React 상태)에만 둔다. 새로고침하거나 [아이 모드로 돌아가기]면 다시 잠긴다.
//   잠금을 풀지 않고 보호자 주소로 들어오면 비밀번호 입력(5-1, "/parent")으로 보낸다.

import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { readAccount } from "@/lib/storage";
import { useStored } from "./useStored";

// 로그인됨 / 아님 / 아직 읽는 중(undefined)
export function useSignedIn(): boolean | undefined {
  const account = useStored(readAccount);
  return account === undefined ? undefined : account?.loggedIn === true;
}

// 조건이 맞지 않으면 to로 보내고, 맞을 때만 children을 그린다. 읽는 중에는 아무것도 그리지 않는다.
function Redirect({ when, to, children }: { when: boolean | undefined; to: string; children: ReactNode }) {
  const router = useRouter();
  useEffect(() => {
    if (when === true) router.replace(to);
  }, [when, to, router]);
  return when === false ? <>{children}</> : null;
}

export function RequireAccount({ children }: { children: ReactNode }) {
  const signedIn = useSignedIn();
  return (
    <Redirect when={signedIn === undefined ? undefined : !signedIn} to="/">
      {children}
    </Redirect>
  );
}

// "/": 로그인돼 있으면 홈(2-1)으로, 아니면 시작(1-1)을 그린다.
export function RedirectIfSignedIn({ children }: { children: ReactNode }) {
  return (
    <Redirect when={useSignedIn()} to="/app">
      {children}
    </Redirect>
  );
}

// 잠그기는 따로 없다: 새로고침하거나 보호자 주소를 벗어나면 이 상태가 사라져 다시 잠긴다.
type ParentLock = { unlocked: boolean; unlock: () => void };

const ParentLockContext = createContext<ParentLock>({ unlocked: false, unlock: () => {} });

export function ParentLockProvider({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const value = useMemo(() => ({ unlocked, unlock: () => setUnlocked(true) }), [unlocked]);
  return <ParentLockContext.Provider value={value}>{children}</ParentLockContext.Provider>;
}

export const useParentLock = () => useContext(ParentLockContext);

export function RequireParentUnlock({ children }: { children: ReactNode }) {
  const { unlocked } = useParentLock();
  return (
    <Redirect when={!unlocked} to="/parent">
      {children}
    </Redirect>
  );
}
