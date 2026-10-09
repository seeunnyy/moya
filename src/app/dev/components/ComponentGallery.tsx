"use client";

// 부품을 피그마 보드와 같은 상태로 늘어놓는다. data-cmp는 비교 스크립트가 캡처할 칸 이름.

import { useState, type ReactNode } from "react";
import { Button, CircleButton, KakaoButton, RoundActionButton, SpeakerButton, BetaBadge } from "@/components/ui/buttons";
import { MicButton } from "@/components/ui/MicButton";
import { KidHeader, MissionTracker, TopChip } from "@/components/ui/KidHeader";
import { TabBar } from "@/components/ui/TabBar";
import { SpeechBubble } from "@/components/ui/SpeechBubble";
import {
  CandidateCard,
  ContextChip,
  LetterTiles,
  SoundChip,
  StarProgress,
  WordCardDetailed,
  WordCardSimple,
  WordTile,
} from "@/components/ui/cards";
import { GiftButton, MoyaImage, MoyaStage } from "@/components/ui/Moya";
import { BottomSheet, ConfirmDialog, Toast } from "@/components/ui/overlays";
import { AgeChips, Checkbox, PinDots, PinKeypad, TermsRow, TextDivider, TextField, Toggle } from "@/components/ui/forms";
import { BottomPanel, IconCircle, SettingsGroup, SettingsRow, StepProgress, TopBar } from "@/components/ui/bars";
import { Img } from "@/components/ui/Img";

function Section({ name, title, children }: { name: string; title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3 border-b border-dashed border-line-lavender py-6">
      <h2 className="px-4 type-caption text-text-faint">{title}</h2>
      <div data-cmp={name} className="flex flex-col items-center gap-4">
        {children}
      </div>
    </section>
  );
}

export function ComponentGallery() {
  const [terms, setTerms] = useState([true, true, true]);
  const [optional, setOptional] = useState(false);
  const [toggle, setToggle] = useState(false);
  const [age, setAge] = useState<number | null>(7);
  const [pin, setPin] = useState("");
  const [sheet, setSheet] = useState(false);
  const [dialog, setDialog] = useState(false);

  return (
    <main className="w-full pb-24">
      <h1 className="px-4 pt-6 type-parent-title text-text-strong">부품 모음 (개발용)</h1>

      <Section name="header" title="아이 헤더 (미션 0/3 ~ 3/3) — 180:6313">
        {[0, 1, 2, 3].map((n) => (
          <KidHeader key={n} missionDone={n} stars={24} />
        ))}
      </Section>

      <Section name="chips" title="상단 칩 (기본·비활성) — 180:5594, 호버·누름은 비교 스크립트가 상태를 강제">
        <div className="flex gap-6">
          <TopChip kind="star" value="24" label="별" />
          <TopChip kind="star" value="24" label="별" disabled />
          <TopChip kind="streak" value="3일" label="연속" />
          <TopChip kind="streak" value="3일" label="연속" disabled />
        </div>
      </Section>

      <Section name="tabbar" title="탭바 (선택: 모야와 놀기·단어 또 보기·내 정보) — 180:6388">
        <TabBar selected="play" />
        <TabBar selected="words" />
        <TabBar selected="me" />
        <TabBar selected="play" disabled={["words", "me"]} />
      </Section>

      <Section name="bubbles" title="말풍선 (꼬리 아래·위·왼쪽·없음) — 180:6685">
        {(["down", "up", "left", "none"] as const).map((t) => (
          <div key={t} className="w-[300px] py-3">
            <SpeechBubble text={"궁금한 말이 생겼어?\n나한테 물어봐!"} tail={t} onSpeak={() => {}} />
          </div>
        ))}
      </Section>

      <Section name="speaker" title="다시 듣기 (기본·재생 중·비활성, 24px) — 180:5725">
        <div className="flex gap-8">
          <SpeakerButton />
          <SpeakerButton playing />
          <SpeakerButton disabled />
          <SpeakerButton size={24} />
        </div>
      </Section>

      <Section name="mic" title="마이크 (기본·듣는 중·비활성) — 180:5892">
        <div className="flex flex-wrap justify-center gap-12 py-6">
          <MicButton label="눌러서 말하기" />
          <MicButton state="listening" label="그만 말하기" />
          <MicButton state="disabled" label="찾는 중" />
        </div>
      </Section>

      <Section name="buttons" title="주 버튼·보조 버튼·점선 버튼·위험 (기본·비활성) — 180:6627">
        <div className="flex w-[320px] flex-col gap-5">
          <Button variant="primary">버튼</Button>
          <Button variant="primary" disabled>
            버튼
          </Button>
          <Button variant="secondary">버튼</Button>
          <Button variant="secondary" disabled>
            버튼
          </Button>
          <Button variant="dashed">버튼</Button>
          <Button variant="dashed" disabled>
            버튼
          </Button>
          <Button variant="danger">지우기</Button>
          <Button variant="primary" icon="/icons/mic-white.svg">
            지금 물어볼래
          </Button>
          <Button variant="dashed" icon="/icons/card-book.svg">
            글자 카드로 고를래
          </Button>
        </div>
      </Section>

      <Section name="round" title="원형 보조 버튼 (오늘의 단어·지구 사전, 기본·비활성) — 180:5651 / 원형 52 + 배지 — 180:6665">
        <div className="flex items-end gap-6">
          <RoundActionButton kind="today" />
          <RoundActionButton kind="today" disabled />
          <RoundActionButton kind="dictionary" />
          <RoundActionButton kind="dictionary" disabled />
        </div>
        <div className="flex items-center gap-6">
          <CircleButton icon="/icons/back.svg" label="이전 화면" />
          <CircleButton icon="/icons/close.svg" label="닫기" />
          <CircleButton icon="/icons/card-book.svg" label="지구 사전" badge="3" />
          <BetaBadge />
          <GiftButton hasNew />
        </div>
      </Section>

      <Section name="candidate" title="후보 카드 (기본·선택됨) — 180:6729">
        <div className="flex w-[354px] flex-col gap-5">
          <CandidateCard word="저금통" hint="돈을 모아 두는 통" image="/words/jeogeumtong.svg" />
          <CandidateCard word="저금통" hint="돈을 모아 두는 통" image="/words/jeogeumtong.svg" selected />
        </div>
      </Section>

      <Section name="context" title="맥락 칩 (기본·선택됨) — 180:6757">
        <div className="flex gap-4">
          <ContextChip label="집" icon="/icons/home.svg" />
          <ContextChip label="집" icon="/icons/home.svg" selected />
        </div>
      </Section>

      <Section name="tiles" title="단어 카드 타일 (새 단어·복습 중·다 앎) — 180:6772">
        <div className="flex gap-3">
          <WordTile word="저금통" image="/words/jeogeumtong.svg" stars={0} isNew className="w-[165px]" />
          <WordTile word="저금통" image="/words/jeogeumtong.svg" stars={1} className="w-[165px]" />
        </div>
        <WordTile word="저금통" image="/words/jeogeumtong.svg" stars={3} mastered className="w-[165px]" />
      </Section>

      <Section name="bigcards" title="큰 단어 카드 (간단·자세히) — 180:6793">
        <div className="w-[354px]">
          <WordCardSimple word="저금통" hint="돈을 모아 두는 통!" image="/words/jeogeumtong.svg" />
        </div>
        <div className="w-[354px]">
          <WordCardDetailed
            word="저금통"
            image="/words/jeogeumtong.svg"
            status="새 카드"
            date="10월 8일"
            spoken="저굼통"
            explanation="돈을 모아 두는 통!"
            example="할머니가 주신 동전을 저금통에 넣었어."
            stars={0}
            reviewText="며칠 뒤 모야가 다시 물어볼게!"
          />
        </div>
      </Section>

      <Section name="smalls" title="별 진행 · 내가 말한 소리 · 글자 타일 · 미션 칸(40)">
        <div className="flex gap-4">
          {[0, 1, 2, 3].map((n) => (
            <StarProgress key={n} count={n} />
          ))}
        </div>
        <SoundChip spoken="저굼통" />
        <LetterTiles word="저금통" />
        <MissionTracker done={1} size={40} />
      </Section>

      <Section name="stage" title="모야 무대 (2-1) · 표정 5종">
        <MoyaStage />
        <div className="flex gap-2 pt-6">
          {(["greet", "explain", "curious", "confused", "excited"] as const).map((e) => (
            <MoyaImage key={e} expression={e} size={64} />
          ))}
        </div>
      </Section>

      <Section name="onboarding" title="온보딩 부품 (1-2·1-5) — 상단 바·카카오·구분선·입력칸·약관 줄·잠금 칸·하단 패널">
        <TopBar left="back" center={<StepProgress step={1} total={5} />} />
        <div className="flex w-full flex-col gap-3.5 px-6">
          <KakaoButton>카카오로 시작하기</KakaoButton>
          <TextDivider>또는 이메일로</TextDivider>
          <TextField id="email" label="이메일" defaultValue="jiwoo.mom@email.com" />
          <TextField id="pw" label="비밀번호" type="password" defaultValue="0123456789" />
          <div className="flex flex-col gap-2.5 pt-1">
            {["이용약관에 동의해요", "개인정보 처리방침에 동의해요", "만 14세 미만 아동의 법정대리인이에요"].map((t, i) => (
              <TermsRow
                key={t}
                tag="필수"
                text={t}
                checked={terms[i]}
                onChange={(v) => setTerms((prev) => prev.map((p, j) => (j === i ? v : p)))}
                onOpen={() => {}}
              />
            ))}
            <TermsRow tag="선택" text="서비스 개선을 위한 음성 활용에 동의해요" checked={optional} onChange={setOptional} onOpen={() => {}} />
          </div>
          <AgeChips value={age} onChange={setAge} />
          <div className="flex items-center gap-4">
            <Checkbox checked label="켜짐" onChange={() => {}} />
            <Checkbox checked={false} label="꺼짐" onChange={() => {}} />
            <Toggle on label="켜짐" onChange={() => {}} />
            <Toggle on={toggle} label="토글" onChange={setToggle} />
          </div>
        </div>
        <div className="flex gap-4">
          <IconCircle />
          <IconCircle size={80} />
          <IconCircle size={80} tone="danger" />
        </div>
        <BottomPanel>
          <Button>다음</Button>
        </BottomPanel>
      </Section>

      <Section name="pin" title="비밀번호 점 0~4 · 숫자 키패드 — 180:6264·180:6290">
        <div className="flex flex-wrap justify-center gap-4">
          {[0, 1, 2, 3, 4].map((n) => (
            <PinDots key={n} count={n} />
          ))}
        </div>
        <PinDots count={pin.length} />
        <div className="w-[354px]">
          <PinKeypad onDigit={(d) => setPin((p) => (p + d).slice(0, 4))} onBackspace={() => setPin((p) => p.slice(0, -1))} />
        </div>
      </Section>

      <Section name="parent" title="보호자 상단 바 · 설정 목록 — 180:8019·180:8030">
        <div className="w-full bg-parent-bg">
          <TopBar left="back" title="설정" />
          <div className="px-5 pb-4">
            <SettingsGroup>
              <SettingsRow label="서비스 개선에 목소리 활용 (선택)" right={{ kind: "toggle", on: toggle, onChange: setToggle }} />
              <SettingsRow label="음성 기록 삭제 요청" />
              <SettingsRow label="음성 수집 동의 철회" danger />
            </SettingsGroup>
          </div>
          <div className="px-5 pb-4">
            <SettingsGroup>
              <SettingsRow label="구독 관리" right={{ kind: "beta" }} />
              <SettingsRow label="알림" right={{ kind: "text", text: "주간 리포트 켬" }} />
            </SettingsGroup>
          </div>
        </div>
      </Section>

      <Section name="overlays" title="바텀 시트 · 확인 창 · 알림 — 180:7049·180:8062·180:7965">
        <div className="flex w-[354px] flex-col gap-3">
          <Button variant="secondary" onClick={() => setSheet(true)}>
            바텀 시트 열기
          </Button>
          <Button variant="secondary" onClick={() => setDialog(true)}>
            확인 창 열기
          </Button>
          <Toast>모야가 ‘저구멍’이 ‘저금통’이라는 걸 배웠어요</Toast>
          <Img src="/icons/rocket.svg" size={20} />
        </div>
      </Section>

      {sheet && (
        <BottomSheet label="오늘의 미션" onClose={() => setSheet(false)}>
          <p className="w-full type-moya-title-l text-text-strong">오늘의 미션</p>
          <MissionTracker done={1} size={40} />
          <Button icon="/icons/mic-white.svg" onClick={() => setSheet(false)}>
            지금 물어볼래
          </Button>
          <Button variant="dashed" onClick={() => setSheet(false)}>
            닫기
          </Button>
        </BottomSheet>
      )}
      {dialog && (
        <ConfirmDialog
          title="음성 기록을 지울까요?"
          body="지우가 지금까지 말한 목소리 기록을 모두 지워요. 단어 카드는 그대로 남아요."
          confirmLabel="지우기"
          onCancel={() => setDialog(false)}
          onConfirm={() => setDialog(false)}
        />
      )}
    </main>
  );
}
