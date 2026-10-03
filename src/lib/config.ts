// 되묻기 설정값. 다른 모듈은 이 값만 참조한다. (04 §5)

// 후보로 인정하는 최대 자모 거리 (잠정, 10/16~22 녹음 테스트 후 보정)
export const MAX_DISTANCE = 2;

// 보여줄 최대 후보 수
export const MAX_CANDIDATES = 3;

// [아니야] / [다 아니야] 뒤 다시 말하기 횟수
export const MAX_RETRY = 1;

// 최대 녹음 시간 (ms). [그만하기]를 누르지 않아도 이 시간이 지나면 녹음을 끝낸다 (잠정, 실기기에서 조정)
export const MAX_RECORDING_MS = 8000;
