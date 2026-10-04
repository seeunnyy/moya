# DESIGN.md

## Design Goal
글을 막 배우는 만 5~8세 아이가 혼자서도 쓸 수 있는, 외계인 캐릭터 '모야' 중심의 모바일 웹. 부모 화면은 아이 화면과 분리한다.

## Visual Tone
- 친근하고 귀여운 캐릭터 중심
- 한 화면에 한 가지 행동
- 큰 버튼, 넓은 터치 영역
- 글자는 짧고 쉽게, 음성 안내와 함께
- 지금은 Figma 와이어프레임(Section 1)의 회색조 스타일을 그대로 쓴다. 값은 planning/md-design/03_UX_UI_SPEC.md §5 (폰트 Noto Sans KR, 줄 간격 토큰 포함)
- 캐릭터·색 디자인: 10/29 시안 후 업데이트 (TBD)

## Main Screens
- Landing Page (/): 부모·심사위원 대상 서비스 소개
- Home (/app): 아이 모드 홈 — 물어보기, 단어 카드, 복습하기(베타), 하단 탭
- Mic (/app/mic): 마이크 권한 안내
- Ask (/app/ask): 음성 녹음 → 되묻기 → 확인 질문 또는 후보 카드 선택 → 단어 카드 보고 저장하기 / 물어볼 단어 안내
- Word Cards (/app/cards, /app/cards/[id]): 아이가 저장한 단어 카드 목록과 상세
- Parent (/parent): 저장·전송 안내. 주간 학습 기록은 2순위

## UI Rules
- Use clear button text.
- Use labels for inputs.
- Use semantic headings.
- Avoid icon-only actions. 아이 화면은 아이콘 + 짧은 글자 + 음성 안내를 함께 쓴다. (와이어프레임 단계 예외: 헤더 "<"는 aria-label만)
- Avoid random design changes.
- 듣는 중 / 생각 중 / 말하는 중 상태를 모야의 표정·동작으로 보여준다.
- 되묻기 후보는 카드로 보여주고, 카드를 누르면 고른다. [들어보기]로 소리를 들려준다.
- 화면에 보이는 글자는 Figma 문구뿐. 모야 대사는 소리와 보조기기 알림으로만 낸다.
