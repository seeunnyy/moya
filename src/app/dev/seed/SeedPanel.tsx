"use client";

import { useState } from "react";
import { Button } from "@/components/ui/buttons";
import { applySeed, SEED_EMAIL, SEED_PIN, SEED_PRESETS } from "@/lib/devSeed";

export function SeedPanel() {
  const [error, setError] = useState(false);

  function apply(preset: (typeof SEED_PRESETS)[number]) {
    try {
      applySeed(preset.key, window.localStorage);
      // 보호자 잠금(메모리)과 화면 상태까지 새로 시작하도록 페이지를 새로 연다
      window.location.assign(preset.goTo);
    } catch {
      setError(true);
    }
  }

  return (
    <main className="flex flex-col gap-4 px-6 py-8">
      <h1 className="type-moya-title-m text-text-strong">시드 (개발용)</h1>
      <p className="type-caption text-text-normal">
        누르면 이 브라우저의 기록을 지우고 그 상태를 넣은 뒤 화면을 옮겨요. 시드 계정: {SEED_EMAIL} · 보호자 비밀번호{" "}
        {SEED_PIN}
      </p>
      {SEED_PRESETS.map((p) => (
        <div key={p.key} className="flex flex-col gap-1.5">
          <Button variant={p.key === "reset" ? "secondary" : "primary"} onClick={() => apply(p)}>
            {p.label}
          </Button>
          <p className="type-caption text-text-faint">{p.description}</p>
        </div>
      ))}
      {error && (
        <p role="alert" className="type-caption text-coral">
          이 브라우저에서는 저장소를 쓸 수 없어요 (시크릿 창·저장소 차단 확인).
        </p>
      )}
    </main>
  );
}
