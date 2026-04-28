/**
 * 서버 설정 상수 — 클라이언트 src/constants/config.ts 및 src/types/payment.ts와 반드시 동기화.
 * 금액 정책 변경은 반드시 이 파일과 클라이언트 양쪽을 함께 수정한다.
 */

// 챌린지 참여 금액 (원) — 2026-04-27 변경: 1,000원 제거, 3,000원 신설
// 출시 초기: [3000, 5000, 10000]
// 향후 확장 예정: 30000, 50000 (법률/심사 검토 후)
export const CHALLENGE_AMOUNTS: readonly number[] = [3000, 5000, 10000];
export const CHALLENGE_MAX_AMOUNT = 10000;

// 예치금 충전 금액 (원)
export const CHARGE_AMOUNTS: readonly number[] = [5000, 10000, 30000, 50000];

// 출금 — 2026-04-27 변경
export const WITHDRAWAL_MIN_AMOUNT = 5000;       // 3,000 → 5,000
export const WITHDRAWAL_FREE_MONTHLY_COUNT = 1;  // 월 1회 무료
export const WITHDRAWAL_FEE_PER_EXTRA = 500;     // 추가 건당 500원

// 수수료 (미결 — PG 미팅 후 확정)
// 현행: 미환급액의 20%, 금요일 0%
// 검토안 1: 미환급액의 30%, 금요일 0% 폐지
// 검토안 2 (챌린저스 룰): 총예치금 5% OR 미환급액 50% 중 큰 값
export const FEE_NORMAL_RATE = 0.2;
export const FEE_FRIDAY_RATE = 0; // ⚠️ 폐지 검토 중
