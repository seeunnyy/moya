// 저장·전송 고지 (S1, S7, NFR-09). 눌러서 여는 영역이다.
// 문구는 03 §3 잠정안. 보호자용 문구와 위치는 미정 (design.md Open Questions).

import { buttonClass } from "./Button";

export const PRIVACY_NOTICE =
  "목소리는 글자로 바꾸는 데만 쓰고 저장하지 않아요. 물어본 단어는 이 기기에만 저장돼요.";

export function PrivacyNotice() {
  return (
    <details className="rounded-lg border-2 border-dashed border-current">
      <summary className={`${buttonClass} w-full cursor-pointer border-0`}>저장·전송 안내</summary>
      <p className="px-4 pb-4 break-keep">{PRIVACY_NOTICE}</p>
    </details>
  );
}
