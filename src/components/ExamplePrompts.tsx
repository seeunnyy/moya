// 서툰 발음 예시 질문 버튼 (E1, FR-13). 누르면 그 문장을 인식 텍스트로 삼아 같은 흐름(되묻기)을 진행한다.
// 마이크를 쓸 수 없을 때만 보인다 (시연 폴백).

import { EXAMPLE_PROMPTS } from "@/data/examplePrompts";
import { Button } from "./Button";

type Props = {
  onAsk: (text: string) => void;
};

export function ExamplePrompts({ onAsk }: Props) {
  return (
    <section aria-labelledby="examples-heading" className="flex w-full flex-col gap-2">
      <h2 id="examples-heading" className="text-button">
        이렇게 물어봐
      </h2>
      <ul className="flex flex-wrap gap-3">
        {EXAMPLE_PROMPTS.map((prompt) => (
          <li key={prompt}>
            <Button variant="secondary" onClick={() => onAsk(prompt)}>
              {prompt}
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}
