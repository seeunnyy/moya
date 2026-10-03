# Tasks

## 1. 기반: 타입, 설정, 테스트 러너

- [x] 1.1 `src/types`에 WordEntry, WordCard, PendingWord, Candidate, CandidateResult, PronunciationRule, HeardContext 타입을 04 §3대로 정의하고 `npx tsc --noEmit`이 통과하는지 확인
- [x] 1.2 `src/lib/config.ts`에 MAX_DISTANCE=2, MAX_CANDIDATES=3, MAX_RETRY=1을 두고, 다른 모듈이 이 값만 참조하는지 확인
- [x] 1.3 tsconfig에 `allowImportingTsExtensions`를 켜고 `package.json`에 `"test": "node --test tests/"` 스크립트를 추가한 뒤, 샘플 테스트 1개로 `npm test`와 `npm run build`가 둘 다 통과하는지 확인 (실패하면 design.md Risks대로 사용자에게 보고)

## 2. 되묻기 순수 로직 (word-inference, voice-question 추출)

- [x] 2.1 `src/lib/pronunciation/jamo.ts` 자모 분해·조합을 구현하고, "공룡"·"저금통"·받침 없는 음절의 분해 결과를 `tests/pronunciation/jamo.test.ts`로 확인
- [x] 2.2 `distance.ts` 자모 편집거리를 구현하고, 가방↔가발=1, 저그통↔저금통=1, 같은 단어=0을 테스트로 확인
- [x] 2.3 `src/data/rules.ts`에 R1·R3 역규칙 표를, `rules.ts`에 변형 생성을 구현하고, "두박"→"수박", "대풍"→"태풍" 변형이 나오는지 테스트로 확인
- [x] 2.4 `extract.ts` 대상 단어 추출을 구현하고, "공룡이 뭐야?"→공룡, "가바가 뭐야"→가바, "공룡"·빈 문자열→실패를 테스트로 확인
- [x] 2.5 `candidates.ts` 후보 분기(confirm/choose/unknown), 여러 입력 합치기, 상황 동점 정렬을 구현하고, word-inference 스펙의 시나리오(두박·대풍·저그통·가바+TV/학교/모르겠어·뿌잉뿌잉·4개 이상 제한·두박+수박 합치기)를 테스트로 확인

## 3. mock 데이터 (word-explanation 데이터 형식)

- [x] 3.1 `src/data/words.mock.ts`에 05 §3의 10개 단어를 WordEntry 형식(힌트, 상황 태그, 쉬운 설명, 예문, 사전 뜻, 출처 "mock", reviewed=false)으로 작성하고 파일 맨 위에 "mock, 검수 전"을 명시. 데이터 전체로 2.5 테스트가 통과하는지 확인
- [x] 3.2 `src/data/examplePrompts.ts`에 데모 시나리오 문장([두박이 뭐야?], [가바가 뭐야?], [뿌잉뿌잉이 뭐야?])을, `src/data/blocklist.ts`에 테스트용 mock 항목 1개를 두고 타입 검사가 통과하는지 확인

## 4. 저장소 (word-cards, privacy-notice)

- [ ] 4.1 `src/lib/storage`에 카드·물어볼 단어의 읽기·추가 함수를 `moya.cards.v1`, `moya.pending.v1` 키로 구현하고, 가짜 저장소로 저장→읽기, 손상된 JSON→빈 목록, 쓰기 예외→오류 없이 진행을 `tests/storage.test.ts`로 확인
- [ ] 4.2 저장 데이터에 음성 데이터 필드가 없음을 타입과 테스트로 확인

## 5. /app 흐름 — 텍스트 입력으로 끝까지 (05 §2 오늘 범위)

- [ ] 5.1 `/app` 상태 기계 reducer(idle→listening→thinking→confirm|context→choose|unknown→explaining→saved, micDenied, sttFailed, retryCount)를 순수 함수로 구현하고, 두 번 [아니야]→unknown 전이를 포함해 테스트로 확인
- [ ] 5.2 S1(텍스트 입력 + [단어장]), S2(상태 글자), E2를 만들고 "공룡"(질문 아님) 입력 시 E2가 보이는지 브라우저에서 확인 (QA-06)
- [ ] 5.3 S3 확인 질문(단어 + 힌트, [응] [아니야])을 만들고 QA-01, QA-05를 브라우저에서 확인
- [ ] 5.4 S4 상황 버튼 → 후보 카드(힌트, [이거야!]), [다 아니야]를 만들고 QA-02 ①②③을 확인
- [ ] 5.5 S6 물어볼 단어 화면과 저장을 연결하고 QA-04를 확인
- [ ] 5.6 S5 설명(쉬운 설명, 예문, 들은 상황) + 카드 자동 저장 + 저장 완료 표시를 연결하고, QA-03의 세 입력이 각각 수박·태풍·저금통 설명까지 가는지 확인
- [ ] 5.7 모야 대사 영역에 aria-live와 화면별 h1을 넣고, 버튼에 글자와 48px 이상 터치 영역을 적용한 뒤 키보드만으로 QA-01을 진행해 확인 (QA-10)

## 6. 단어장 (word-cards)

- [ ] 6.1 `/app/cards`에 카드 목록·물어볼 단어 목록·빈 상태 안내를 만들고 QA-07(새로고침 후 유지), QA-08(빈 상태)을 확인

## 7. 오늘 범위 통합 확인

- [ ] 7.1 375px 폭에서 S1~S7 가로 스크롤이 없는지 확인하고(QA-09), `npm test`, `npm run lint`, `npm run build`가 모두 통과하는지 확인

## 8. 시연 폴백과 고지 (1차 배포 전)

- [ ] 8.1 S1·E1·E2에 예시 버튼을 붙이고, 마이크 없이 데모 시나리오 2~5단계를 진행해 확인 (QA-11)
- [ ] 8.2 S1·S7에 저장·전송 고지 영역을 만들고 문구가 보이는지 확인 (QA-12)
- [ ] 8.3 대상 단어가 부적절 단어 목록에 있으면 "엄마·아빠한테 물어보자"를 보여주고 저장하지 않게 하고, mock 항목으로 단어장에 추가되지 않는지 테스트와 브라우저로 확인

## 9. 음성 출력 (word-explanation)

- [ ] 9.1 speechSynthesis 래퍼(ko-KR, 미지원 시 아무 동작 없음)를 만들고 모야 대사·설명·후보 카드 누르기·[다시 듣기]에 연결한 뒤, 데스크톱 Chrome에서 소리가 나는지와 래퍼를 끈 상태에서 흐름이 그대로 진행되는지 확인

## 10. 음성 입력 (voice-question)

- [ ] 10.1 STT 어댑터 인터페이스(`transcripts: string[]`)와 mock 구현, 환경변수 전환을 만들고 mock 응답으로 어댑터 테스트를 통과시킨다
- [ ] 10.2 `POST /api/stt` 라우트를 만들고, 키를 서버에서만 읽는지 빌드 결과물에 키 값이 없는 것으로 확인
- [ ] 10.3 MicButton 녹음(MediaRecorder, [그만하기], 최대 녹음 시간)과 S2 '듣는 중 → 생각 중' 표시를 붙이고 mock STT로 S3까지 가는지 확인
- [ ] 10.4 마이크 권한 거부 시 E1(텍스트 입력·예시 버튼 포함)을 보여주고, 브라우저에서 권한을 막아 확인
- [ ] 10.5 STT 선정 후 실제 어댑터를 구현하고, 모바일 Chrome·Safari 실기기에서 "공룡이 뭐야?"가 인식돼 S3까지 가는지 확인 (STT 선정 전에는 보류)

## 11. 랜딩과 1차 배포 전 통합 확인

- [ ] 11.1 S0에 소개 문구와 [모야 만나러 가기] 버튼을 두고 `/app`으로 이동하는지 확인
- [ ] 11.2 모바일 실기기에서 데모 시나리오(05 §5)를 마이크와 예시 버튼으로 각각 끝까지 진행하고, `npm test`, `npm run lint`, `npm run build` 통과를 확인
