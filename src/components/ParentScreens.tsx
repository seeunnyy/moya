"use client";

// 보호자 화면 5-1~5-9 (완성 피그마 ⑤ 섹션). 모두 이 기기 저장값만 읽고 쓴다: 메일·서버로 아무것도 보내지 않는다.
// 잠금 해제는 /parent 레이아웃의 메모리에만 있다(design.md "가짜 가입·잠금"). 베타 항목(주간 리포트·숫자 카드·무료 체험·구독)은 보이기만 한다.

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { MOCK_WORDS } from "@/data/words.mock";
import { particle, withParticle } from "@/lib/onboarding";
import {
  deleteVoiceRecords,
  findTeachableWord,
  pendingNewestFirst,
  pendingTime,
  teachWord,
  unteachedWords,
  weekSummary,
} from "@/lib/parent";
import { speaker } from "@/lib/services/speech";
import {
  DEFAULT_SETTINGS,
  readAccount,
  readCards,
  readConsent,
  readPending,
  readPin,
  readProfile,
  readSettings,
  readTaught,
  writeAccount,
  writeCards,
  writeConsent,
  writePending,
  writePin,
  writeProfile,
  writeSettings,
  writeTaught,
  type ChildAge,
} from "@/lib/storage";
import { useParentLock } from "./gates";
import { useStored } from "./useStored";
import { BottomPanel, IconCircle, SettingsGroup, SettingsRow, TopBar } from "./ui/bars";
import { Button } from "./ui/buttons";
import { AgeChips, PinDots, PinKeypad, TextField } from "./ui/forms";
import { Img } from "./ui/Img";
import { ConfirmDialog, Toast } from "./ui/overlays";
import {
  CardTitle,
  ParentCard,
  ParentHomeHeader,
  PendingWordItem,
  ProgressBar,
  SummaryStat,
  TextLinkRow,
} from "./ui/parent";

const PIN_STEP_DELAY_MS = 200; // 네 번째 점이 채워진 것을 잠깐 보여 준 뒤 넘어간다 (1-5와 같음)
const TOAST_MS = 3000;

// 보호자 화면 틀: 보호자 배경(5-1만 크림)
function ParentFrame({ children, cream = false }: { children: ReactNode; cream?: boolean }) {
  return <div className={`flex min-h-dvh w-full flex-col ${cream ? "bg-cream" : "bg-parent-bg"}`}>{children}</div>;
}

const Title = ({ children, center = false }: { children: ReactNode; center?: boolean }) => (
  <h1 className={`w-full type-parent-title whitespace-pre-line text-text-strong ${center ? "text-center" : ""}`}>{children}</h1>
);

// 알림(5-3a·5-4a): 피그마 top 760 → 812 화면에서 위 698 = 화면 아래에서 114 위. 두 줄이면 아래로 늘어난다(피그마 5-4a)
function BottomToast({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-x-0 top-[calc(100%-114px)] z-40 mx-auto w-full max-w-[402px] px-5">
      <Toast>{children}</Toast>
    </div>
  );
}

function useToast(): [string | null, (text: string) => void] {
  const [toast, setToast] = useState<string | null>(null);
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), TOAST_MS);
    return () => window.clearTimeout(t);
  }, [toast]);
  return [toast, setToast];
}

// 4자리 입력: 네 자리가 차면 잠깐 뒤 onComplete
function usePinEntry(onComplete: (pin: string) => void) {
  const [digits, setDigits] = useState("");
  const [busy, setBusy] = useState(false);
  function onDigit(d: string) {
    if (busy || digits.length >= 4) return;
    const next = digits + d;
    setDigits(next);
    if (next.length < 4) return;
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      setDigits("");
      onComplete(next);
    }, PIN_STEP_DELAY_MS);
  }
  const onBackspace = () => !busy && setDigits((v) => v.slice(0, -1));
  return { digits, onDigit, onBackspace };
}

// ---- 5-1 · 5-1a 보호자 비밀번호 입력 (180:7768 · 180:7902) ----

export function ParentLockScreen() {
  const router = useRouter();
  const { unlock } = useParentLock();
  const [wrong, setWrong] = useState(false);
  const pin = usePinEntry((entered) => {
    if (entered === readPin()) {
      unlock();
      router.push("/parent/home");
    } else setWrong(true);
  });

  return (
    <ParentFrame cream>
      {/* × → 내 정보(3-4), 들어온 곳과 상관없이 (T7) */}
      <TopBar left="close" onLeft={() => router.push("/app/me")} />
      <main className="flex flex-1 flex-col items-center gap-3.5 px-6 pt-5 pb-3">
        <IconCircle size={80} tone={wrong ? "danger" : "lavender"} />
        <Title center>{"보호자 비밀번호를\n입력해 주세요"}</Title>
        {wrong ? (
          <p role="alert" className="w-full text-center type-body text-coral">
            비밀번호가 맞지 않아요. 다시 입력해 주세요.
          </p>
        ) : (
          <p className="w-full text-center type-body text-text-normal">보호자 메뉴는 비밀번호를 아는 어른만 열 수 있어요.</p>
        )}
        <span className="h-2 w-2.5" aria-hidden="true" />
        <PinDots count={pin.digits.length} />
        <button type="button" onClick={() => router.push("/parent/reset")} className="type-body-bold whitespace-nowrap text-brand-deep">
          비밀번호를 잊으셨나요?
        </button>
      </main>
      <BottomPanel tight>
        <PinKeypad onDigit={pin.onDigit} onBackspace={pin.onBackspace} />
      </BottomPanel>
    </ParentFrame>
  );
}

// ---- 5-1b 비밀번호 재설정 (180:7918). 아무것도 보내지 않고 5-1로 (결정 1) ----

export function ParentResetScreen() {
  const router = useRouter();
  const account = useStored(readAccount);
  const [email, setEmail] = useState<string | null>(null);
  return (
    <ParentFrame>
      <TopBar left="back" title="비밀번호 재설정" onLeft={() => router.push("/parent")} />
      <main className="flex flex-1 flex-col items-start gap-3.5 px-6 py-3">
        <Title>{"보호자 비밀번호를\n잊으셨나요?"}</Title>
        <p className="w-full type-body text-text-normal">
          가입한 이메일로 재설정 링크를 보내 드려요. 링크를 누르면 새 비밀번호 4자리를 정할 수 있어요.
        </p>
        <TextField
          id="reset-email"
          label="가입한 이메일"
          type="email"
          value={email ?? account?.email ?? ""}
          onChange={(e) => setEmail(e.target.value)}
        />
      </main>
      <BottomPanel>
        {/* 메일을 보내지 않는다 (해커톤 mock). 비밀번호 입력으로 돌아간다 */}
        <Button onClick={() => router.push("/parent")}>재설정 링크 보내기</Button>
      </BottomPanel>
    </ParentFrame>
  );
}

// ---- 5-2 보호자 홈 (180:7784) ----

const FREE_TRIAL = { used: 18, total: 20 }; // 무료 체험 질문 (베타): 피그마 값 그대로 보이기만

export function ParentHomeScreen() {
  const router = useRouter();
  const profile = useStored(readProfile);
  const cards = useStored(readCards) ?? [];
  const pending = useStored(readPending) ?? [];
  const name = profile?.nickname ?? "";
  const summary = weekSummary(cards, pending, new Date());
  const unfound = unteachedWords(pending);

  return (
    <ParentFrame>
      <ParentHomeHeader
        title={`${name} 보호자님`}
        caption={profile ? `아이 프로필 · 만 ${profile.age}세` : ""}
        onSettings={() => router.push("/parent/settings")}
      />
      <main className="flex flex-1 flex-col items-center gap-3.5 px-5 pt-1.5 pb-3">
        {/* 이번 주 물어본 말 (베타): 숫자는 저장값, 눌러도 이동 없음 */}
        <ParentCard className="gap-3.5 px-[18px] pt-[18px] pb-4">
          <CardTitle beta>{`이번 주 ${withParticle(name, "이가", "가")} 물어본 말`}</CardTitle>
          <div className="flex w-full items-start gap-2" aria-disabled="true">
            <SummaryStat value={String(summary.asked)} label="물어본 단어" />
            <SummaryStat value={String(summary.mastered)} label="복습 끝냄" />
            <SummaryStat value={String(summary.unfound)} label="못 찾은 말" />
          </div>
          <TextLinkRow label="주간 리포트 보기" />
        </ParentCard>
        {/* 물어볼 단어 → 5-3. 없을 때 문구는 PM 확인(2026-10-11) */}
        <button
          type="button"
          onClick={() => router.push("/parent/words")}
          className="flex w-full items-center gap-3 rounded-[20px] bg-white p-4 text-left shadow-group"
        >
          <Img src="/words/ask-word.svg" size={52} />
          <span className="flex min-w-px flex-1 flex-col items-start gap-0.5">
            <span className="w-full type-body-bold text-text-strong">모야가 못 찾은 말 {unfound.length}개</span>
            <span className="w-full type-body-small text-text-normal">
              {unfound.length > 0
                ? `‘${unfound[0].spokenAs}’ — 녹음을 듣고 함께 알아봐 주세요`
                : "아직 없어요. 못 찾은 말이 생기면 여기에 모여요"}
            </span>
          </span>
          <Img src="/icons/chevron-right.svg" size={18} />
        </button>
        {/* 무료 체험 질문 (베타): 보이기만 */}
        <ParentCard className="gap-2.5 px-[18px] py-4">
          <div className="flex w-full items-center justify-between">
            <CardTitle beta size="bold">
              무료 체험 질문
            </CardTitle>
            <span className="type-body-bold whitespace-nowrap text-brand-deep">
              {FREE_TRIAL.used} / {FREE_TRIAL.total}
            </span>
          </div>
          <ProgressBar value={FREE_TRIAL.used} max={FREE_TRIAL.total} />
          <TextLinkRow label="구독 알아보기" />
        </ParentCard>
      </main>
      <BottomPanel>
        {/* 2-1로. 보호자 주소를 벗어나면 잠금 상태를 가진 /parent 레이아웃이 사라져 다시 잠긴다 */}
        <Button onClick={() => router.push("/app")}>아이 모드로 돌아가기</Button>
      </BottomPanel>
    </ParentFrame>
  );
}

// ---- 5-3 · 5-3a 물어볼 단어 (180:7829 · 180:7934) ----

const NOT_TEACHABLE = "모야가 아직 모르는 단어예요. 모야 단어장에 있는 단어만 알려 줄 수 있어요."; // PM 확인 2026-10-11 (T12)

export function ParentWordsScreen() {
  const router = useRouter();
  const pending = useStored(readPending) ?? [];
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [playing, setPlaying] = useState<string | null>(null);
  const [toast, showToast] = useToast();

  function teach(id: string, spoken: string) {
    const entry = findTeachableWord(inputs[id] ?? "", MOCK_WORDS);
    if (!entry) {
      setErrors((e) => ({ ...e, [id]: true }));
      return;
    }
    const result = teachWord(readPending(), readTaught(), id, entry);
    if (!result) return;
    writePending(result.pending);
    writeTaught(result.taught);
    // 피그마 5-3a: "모야가 ‘저구멍’이 ‘저금통’이라는 걸 배웠어요"
    showToast(`모야가 ‘${spoken}’${particle(spoken, "이", "가")} ‘${entry.word}’${particle(entry.word, "이라는", "라는")} 걸 배웠어요`);
  }

  function speak(id: string, text: string) {
    if (speaker.speak(text, () => setPlaying(null))) setPlaying(id);
  }

  const list = pendingNewestFirst(pending);
  return (
    <ParentFrame>
      <TopBar left="back" title="물어볼 단어" onLeft={() => router.push("/parent/home")} />
      <main className="flex flex-1 flex-col items-center gap-3.5 px-5 pt-1 pb-[42px]">
        <p className="w-full type-body text-text-normal">
          모야가 아직 모르는 말이에요. 녹음을 듣고 아이와 함께 알아본 뒤 알려 주시면, 다음에는 모야가 알아들어요.
        </p>
        {list.length === 0 && <p className="w-full type-caption text-text-faint">아직 모야가 못 찾은 말이 없어요.</p>}
        {list.map((p) => (
          <PendingWordItem
            key={p.id}
            inputId={`teach-${p.id}`}
            spoken={p.spokenAs}
            time={pendingTime(p.createdAt)}
            onSpeak={() => speak(p.id, p.spokenAs)}
            playing={playing === p.id}
            taughtWord={p.taughtWordId ? MOCK_WORDS.find((e) => e.id === p.taughtWordId)?.word ?? "" : undefined}
            value={inputs[p.id] ?? ""}
            onChange={(v) => {
              setInputs((s) => ({ ...s, [p.id]: v }));
              setErrors((e) => ({ ...e, [p.id]: false }));
            }}
            onTeach={() => teach(p.id, p.spokenAs)}
            error={errors[p.id] ? NOT_TEACHABLE : undefined}
          />
        ))}
      </main>
      {toast && <BottomToast>{toast}</BottomToast>}
    </ParentFrame>
  );
}

// ---- 5-4 설정 (180:7858) · 5-4a 삭제 알림 (180:7969) · 5-7·5-8·5-9 확인 창 (180:8017·8068·8119) ----

type Dialog = "delete" | "withdraw" | "logout" | null;

export function ParentSettingsScreen() {
  const router = useRouter();
  const profile = useStored(readProfile);
  const consent = useStored(readConsent);
  const settings = useStored(readSettings) ?? DEFAULT_SETTINGS;
  const [dialog, setDialog] = useState<Dialog>(null);
  const [toast, showToast] = useToast();
  const name = profile?.nickname ?? "";

  function deleteRecords() {
    const result = deleteVoiceRecords(readCards());
    writeCards(result.cards);
    writePending(result.pending);
    setDialog(null);
    showToast("음성 기록을 지웠어요. 단어 카드는 그대로 남아요."); // PM 확인 2026-10-11 (T6: 실제로 바로 지우므로 사실대로)
  }

  function withdraw() {
    writeConsent({ required: false, optional: false, updatedAt: new Date().toISOString() });
    setDialog(null);
    router.push("/parent/settings/consent"); // 1-4 (다시 동의하면 5-4로, 잠금은 그대로 — T8)
  }

  function logout() {
    const account = readAccount();
    if (account) writeAccount({ ...account, loggedIn: false }); // 기록은 남긴다
    setDialog(null);
    router.push("/");
  }

  return (
    <ParentFrame>
      <TopBar left="back" title="설정" onLeft={() => router.push("/parent/home")} />
      <main className="flex flex-1 flex-col items-start gap-2.5 px-5 pt-1 pb-[42px]">
        <p className="type-caption text-text-normal">아이 프로필</p>
        <SettingsGroup>
          <SettingsRow
            label={profile ? `${name} · 만 ${profile.age}세` : ""}
            onClick={() => router.push("/parent/settings/profile")}
          />
        </SettingsGroup>
        <p className="type-caption text-text-normal">목소리 · 개인정보</p>
        <SettingsGroup>
          <SettingsRow
            label="서비스 개선에 목소리 활용 (선택)"
            right={{
              kind: "toggle",
              on: consent?.optional ?? false,
              onChange: (on) =>
                writeConsent({ required: consent?.required ?? true, optional: on, updatedAt: new Date().toISOString() }),
            }}
          />
          <SettingsRow label="음성 기록 삭제 요청" onClick={() => setDialog("delete")} />
          {consent && !consent.required ? (
            // 철회한 뒤에는 같은 자리에서 다시 동의(1-4)로 (피그마 없음 — 동의 없음 안내의 "설정에서 다시 동의" 길)
            <SettingsRow label="음성 수집 동의하기" onClick={() => router.push("/parent/settings/consent")} />
          ) : (
            <SettingsRow label="음성 수집 동의 철회" danger onClick={() => setDialog("withdraw")} />
          )}
        </SettingsGroup>
        {/* 개인정보 안내 (피그마 없음, PM 확인 2026-10-12) */}
        <p className="w-full px-1 type-caption text-text-faint">
          질문 음성은 글자로 바꾸기 위해 OpenAI로 보내고, 모야는 음성을 저장하지 않아요. 글자로 바꾼 질문만 이 기기에 남아요.
        </p>
        <p className="type-caption text-text-normal">계정</p>
        <SettingsGroup>
          <SettingsRow label="보호자 비밀번호 변경" onClick={() => router.push("/parent/settings/pin")} />
          {/* 구독 관리 (베타): 보이기만 */}
          <SettingsRow label="구독 관리" right={{ kind: "beta" }} />
          <SettingsRow
            label="주간 리포트 알림"
            right={{ kind: "toggle", on: settings.weeklyReport, onChange: (on) => writeSettings({ ...settings, weeklyReport: on }) }}
          />
          <SettingsRow label="로그아웃" onClick={() => setDialog("logout")} />
        </SettingsGroup>
      </main>
      {toast && <BottomToast>{toast}</BottomToast>}
      {dialog === "delete" && (
        <ConfirmDialog
          title="음성 기록을 지울까요?"
          body={`${withParticle(name, "이가", "가")} 지금까지 말한 목소리 기록을 모두 지워요. 단어 카드는 그대로 남아요.`}
          confirmLabel="지우기"
          onCancel={() => setDialog(null)}
          onConfirm={deleteRecords}
        />
      )}
      {dialog === "withdraw" && (
        <ConfirmDialog
          title="음성 수집 동의를 철회할까요?"
          body={`철회하면 ${withParticle(name, "이가", "가")} 모야에게 말로 물어볼 수 없어요. 다시 동의하면 이어서 쓸 수 있어요.`}
          confirmLabel="철회하기"
          onCancel={() => setDialog(null)}
          onConfirm={withdraw}
        />
      )}
      {dialog === "logout" && (
        <ConfirmDialog
          title="로그아웃할까요?"
          body={`다시 로그인하면 ${name}의 기록을 그대로 볼 수 있어요.`}
          confirmLabel="로그아웃"
          tone="primary"
          onCancel={() => setDialog(null)}
          onConfirm={logout}
        />
      )}
    </ParentFrame>
  );
}

// ---- 5-5 아이 프로필 수정 (180:8170) ----

const NICKNAME_ERROR = "아이 별명을 입력해 주세요"; // 1-3과 같은 문구 (T13)

export function ParentProfileScreen() {
  const router = useRouter();
  const saved = useStored(readProfile);
  const [nickname, setNickname] = useState<string | null>(null);
  const [age, setAge] = useState<ChildAge | null>(null);
  const [error, setError] = useState(false);
  const name = nickname ?? saved?.nickname ?? "";
  const pickedAge = age ?? saved?.age ?? null;

  function save() {
    if (!name.trim()) {
      setError(true);
      return;
    }
    if (saved && pickedAge) writeProfile({ ...saved, nickname: name.trim(), age: pickedAge });
    router.push("/parent/settings");
  }

  return (
    <ParentFrame>
      <TopBar left="back" title="아이 프로필" onLeft={() => router.push("/parent/settings")} />
      <main className="flex flex-1 flex-col items-start gap-4 px-6 py-3">
        <div className="flex w-full flex-col items-center gap-1.5">
          <Img src="/icons/avatar.svg" size={88} />
          <p className="type-caption whitespace-nowrap text-text-normal">사진 대신 캐릭터 얼굴을 써요</p>
        </div>
        <TextField
          id="parent-nickname"
          label="아이 별명"
          maxLength={10}
          value={name}
          onChange={(e) => {
            setNickname(e.target.value);
            setError(false);
          }}
          error={error ? NICKNAME_ERROR : undefined}
        />
        <div className="flex w-full flex-col items-start gap-2">
          <p className="type-caption text-text-normal">나이 (만)</p>
          <AgeChips value={pickedAge} onChange={(a) => setAge(a as ChildAge)} />
        </div>
      </main>
      <BottomPanel>
        <Button onClick={save}>저장하기</Button>
      </BottomPanel>
    </ParentFrame>
  );
}

// ---- 5-6 보호자 비밀번호 변경 (180:8200) ----

export function ParentPinScreen() {
  const router = useRouter();
  const [same, setSame] = useState(false);
  const pin = usePinEntry((entered) => {
    if (entered === readPin()) {
      setSame(true); // 지금 비밀번호와 같으면 안내 글을 코랄로 (피그마 문구 그대로)
      return;
    }
    writePin(entered);
    router.push("/parent/settings");
  });

  return (
    <ParentFrame>
      <TopBar left="back" title="비밀번호 변경" onLeft={() => router.push("/parent/settings")} />
      <main className="flex flex-1 flex-col items-center justify-center gap-3.5 px-6 py-3">
        <IconCircle size={72} />
        <Title center>{"새 비밀번호 4자리를\n입력해 주세요"}</Title>
        {same ? (
          <p role="alert" className="w-full text-center type-body text-coral">
            지금 쓰는 비밀번호와 다르게 정해 주세요.
          </p>
        ) : (
          <p className="w-full text-center type-body text-text-normal">지금 쓰는 비밀번호와 다르게 정해 주세요.</p>
        )}
        <PinDots count={pin.digits.length} label="새 보호자 비밀번호" />
      </main>
      <BottomPanel tight>
        <PinKeypad onDigit={pin.onDigit} onBackspace={pin.onBackspace} />
      </BottomPanel>
    </ParentFrame>
  );
}
