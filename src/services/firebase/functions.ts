import { getFunctions, httpsCallable } from 'firebase/functions';
import app from './config';

const functions = getFunctions(app, 'asia-northeast3');

/**
 * 챌린지 시작 (Cloud Function 호출)
 * - 서버에서 잔액 차감, 챌린지 문서 생성, dailyPool 업데이트
 */
export async function startChallenge(amount: number): Promise<{ challengeId: string }> {
  const callable = httpsCallable<{ amount: number }, { challengeId: string }>(
    functions,
    'startChallenge',
  );
  const result = await callable({ amount });
  return result.data;
}

/**
 * Grace period 보고 (Cloud Function 호출)
 * - 앱 이탈/복귀 시 서버에 기록
 */
export async function reportGrace(
  challengeId: string,
  result: 'returned' | 'failed',
  exitTimeMs?: number,
): Promise<void> {
  const callable = httpsCallable<
    { challengeId: string; result: string; exitTimeMs?: number },
    void
  >(functions, 'reportGrace');
  await callable({ challengeId, result, exitTimeMs });
}

/**
 * 챌린지 실패 보고 (Cloud Function 호출)
 */
export async function reportFailure(
  challengeId: string,
  reason: string,
): Promise<void> {
  const callable = httpsCallable<
    { challengeId: string; reason: string },
    void
  >(functions, 'reportFailure');
  await callable({ challengeId, reason });
}

/**
 * 예치금 충전 (Cloud Function 호출)
 */
export async function requestDeposit(amount: number): Promise<void> {
  const callable = httpsCallable<{ amount: number }, { success: boolean }>(
    functions,
    'requestDeposit',
  );
  await callable({ amount });
}

/**
 * 출금 신청 (Cloud Function 호출)
 */
export async function requestWithdrawal(
  amount: number,
  bankCode: string,
  accountNumber: string,
): Promise<void> {
  const callable = httpsCallable<
    { amount: number; bankCode: string; accountNumber: string },
    { success: boolean }
  >(functions, 'requestWithdrawal');
  await callable({ amount, bankCode, accountNumber });
}

/**
 * Heartbeat ping (Cloud Function 호출)
 * - 챌린지 중 30초 주기 호출 → RTDB에 lastPingAt 갱신
 */
export async function pingChallenge(
  challengeId: string,
  appState: 'active' | 'background' = 'active',
  batteryLevel?: number,
): Promise<{ ok: boolean; pingCount?: number; throttled?: boolean }> {
  const callable = httpsCallable<
    { challengeId: string; appState: string; batteryLevel?: number },
    { ok: boolean; pingCount?: number; throttled?: boolean }
  >(functions, 'pingChallenge');
  const result = await callable({ challengeId, appState, batteryLevel });
  return result.data;
}

/**
 * 이의 제기 제출 (Cloud Function 호출)
 */
export async function submitDispute(data: {
  challengeId: string | null;
  type: 'challenge_result' | 'payment' | 'refund' | 'other';
  reason: string;
  evidence?: string[];
}): Promise<{ disputeId: string }> {
  const callable = httpsCallable<typeof data, { disputeId: string }>(
    functions,
    'submitDispute',
  );
  const result = await callable(data);
  return result.data;
}

/**
 * 회원 탈퇴 (Cloud Function 호출)
 */
export async function deleteAccount(
  bankCode?: string,
  accountNumber?: string,
): Promise<{ refundedAmount: number }> {
  const callable = httpsCallable<
    { bankCode?: string; accountNumber?: string } | undefined,
    { success: boolean; refundedAmount: number }
  >(functions, 'deleteUser');
  const result = await callable({ bankCode, accountNumber });
  return { refundedAmount: result.data.refundedAmount };
}
