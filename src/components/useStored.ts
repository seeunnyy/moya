"use client";

// 기기 저장소(src/lib/storage)의 값을 화면에서 읽는다. 저장하면(같은 탭: moya-storage, 다른 탭: storage 이벤트) 다시 읽는다.
// localStorage는 브라우저에만 있으므로 서버 렌더링에서는 undefined(읽는 중)다. 읽는 중에는 이동·빈 상태를 정하지 않는다.

import { useSyncExternalStore } from "react";
import { STORAGE_EVENT } from "@/lib/storage";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(STORAGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(STORAGE_EVENT, onChange);
  };
}

// useSyncExternalStore는 내용이 같으면 같은 객체를 받아야 다시 그리지 않는다. 읽는 함수마다 마지막 값을 기억한다.
const cache = new Map<() => unknown, { key: string; value: unknown }>();

function snapshotOf<T>(read: () => T): () => T {
  return () => {
    const value = read();
    const key = JSON.stringify(value) ?? "undefined";
    const hit = cache.get(read);
    if (hit && hit.key === key) return hit.value as T;
    cache.set(read, { key, value });
    return value;
  };
}

const snapshots = new Map<() => unknown, () => unknown>();
const onServer = () => undefined;

// read는 모듈 수준의 고정된 함수여야 한다 (예: readAccount).
export function useStored<T>(read: () => T): T | undefined {
  let get = snapshots.get(read) as (() => T) | undefined;
  if (!get) {
    get = snapshotOf(read);
    snapshots.set(read, get);
  }
  return useSyncExternalStore(subscribe, get, onServer);
}
