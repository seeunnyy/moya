// 글자로 물어보기. 마이크를 쓸 수 없을 때(E1)만 음성 녹음 화면의 [녹음 시작] 아래에 보인다.
// Figma에 없는 상태라 Figma Input(Select) 모양과 버튼으로만 조립한다.

import { Button } from "./Button";

type Props = {
  onAsk: (text: string) => void;
};

export function QuestionForm({ onAsk }: Props) {
  return (
    <form
      className="flex w-full flex-col gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const text = new FormData(form).get("question");
        onAsk(typeof text === "string" ? text : "");
        form.reset();
      }}
    >
      <label htmlFor="question" className="text-button">
        글자로 물어보기
      </label>
      <div className="flex gap-3">
        <input
          id="question"
          name="question"
          type="text"
          placeholder="공룡이 뭐야?"
          autoComplete="off"
          className="h-[38px] min-w-0 flex-1 rounded-select border border-line bg-white px-3 text-button placeholder:text-placeholder"
        />
        <Button type="submit">물어보기</Button>
      </div>
    </form>
  );
}
