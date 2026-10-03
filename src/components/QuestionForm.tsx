// 텍스트로 질문하기. 마이크를 못 쓸 때의 폴백이자, 음성 연동 전 기본 입력 (S1, E1, E2).

import { Button } from "./Button";

type Props = {
  onAsk: (text: string) => void;
};

export function QuestionForm({ onAsk }: Props) {
  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const text = new FormData(form).get("question");
        onAsk(typeof text === "string" ? text : "");
        form.reset();
      }}
    >
      <label htmlFor="question" className="font-semibold">
        글자로 물어보기
      </label>
      <input
        id="question"
        name="question"
        type="text"
        placeholder="공룡이 뭐야?"
        autoComplete="off"
        className="min-h-12 w-full rounded-lg border-2 border-current px-3 text-base"
      />
      <Button type="submit">물어보기</Button>
    </form>
  );
}
