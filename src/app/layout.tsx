import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";

// Figma는 Inter(한글은 대체 폰트)지만 코드는 한글 폰트를 쓴다 (design.md W1). 줄 간격은 globals.css 토큰으로 고정.
const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "모야",
  description: "아이가 서툴게 물어도 되물어 단어를 찾아 주는 외계인 친구 모야",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${notoSansKr.variable} h-full antialiased`}>
      <body className="min-h-full">
        {/* 앱 틀: Figma 프레임 폭 390px, 가운데 정렬 (design.md W5). 화면은 헤더·본문·하단 탭을 바로 넣는다 */}
        <div className="mx-auto flex min-h-dvh w-full max-w-[390px] flex-col bg-white">{children}</div>
      </body>
    </html>
  );
}
