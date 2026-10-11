// 안내 상자들: 2-8 물어볼 단어 180:6941, E-2 보호자 안내 180:8450, 온보딩 1-4 안내 180:7319, 1-6 안내 알약 180:7357, 1-8 보호자 메뉴 안내 180:7403,
// 1-3 미리 보기 180:7300, 1-2a 약관 내용 180:7464

import type { ReactNode } from "react";
import { Img } from "./Img";
import { IconCircle } from "./bars";
import { SoundChip } from "./cards";
import { MoyaImage } from "./Moya";

// 1-4: 흰 상자(모서리 22, 베이지 테두리) 안에 아이콘 32 + 본문 줄들 (간격 14)
export function NoticeBox({ rows }: { rows: { icon: string; text: string }[] }) {
  return (
    <ul className="flex w-full flex-col gap-3.5 rounded-[22px] border-2 border-line-beige bg-white p-[18px]">
      {rows.map((r) => (
        <li key={r.text} className="flex w-full items-start gap-3">
          <IconCircle icon={r.icon} size={32} />
          <p className="min-w-px flex-1 type-body text-text-strong">{r.text}</p>
        </li>
      ))}
    </ul>
  );
}

// 1-6: 알약 모양 안내 (아이콘 30 + 굵은 글)
export function InfoPill({ icon, children }: { icon: string; children: ReactNode }) {
  return (
    <p className="flex items-center gap-2.5 rounded-full border-2 border-line-beige bg-white py-2.5 pr-4 pl-2.5">
      <IconCircle icon={icon} size={30} />
      <span className="type-body-bold whitespace-nowrap text-text-strong">{children}</span>
    </p>
  );
}

// 1-8: 흰 상자(모서리 20) 아이콘 44 + 작은 글
export function HelpCard({ icon, children }: { icon: string; children: ReactNode }) {
  return (
    <p className="flex w-full items-center gap-3 rounded-[20px] border-2 border-line-beige bg-white py-3.5 pr-4 pl-3.5">
      <IconCircle icon={icon} size={44} />
      <span className="min-w-px flex-1 type-body-small text-text-strong">{children}</span>
    </p>
  );
}

// 1-3: 아이 모드에서 부르는 말 미리 보기 (아주 연한 보라 바탕, 모야 72)
export function NamePreview({ greeting }: { greeting: string }) {
  return (
    <div className="flex w-full items-center gap-2.5 rounded-[20px] bg-brand-faint py-3 pr-4 pl-2">
      <MoyaImage expression="explain" size={72} />
      <p className="flex min-w-px flex-1 flex-col items-start gap-0.5 whitespace-nowrap">
        <span className="type-caption text-text-normal">아이 모드에서 이렇게 불러요</span>
        <span className="type-moya-title-m text-brand-deep">{greeting}</span>
      </p>
    </div>
  );
}

// 1-2a: 약관 내용 상자 (흰 바탕, 모서리 20, 조항마다 굵은 제목 + 작은 글)
export function TermsDoc({ sections }: { sections: { title: string; body: string }[] }) {
  return (
    <div className="flex w-full flex-col gap-3 rounded-[20px] border-2 border-bubble-line bg-white p-[18px]">
      {sections.map((sec) => (
        <section key={sec.title} className="flex w-full flex-col gap-1">
          <h2 className="type-body-bold text-text-strong">{sec.title}</h2>
          <p className="type-body-small text-text-normal">{sec.body}</p>
        </section>
      ))}
    </div>
  );
}

// 2-8 물어볼 단어 안내 (180:6941): 그림 60 + "물어볼 단어 상자에 넣었어" + 내가 말한 소리 칩
export function PendingWordNotice({ spoken, onSpeak, playing }: { spoken: string; onSpeak?: () => void; playing?: boolean }) {
  return (
    <div className="flex w-full items-center gap-3.5 py-3.5 pr-4 pl-3.5">
      {/* 피그마는 120 그림을 60으로 줄여도 선 굵기(4·3.5)를 그대로 둔다 → 선을 두 배로 한 60용 그림 */}
      <Img src="/words/ask-word-60.svg" size={60} />
      <div className="flex min-w-px flex-1 flex-col items-start gap-1.5">
        <p className="type-moya-label whitespace-nowrap text-text-strong">물어볼 단어 상자에 넣었어</p>
        <SoundChip spoken={spoken} onSpeak={onSpeak} playing={playing} />
      </div>
    </div>
  );
}

// E-2 보호자 안내 (180:8450): 아주 연한 보라, 모서리 20, 굵은 제목 + 단계 글
export function GuideBox({ title, steps }: { title: string; steps: string[] }) {
  return (
    <div className="flex w-full flex-col items-start gap-1.5 rounded-[20px] bg-brand-faint px-[18px] py-3.5 whitespace-nowrap">
      <p className="type-body-bold text-text-strong">{title}</p>
      {steps.map((step) => (
        <p key={step} className="type-body-small text-text-normal">
          {step}
        </p>
      ))}
    </div>
  );
}
