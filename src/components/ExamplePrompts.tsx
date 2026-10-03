// 서툰 발음 예시 질문 버튼 (S1, E1, E2, FR-13). 누르면 그 문장을 인식 텍스트로 삼아 같은 흐름을 진행한다.
// 마이크 없이 시연하거나, 마이크·음성인식이 실패했을 때의 폴백이다.

import { EXAMPLE_PROMPTS } from "@/data/examplePrompts";
import { Button } from "./Button";

type Props = {
  onAsk: (text: string) => void;
};

export function ExamplePrompts({ onAsk }: Props) {
  return (
    <section aria-labelledby="examples-heading" className="flex flex-col gap-2">
      <h2 id="examples-heading" className="font-semibold">
        이렇게 물어봐
      </h2>
      <ul className="flex flex-col gap-2">
        {EXAMPLE_PROMPTS.map((prompt) => (
          <li key={prompt}>
            <Button className="w-full" onClick={() => onAsk(prompt)}>
              {prompt}
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}
