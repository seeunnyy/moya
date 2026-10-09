import type { Metadata, Viewport } from "next";
import { Jua, Noto_Sans_KR } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

// 본문 (피그마 본문/*, 보호자/*)
const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
});

// 말풍선·제목·버튼 (피그마 모야/*). 변수 이름은 Tailwind 토큰 --font-jua 와 겹치지 않게 --nf-* 로 둔다
const jua = Jua({
  variable: "--nf-jua",
  weight: "400",
  subsets: ["latin"],
});

// 하단 탭 (나눔스퀘어라운드 ExtraBold). 출처·라이선스는 src/fonts/README.md
const nanumSquareRound = localFont({
  variable: "--nf-nanum-square-round",
  src: "../fonts/NanumSquareRoundEB.woff2",
  weight: "800",
  preload: false,
});

export const metadata: Metadata = {
  title: "모야",
  description: "아이가 서툴게 물어도 되물어 단어를 찾아 주는 외계인 친구 모야",
};

// 실기기에서 하단 안전 영역(env(safe-area-inset-bottom))을 쓰려면 viewport-fit=cover 가 필요하다
export const viewport: Viewport = {
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${notoSansKr.variable} ${jua.variable} ${nanumSquareRound.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        {/* 앱 틀: 피그마 프레임 폭 402px, 가운데 정렬, 크림 배경. 화면은 헤더·본문·하단 탭을 바로 넣는다.
            화면이 402px보다 넓을 때만 옅은 그림자로 휴대폰처럼 보이게 한다 (피그마에 없음) */}
        <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-cream min-[403px]:shadow-app">{children}</div>
      </body>
    </html>
  );
}
