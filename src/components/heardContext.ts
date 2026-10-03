// 들은 상황 버튼 이름과 모야의 받는 말 (03 ContextPicker, 잠정)

import type { HeardContext } from "@/types";

export const CONTEXT_OPTIONS: { value: HeardContext; label: string; reply: string }[] = [
  { value: "tv", label: "TV", reply: "TV에서 들었구나!" },
  { value: "book", label: "책", reply: "책에서 봤구나!" },
  { value: "adult", label: "어른 말", reply: "어른한테 들었구나!" },
  { value: "school", label: "유치원·학교", reply: "유치원이나 학교에서 들었구나!" },
];

export function contextOption(value: HeardContext) {
  return CONTEXT_OPTIONS.find((option) => option.value === value);
}
