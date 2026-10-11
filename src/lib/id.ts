// 기기에 저장하는 기록의 id. crypto.randomUUID는 http(휴대폰에서 개발 서버 접속)에서 없을 수 있어 직접 만든다.
export function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
