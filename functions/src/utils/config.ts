/**
 * 서버 설정 상수 — 클라이언트 src/constants/config.ts 및 src/types/payment.ts와 반드시 동기화.
 * 금액 정책 변경은 반드시 이 파일과 클라이언트 양쪽을 함께 수정한다.
 */

// 챌린지 참여 금액 (원)
// 출시 초기: [1000, 5000, 10000]
// 향후 확장 예정: 30000, 50000 (법률/심사 검토 후)
export const CHALLENGE_AMOUNTS: readonly number[] = [1000, 5000, 10000];
export const CHALLENGE_MAX_AMOUNT = 10000;

// 예치금 충전 금액 (원)
export const CHARGE_AMOUNTS: readonly number[] = [5000, 10000, 30000, 50000];

// 출금
export const WITHDRAWAL_MIN_AMOUNT = 3000;
