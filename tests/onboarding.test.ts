import { test } from "node:test";
import assert from "node:assert/strict";
import { checkLogin, isEmail, validateSignup, vocative, SIGNUP_ERRORS } from "../src/lib/onboarding.ts";

test("부르는 말: 받침 있으면 '아', 없으면 '야'", () => {
  assert.equal(vocative("지우"), "지우야");
  assert.equal(vocative("서준"), "서준아");
  assert.equal(vocative(" 하늘 "), "하늘아");
  assert.equal(vocative("Max"), "Max야");
});

test("이메일 형식", () => {
  assert.equal(isEmail("jiwoo.mom@email.com"), true);
  assert.equal(isEmail(" a@b.co "), true);
  for (const bad of ["", "jiwoo@", "jiwoo.mom", "a b@c.d", "@b.c"]) assert.equal(isEmail(bad), false, bad);
});

test("로그인: 이 기기에 저장된 계정과 같은 방법·이메일일 때만 (비밀번호는 보지 않음)", () => {
  const email = { method: "email" as const, email: "Jiwoo.Mom@email.com", loggedIn: false, createdAt: "" };
  assert.equal(checkLogin(email, { method: "email", email: " jiwoo.mom@email.com " }), "ok");
  assert.equal(checkLogin(email, { method: "email", email: "other@email.com" }), "noAccount");
  assert.equal(checkLogin(email, { method: "kakao" }), "noAccount");
  assert.equal(checkLogin({ method: "kakao", loggedIn: false, createdAt: "" }, { method: "kakao" }), "ok");
  assert.equal(checkLogin(null, { method: "kakao" }), "noAccount");
});

test("가입 확인: 이메일 가입은 이메일·비밀번호·필수 약관, 카카오는 필수 약관만", () => {
  assert.deepEqual(validateSignup({ email: "a@b.co", password: "x", termsAll: true }, "email"), {});
  assert.deepEqual(validateSignup({ email: "a@", password: "", termsAll: false }, "email"), {
    email: SIGNUP_ERRORS.email,
    password: SIGNUP_ERRORS.password,
    terms: SIGNUP_ERRORS.terms,
  });
  assert.deepEqual(validateSignup({ email: "", password: "", termsAll: true }, "kakao"), {});
  assert.deepEqual(validateSignup({ email: "", password: "", termsAll: false }, "kakao"), { terms: SIGNUP_ERRORS.terms });
});
