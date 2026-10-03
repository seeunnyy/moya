// 음성인식(STT) 어댑터 인터페이스 (design.md "STT는 서버 라우트 + 어댑터").
// mock과 실제 서비스가 같은 모양으로 결과를 돌려준다. 서버(/api/stt)에서만 쓴다.

export type SttResult = {
  transcripts: string[]; // 인식 후보, 확률 높은 순. 비어 있으면 인식 실패(E2)
};

export type SttAdapter = {
  name: string; // 예: "mock"
  transcribe(audio: Blob): Promise<SttResult>;
};
