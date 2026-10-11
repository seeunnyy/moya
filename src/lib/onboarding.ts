// 온보딩(1-0~1-8) 규칙. 저장소를 읽지 않는 순수 함수다 (화면이 읽어서 넘긴다).
// 가입·로그인은 이 기기에만 저장하는 가짜다 (design.md "가짜 가입·잠금"): 계정 비밀번호는 저장도 비교도 하지 않는다.

import type { Account } from "./storage/index.ts";

// 이메일 형식 (아주 느슨하게: 공백 없이 a@b.c)
export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

// 받침이 있으면 true (한글 음절이 아니면 false)
function hasFinalConsonant(word: string): boolean {
  const last = word.trim().slice(-1);
  const code = last.charCodeAt(0) - 0xac00;
  return code >= 0 && code <= 11171 && code % 28 !== 0;
}

// 부르는 말: "지우야", "서준아" (1-3 미리 보기)
export function vocative(nickname: string): string {
  const name = nickname.trim();
  return `${name}${hasFinalConsonant(name) ? "아" : "야"}`;
}

export type LoginResult = "ok" | "noAccount";

// 1-0: 이 기기에 저장된 계정과 같은지. 이메일은 대소문자·앞뒤 공백 무시
export function checkLogin(saved: Account | null, input: { method: "email"; email: string } | { method: "kakao" }): LoginResult {
  if (!saved || saved.method !== input.method) return "noAccount";
  if (input.method === "kakao") return "ok";
  return saved.email?.trim().toLowerCase() === input.email.trim().toLowerCase() ? "ok" : "noAccount";
}

// 1-2 [다음]: 비어 있거나 틀린 칸 (피그마에 없는 문구, PM 확인 2026-10-11)
export const SIGNUP_ERRORS = {
  email: "이메일 형식을 확인해 주세요",
  password: "비밀번호를 입력해 주세요",
  terms: "필수 약관에 모두 동의해 주세요",
} as const;

export type SignupErrors = Partial<Record<keyof typeof SIGNUP_ERRORS, string>>;

export function validateSignup(input: { email: string; password: string; termsAll: boolean }, method: "email" | "kakao"): SignupErrors {
  const errors: SignupErrors = {};
  if (method === "email") {
    if (!isEmail(input.email)) errors.email = SIGNUP_ERRORS.email;
    if (input.password.length === 0) errors.password = SIGNUP_ERRORS.password;
  }
  if (!input.termsAll) errors.terms = SIGNUP_ERRORS.terms;
  return errors;
}
