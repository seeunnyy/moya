// 되묻기 설정값. 다른 모듈은 이 값만 참조한다. (04 §5)

// 후보로 인정하는 최대 자모 거리 (잠정, 10/16~22 녹음 테스트 후 보정)
export const MAX_DISTANCE = 2;

// 보여줄 최대 후보 수
export const MAX_CANDIDATES = 3;

// [옛 흐름 전용 — askFlow.legacy.ts] [아니에요] / [여기 없어요] 뒤 다시 말하기 횟수. 새 흐름은 쓰지 않는다
export const MAX_RETRY = 1;

// 최대 녹음 시간 (ms). [그만하기]를 누르지 않아도 이 시간이 지나면 녹음을 끝낸다 (잠정, 실기기에서 조정)
export const MAX_RECORDING_MS = 8000;

// mock STT일 때만 피그마 프로토타입의 자동 넘김을 흉내 낸다 (2-2 → 2-3 2.5초, 2-3 → 결과 1.5초).
// 실제 STT는 녹음을 끝낸 순간·인식이 끝난 순간 바로 넘어간다.
export const MOCK_LISTEN_MS = 2500;
export const MOCK_THINK_MS = 1500;

// 2-13 → 2-14 오늘의 미션 성공 창 (실제로도 1.5초)
export const MISSION_SUCCESS_DELAY_MS = 1500;
