"use client";

// 온보딩 화면 1-0~1-8 (완성 피그마 ① 섹션 180:7215). 가입·로그인은 이 기기(localStorage)에만 저장하는 가짜다:
// 서버·카카오·메일로 아무것도 보내지 않고, 계정 비밀번호는 저장하지 않는다 (design.md "가짜 가입·잠금").
// 1-7은 그리지 않는다. 1-6 [마이크 켜기]가 브라우저의 진짜 권한 창을 띄우고, 그동안 뒤를 피그마 1-7처럼 어둡게 한다.
// 피그마에 없는 입력 오류 문구는 PM 확인(2026-10-11): 버튼은 누를 수 있고, 누르면 문제 칸 아래 코랄 캡션.

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { checkLogin, validateSignup, vocative, type SignupErrors } from "@/lib/onboarding";
import { speaker } from "@/lib/services/speech";
import {
  readAccount,
  readConsent,
  readProfile,
  writeAccount,
  writeConsent,
  writePin,
  writeProfile,
  type ChildAge,
} from "@/lib/storage";
import { closeMic, micSupported, openMic } from "./microphone";
import { MIC_OFF_LINE, MicOffBody } from "./MicOffBody";
import { useStored } from "./useStored";
import { MoyaImage, Sparkle } from "./ui/Moya";
import { SpeechBubble } from "./ui/SpeechBubble";
import { BottomPanel, IconCircle, StepProgress, TopBar } from "./ui/bars";
import { Button, KakaoButton } from "./ui/buttons";
import { AgeChips, FieldError, PinDots, PinKeypad, TermsRow, TextDivider, TextField } from "./ui/forms";
import { HelpCard, InfoPill, NamePreview, NoticeBox, TermsDoc } from "./ui/notices";

const STEPS = 5;

// 이전 화면. 주소로 바로 들어와 돌아갈 곳이 없으면 fallback으로
function useBack(fallback: string) {
  const router = useRouter();
  return () => (window.history.length > 1 ? router.back() : router.push(fallback));
}

// 온보딩 틀: 상단 바(뒤로 + 진행 표시나 제목) · 본문 · 하단 패널
function Frame({
  step,
  title,
  onBack,
  bodyClass = "items-start gap-3.5 pt-2",
  children,
  panel,
  tightPanel = false,
}: {
  step?: number;
  title?: string;
  onBack?: () => void;
  bodyClass?: string;
  children: ReactNode;
  panel: ReactNode;
  tightPanel?: boolean;
}) {
  return (
    <>
      <TopBar
        left={onBack ? "back" : undefined}
        onLeft={onBack}
        center={step ? <StepProgress step={step} total={STEPS} /> : undefined}
        title={title}
      />
      <main className={`flex flex-1 flex-col px-6 pb-3 ${bodyClass}`}>{children}</main>
      <BottomPanel tight={tightPanel}>{panel}</BottomPanel>
    </>
  );
}

const Title = ({ children, center = false }: { children: ReactNode; center?: boolean }) => (
  <h1 className={`w-full type-parent-title whitespace-pre-line text-text-strong ${center ? "text-center" : ""}`}>{children}</h1>
);
const Lead = ({ children, center = false }: { children: ReactNode; center?: boolean }) => (
  <p className={`w-full type-body whitespace-pre-line text-text-normal ${center ? "text-center" : ""}`}>{children}</p>
);

// ---- 1-1 시작 (180:7216) ----

export function StartScreen() {
  const router = useRouter();
  return (
    <div className="relative flex flex-1 flex-col">
      <main className="flex flex-1 flex-col items-center justify-center gap-2.5 px-6 pt-10 pb-3">
        <MoyaImage expression="greet" background="cream" size={270} priority />
        <h1 className="font-jua text-[46px] leading-[1.15] whitespace-nowrap text-text-strong">모야, 모야?</h1>
        <p className="type-moya-title-m whitespace-nowrap text-brand-deep">모르는 말, 모야한테 물어봐!</p>
        <p className="w-[300px] max-w-full text-center type-body-small whitespace-pre-line text-text-normal">
          {"서툰 발음도 괜찮아요. 만 5~8세 아이를 위한\n말로 묻는 단어 친구예요."}
        </p>
      </main>
      <BottomPanel>
        <Button onClick={() => router.push("/signup")}>시작하기</Button>
        <Button variant="dashed" onClick={() => router.push("/login")}>
          이미 계정이 있어요
        </Button>
      </BottomPanel>
      {/* 반짝이: 피그마 프레임 절대 좌표 (y − 62) */}
      <Sparkle size={22} className="top-[88px] left-[52px]" />
      <Sparkle size={16} color="purple" className="top-[58px] left-[330px]" />
      <Sparkle size={12} color="pink" className="top-[268px] left-[348px]" />
    </div>
  );
}

// ---- 1-0 로그인 (180:7434) ----

const LOGIN_ERRORS = {
  email: "이 기기에 가입한 계정이 아니에요. 이메일을 확인해 주세요.",
  kakao: "이 기기에서 카카오로 가입한 기록이 없어요.",
} as const;

export function LoginScreen() {
  const router = useRouter();
  const back = useBack("/");
  const profile = useStored(readProfile);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<keyof typeof LOGIN_ERRORS | null>(null);

  function login(input: { method: "email"; email: string } | { method: "kakao" }) {
    const account = readAccount();
    if (!account || checkLogin(account, input) !== "ok") {
      setError(input.method);
      return;
    }
    writeAccount({ ...account, loggedIn: true });
    router.replace("/app");
  }

  return (
    <Frame
      onBack={back}
      panel={
        <Button disabled={email.trim() === ""} onClick={() => login({ method: "email", email })}>
          로그인
        </Button>
      }
    >
      <Title>다시 만나서 반가워요</Title>
      {/* 피그마 "지우의 기록" — 이 기기에 아이 프로필이 없으면 "아이" */}
      <Lead>보호자 계정으로 로그인하면 {profile?.nickname || "아이"}의 기록을 이어서 볼 수 있어요.</Lead>
      <div className="flex w-full flex-col gap-1.5">
        <KakaoButton onClick={() => login({ method: "kakao" })}>카카오로 로그인</KakaoButton>
        {error === "kakao" && <FieldError>{LOGIN_ERRORS.kakao}</FieldError>}
      </div>
      <TextField
        id="login-email"
        label="이메일"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setError(null);
        }}
        error={error === "email" ? LOGIN_ERRORS.email : undefined}
      />
      {/* 계정 비밀번호는 저장하지 않아 비교하지 않는다 (가짜 로그인) */}
      <TextField
        id="login-password"
        label="비밀번호"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
    </Frame>
  );
}

// ---- 1-2 보호자 가입 (180:7233) ----

const TERMS = ["이용약관에 동의해요", "개인정보 처리방침에 동의해요", "만 14세 미만 아동의 법정대리인이에요"] as const;

// 1-2a로 갔다 와도 입력이 남게 메모리에만 둔다 (새로고침하면 사라짐, 비밀번호는 저장소에 쓰지 않음)
const signupDraft = { email: "", password: "", terms: [false, false, false] };

export function SignupScreen() {
  const router = useRouter();
  const back = useBack("/");
  const [email, setEmail] = useState(signupDraft.email);
  const [password, setPassword] = useState(signupDraft.password);
  const [terms, setTerms] = useState<boolean[]>(signupDraft.terms);
  const [errors, setErrors] = useState<SignupErrors>({});

  function update(next: Partial<typeof signupDraft>) {
    Object.assign(signupDraft, next);
    if (next.email !== undefined) setEmail(next.email);
    if (next.password !== undefined) setPassword(next.password);
    if (next.terms) setTerms(next.terms);
    setErrors((e) => ({
      ...e,
      ...(next.email !== undefined ? { email: undefined } : {}),
      ...(next.password !== undefined ? { password: undefined } : {}),
      ...(next.terms ? { terms: undefined } : {}),
    }));
  }

  function submit(method: "email" | "kakao") {
    const found = validateSignup({ email, password, termsAll: terms.every(Boolean) }, method);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    writeAccount({
      method,
      ...(method === "email" ? { email: email.trim() } : {}),
      loggedIn: false, // 1-8 [아이 모드 시작하기]에서 로그인됨으로
      createdAt: new Date().toISOString(),
    });
    Object.assign(signupDraft, { email: "", password: "", terms: [false, false, false] });
    router.push("/signup/profile");
  }

  return (
    <Frame step={1} onBack={back} panel={<Button onClick={() => submit("email")}>다음</Button>}>
      <Title>보호자 계정을 만들어 주세요</Title>
      <Lead>아이 프로필과 학습 기록은 보호자 계정에 안전하게 저장돼요.</Lead>
      <KakaoButton onClick={() => submit("kakao")}>카카오로 시작하기</KakaoButton>
      <TextDivider>또는 이메일로</TextDivider>
      <TextField
        id="signup-email"
        label="이메일"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => update({ email: e.target.value })}
        error={errors.email}
      />
      <TextField
        id="signup-password"
        label="비밀번호"
        type="password"
        autoComplete="new-password"
        value={password}
        onChange={(e) => update({ password: e.target.value })}
        error={errors.password}
      />
      <div className="flex w-full flex-col gap-2.5 pt-1">
        {TERMS.map((text, i) => (
          <TermsRow
            key={text}
            tag="필수"
            text={text}
            checked={terms[i]}
            onChange={(on) => update({ terms: terms.map((t, j) => (j === i ? on : t)) })}
            onOpen={() => router.push("/terms")}
          />
        ))}
        {errors.terms && <FieldError>{errors.terms}</FieldError>}
      </div>
    </Frame>
  );
}

// ---- 1-2a 약관 보기 (180:7457) ----

const TERMS_DOC = [
  { title: "제1조 (목적)", body: "이 약관은 ‘모야, 모야?’ 서비스 이용에 필요한 보호자와 회사의 권리와 의무를 정해요." },
  { title: "제2조 (아이의 목소리)", body: "아이의 목소리는 보호자가 동의한 경우에만 수집하며, 질문을 알아듣는 데 써요." },
  { title: "제3조 (기록 삭제)", body: "보호자는 언제든 설정에서 음성 기록 삭제와 동의 철회를 요청할 수 있어요." },
  { title: "※ 예시 문구", body: "실제 약관은 서비스 출시 전에 법률 검토를 거쳐 확정해요." },
];

export function TermsScreen() {
  const back = useBack("/signup");
  return (
    <Frame title="약관 보기" onBack={back} bodyClass="items-start pt-2" panel={<Button onClick={back}>확인했어요</Button>}>
      <TermsDoc sections={TERMS_DOC} />
    </Frame>
  );
}

// ---- 1-3 아이 프로필 (180:7277) ----

const PROFILE_ERRORS = { nickname: "아이 별명을 입력해 주세요", age: "나이를 골라 주세요" } as const;

export function ProfileScreen() {
  const router = useRouter();
  const back = useBack("/signup");
  const saved = useStored(readProfile);
  const [nickname, setNickname] = useState<string | null>(null);
  const [age, setAge] = useState<ChildAge | null | undefined>(undefined);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof PROFILE_ERRORS, boolean>>>({});
  // 처음엔 저장된 프로필(뒤로 왔을 때)을 보여 주고, 고치면 그 값
  const name = nickname ?? saved?.nickname ?? "";
  const pickedAge = age === undefined ? (saved?.age ?? null) : age;

  function next() {
    const found = { nickname: name.trim() === "", age: pickedAge === null };
    setErrors(found);
    if (found.nickname || found.age || pickedAge === null) return;
    writeProfile({ nickname: name.trim(), age: pickedAge, createdAt: saved?.createdAt || new Date().toISOString() });
    router.push("/signup/consent");
  }

  return (
    <Frame step={2} onBack={back} bodyClass="items-start gap-4 pt-2" panel={<Button onClick={next}>다음</Button>}>
      <Title>아이 프로필을 만들어요</Title>
      <Lead>실명 대신 별명을 써 주세요. 나이에 맞는 쉬운 말로 설명해 드려요.</Lead>
      <TextField
        id="profile-nickname"
        label="아이 별명"
        maxLength={10}
        value={name}
        onChange={(e) => {
          setNickname(e.target.value);
          setErrors((er) => ({ ...er, nickname: false }));
        }}
        error={errors.nickname ? PROFILE_ERRORS.nickname : undefined}
      />
      <div className="flex w-full flex-col items-start gap-2">
        <p className="type-caption text-text-normal">나이 (만)</p>
        <AgeChips
          value={pickedAge}
          onChange={(a) => {
            setAge(a as ChildAge);
            setErrors((er) => ({ ...er, age: false }));
          }}
        />
        {errors.age && <FieldError>{PROFILE_ERRORS.age}</FieldError>}
      </div>
      {/* 별명이 비어 있으면 "안녕!"만 */}
      <NamePreview greeting={name.trim() ? `“${vocative(name)}, 안녕!”` : "“안녕!”"} />
    </Frame>
  );
}

// ---- 1-4 음성 수집 동의 (180:7308) ----

const CONSENT_ERROR = "필수 항목에 동의해 주세요";

export function ConsentScreen({ fromSettings = false }: { fromSettings?: boolean }) {
  const router = useRouter();
  const back = useBack(fromSettings ? "/parent/settings" : "/signup/profile");
  const saved = useStored(readConsent);
  const [required, setRequired] = useState<boolean | null>(null);
  const [optional, setOptional] = useState<boolean | null>(null);
  const [error, setError] = useState(false);
  const req = required ?? (fromSettings ? false : (saved?.required ?? false));
  const opt = optional ?? saved?.optional ?? false;

  function next() {
    if (!req) {
      setError(true);
      return;
    }
    writeConsent({ required: true, optional: opt, updatedAt: new Date().toISOString() });
    // 철회 후 다시 동의(5-8 → 1-4)면 설정으로 (잠정 T8, 그룹 10)
    router.push(fromSettings ? "/parent/settings" : "/signup/pin");
  }

  return (
    <Frame step={3} onBack={back} bodyClass="items-start gap-4 pt-2" panel={<Button onClick={next}>동의하고 다음</Button>}>
      <Title>{"아이 목소리 사용에\n동의해 주세요"}</Title>
      <NoticeBox
        rows={[
          { icon: "/icons/mic.svg", text: "아이 질문을 알아듣는 데에만 써요." },
          { icon: "/icons/report.svg", text: "선택 동의를 하면 아이 발음 인식을 더 좋게 만드는 데 써요." },
          { icon: "/icons/settings.svg", text: "언제든 설정에서 기록을 지우거나 동의를 철회할 수 있어요." },
        ]}
      />
      <div className="flex w-full flex-col gap-3">
        <TermsRow
          tag="필수"
          text="음성 수집·이용에 동의해요"
          checked={req}
          onChange={(on) => {
            setRequired(on);
            setError(false);
          }}
          onOpen={() => router.push("/terms")}
        />
        <TermsRow
          tag="선택"
          text="서비스 개선을 위한 음성 활용에 동의해요"
          checked={opt}
          onChange={setOptional}
          onOpen={() => router.push("/terms")}
        />
        {error && <FieldError>{CONSENT_ERROR}</FieldError>}
      </div>
      <p className="w-full type-body-small text-text-faint">
        선택 동의를 하지 않아도 모든 기능을 쓸 수 있어요. 이때 목소리는 알아들은 뒤 저장하지 않아요.
      </p>
    </Frame>
  );
}

// ---- 1-5 · 1-5a 보호자 비밀번호 (180:7414 · 180:7480) ----

const PIN_TEXT = {
  create: {
    title: "아이 모드를 잠글\n비밀번호 4자리를 정해 주세요",
    hint: "한 번 더 입력하면 완료돼요",
  },
  confirm: {
    title: "확인을 위해\n한 번 더 입력해 주세요",
    hint: "처음 입력한 비밀번호와 같으면 완료돼요",
  },
} as const;
const PIN_MISMATCH = "처음 비밀번호와 달라요. 다시 입력해 주세요.";
const PIN_STEP_DELAY_MS = 200; // 네 번째 점이 채워진 것을 잠깐 보여 준 뒤 넘어간다

export function PinScreen() {
  const router = useRouter();
  const back = useBack("/signup/consent");
  const [step, setStep] = useState<"create" | "confirm">("create");
  const [first, setFirst] = useState("");
  const [digits, setDigits] = useState("");
  const [mismatch, setMismatch] = useState(false);
  const [busy, setBusy] = useState(false);

  function onDigit(d: string) {
    if (busy || digits.length >= 4) return;
    const next = digits + d;
    setDigits(next);
    setMismatch(false);
    if (next.length < 4) return;
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      setDigits("");
      if (step === "create") {
        setFirst(next);
        setStep("confirm");
      } else if (next === first) {
        writePin(next);
        router.push("/signup/mic");
      } else {
        setMismatch(true); // 1-5a에서 다시 (처음 번호는 유지) — PM 확인 2026-10-11
      }
    }, PIN_STEP_DELAY_MS);
  }

  function onBack() {
    if (step === "confirm") {
      setStep("create");
      setFirst("");
      setDigits("");
      setMismatch(false);
    } else back();
  }

  const t = PIN_TEXT[step];
  return (
    <Frame
      step={4}
      onBack={onBack}
      bodyClass="items-center gap-3.5 pt-6"
      tightPanel
      panel={<PinKeypad onDigit={onDigit} onBackspace={() => !busy && setDigits((v) => v.slice(0, -1))} />}
    >
      <IconCircle size={72} />
      <Title center>{t.title}</Title>
      <Lead center>{"보호자 메뉴를 열 때 이 비밀번호를 입력해요.\n아이가 모르게 정해 주세요."}</Lead>
      <span className="size-2.5" aria-hidden="true" />
      <PinDots count={digits.length} />
      {mismatch ? (
        <FieldError>{PIN_MISMATCH}</FieldError>
      ) : (
        <p className="type-caption whitespace-nowrap text-text-faint">{t.hint}</p>
      )}
    </Frame>
  );
}

// ---- 1-6 마이크 권한 안내 (180:7345) · 1-7 브라우저 권한 창 (180:7365) ----

const MIC_LINE = "모야가 네 목소리를 들으려면\n마이크가 필요해!";

export function MicIntroScreen() {
  const router = useRouter();
  const back = useBack("/signup/pin");
  const [asking, setAsking] = useState(false); // 권한 창이 떠 있는 동안 뒤를 어둡게 (1-7)
  const [denied, setDenied] = useState(false);
  const [playing, setPlaying] = useState(false);

  async function turnOn() {
    if (asking) return; // 권한 창이 떠 있는 동안 두 번 누름 방지 (버튼 모양은 피그마 1-7처럼 그대로)
    speaker.stop();
    setPlaying(false);
    if (!micSupported()) {
      setDenied(true);
      return;
    }
    setAsking(true);
    const stream = await openMic(); // 처음이면 브라우저 권한 창
    setAsking(false);
    if (stream) {
      closeMic(stream); // 권한만 받고 바로 닫는다 (녹음하지 않음)
      router.push("/signup/done");
    } else setDenied(true);
  }

  if (denied) {
    // E-2 마이크가 꺼져 있어요 (180:8444). 가입이 끝나기 전이라 헤더·탭·[보호자에게 도움 요청]·글자 입력 없이
    // [다시 해 볼래](허용되면 1-8, T9)와 1-6의 [나중에 할게요]만 둔다 (PM 확인 2026-10-11)
    return (
      <>
        <MicOffBody
          onSpeak={() => {
            if (speaker.speak(MIC_OFF_LINE, () => setPlaying(false))) setPlaying(true);
          }}
          playing={playing}
          onRetry={() => void turnOn()}
          secondary={{ label: "나중에 할게요", onClick: () => router.push("/signup/done") }}
        />
        {asking && <div className="fixed inset-0 z-50 mx-auto max-w-[402px] bg-dim-system" aria-hidden="true" />}
      </>
    );
  }

  return (
    <>
      <Frame
        step={5}
        onBack={back}
        bodyClass="items-center justify-center gap-2.5"
        panel={
          <>
            <Button icon="/icons/mic-white.svg" onClick={() => void turnOn()}>
              마이크 켜기
            </Button>
            <Button variant="dashed" onClick={() => router.push("/signup/done")}>
              나중에 할게요
            </Button>
          </>
        }
      >
        <SpeechBubble
          text={MIC_LINE}
          onSpeak={() => {
            if (speaker.speak(MIC_LINE, () => setPlaying(false))) setPlaying(true);
          }}
          playing={playing}
          className="w-[310px] max-w-full"
        />
        <MoyaImage expression="greet" background="cream" size={240} priority />
        <InfoPill icon="/icons/mic.svg">다음 창에서 ‘허용’을 눌러 주세요</InfoPill>
      </Frame>
      {asking && <div className="fixed inset-0 z-50 mx-auto max-w-[402px] bg-dim-system" aria-hidden="true" />}
    </>
  );
}

// ---- 1-8 아이 모드 시작 (180:7397) ----

export function DoneScreen() {
  const router = useRouter();
  const profile = useStored(readProfile);

  function start() {
    const account = readAccount();
    if (!account) {
      router.replace("/signup");
      return;
    }
    writeAccount({ ...account, loggedIn: true });
    router.replace("/app");
  }

  return (
    <div className="relative flex flex-1 flex-col">
      <main className="flex flex-1 flex-col items-center justify-center gap-3 px-6 pt-10 pb-3">
        <MoyaImage expression="excited" background="cream" size={250} priority />
        <h1 className="type-moya-title-xl whitespace-nowrap text-text-strong">준비 끝!</h1>
        <p className="w-[320px] max-w-full text-center type-body-bold text-text-normal">
          이제 {profile?.nickname || "아이"}에게 휴대폰을 건네주세요.
        </p>
        <HelpCard icon="/icons/lock.svg">보호자 메뉴는 ‘내 정보’ 탭에서 보호자 비밀번호로 열 수 있어요.</HelpCard>
      </main>
      <BottomPanel>
        <Button onClick={start}>아이 모드 시작하기</Button>
      </BottomPanel>
      <Sparkle size={20} className="top-[98px] left-[60px]" />
      <Sparkle size={14} color="purple" className="top-[68px] left-[330px]" />
    </div>
  );
}
