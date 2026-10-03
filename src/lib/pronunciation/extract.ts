// 인식 텍스트에서 대상 단어 추출 ("○○이 뭐야", "○○가 뭐야", "○○ 뭐야").
// '이'로 끝나는 단어(예: 고양이)는 예외 처리하지 않는다 (design.md Open Questions).

// ○○은 공백 없는 한 덩어리로, "뭐야" 바로 앞 덩어리만 꺼낸다. 예: "저 공룡이 뭐야" → 공룡
const QUESTION_PATTERN = /(?:^|\s)(\S+?)\s*(?:이|가)?\s*뭐(?:야|예요|에요|니)?[\s?？!.~]*$/;

export function extractTarget(transcript: string): string | null {
  const match = transcript.trim().match(QUESTION_PATTERN);
  return match ? match[1] : null;
}

// 인식 후보가 여러 개면 각각에서 꺼내고 같은 단어는 한 번만 남긴다. 못 꺼내면 빈 배열.
export function extractTargets(transcripts: string[]): string[] {
  const targets: string[] = [];
  for (const transcript of transcripts) {
    const target = extractTarget(transcript);
    if (target && !targets.includes(target)) targets.push(target);
  }
  return targets;
}
