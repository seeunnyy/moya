// 저장·전송 안내 (S8 보호자 화면, NFR-09). 아이 화면에는 두지 않는다.
// 문구는 03 §3 잠정안. 보호자용 문구는 미정 (design.md Open Questions).

export const PRIVACY_NOTICE =
  "목소리는 글자로 바꾸는 데만 쓰고 저장하지 않아요. 물어본 단어는 이 기기에만 저장돼요.";

export function PrivacyNotice() {
  return <p className="text-body">{PRIVACY_NOTICE}</p>;
}
