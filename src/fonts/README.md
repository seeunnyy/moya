# 글꼴 파일

| 파일 | 글꼴 | 출처 | 라이선스 |
|---|---|---|---|
| `NanumSquareRoundEB.woff2` | 나눔스퀘어라운드 ExtraBold (하단 탭) | 네이버 한글한글 아름답게 공식 웹폰트 CDN `https://hangeul.pstatic.net/hangeul_static/webfont/NanumSquareRound/NanumSquareRoundEB.woff2` (공식 CSS `hangeul_static/css/nanum-square-round.css`가 가리키는 파일), 2026-10-09 받음 | SIL Open Font License 1.1 — 사용·수정·재배포 가능, 글꼴 파일 자체의 판매 금지. 원본 안내: https://hangeul.naver.com |

- 파일을 바꾸지 않고 그대로 둔다. `src/app/layout.tsx`에서 `next/font/local`로 쓴다.
- Jua·Noto Sans KR은 `next/font/google`로 빌드 때 받으므로 이 폴더에 없다.
