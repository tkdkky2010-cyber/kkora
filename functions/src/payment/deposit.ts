import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { checkRateLimit } from '../utils/security';
import { CHARGE_AMOUNTS } from '../utils/config';

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

/**
 * 예치금 충전 — Cloud Function
 * 실제 카카오페이 PG 연동 전까지는 직접 잔액 증가 (개발용).
 * PG 연동 시: 결제 승인 확인 후 잔액 증가로 변경.
 *
 * ⚠️ 프로덕션 배포 가드:
 * process.env.ALLOW_MOCK_PAYMENT !== 'true' 이면 PG 미연동 상태 호출을 거부한다.
 * 실제 PG 연동 시 PG 승인 결과 검증 로직으로 교체 후 이 가드 제거.
 */
export const requestDeposit = functions
  .region('asia-northeast3')
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.HttpsError('unauthenticated', '로그인이 필요합니다.');
    }

    const userId = context.auth.uid;
    const { amount } = data;

    // Rate limiting
    const allowed = await checkRateLimit(db, userId, 'deposit', 5000);
    if (!allowed) {
      throw new functions.HttpsError('resource-exhausted', '요청이 너무 빠릅니다. 잠시 후 다시 시도해주세요.');
    }

    if (!CHARGE_AMOUNTS.includes(amount)) {
      throw new functions.HttpsError('invalid-argument', '유효하지 않은 충전 금액입니다.');
    }

    // PG 미연동 상태의 프로덕션 호출 차단 (개발 환경에서만 ALLOW_MOCK_PAYMENT=true)
    if (process.env.ALLOW_MOCK_PAYMENT !== 'true') {
      throw new functions.HttpsError(
        'unimplemented',
        '결제 시스템 점검 중입니다. 잠시 후 다시 시도해주세요.',
      );
    }

    // TODO: 카카오페이 PG 결제 승인 처리
    // const pgResult = await kakaopay.approve(...)
    // if (!pgResult.success) throw new functions.HttpsError('failed-precondition', 'PG 승인 실패');

    await db.runTransaction(async (tx) => {
      const userRef = db.collection('users').doc(userId);
      const userDoc = await tx.get(userRef);

      if (!userDoc.exists) {
        throw new functions.HttpsError('not-found', '유저 정보를 찾을 수 없습니다.');
      }

      // 잔액 증가
      tx.update(userRef, {
        balance: admin.firestore.FieldValue.increment(amount),
        lastActiveAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // 거래 내역 기록
      const txRef = db.collection('transactions').doc();
      tx.set(txRef, {
        userId,
        type: 'deposit',
        amount,
        status: 'completed',
        description: `${amount.toLocaleString()}원 충전`,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        completedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    return { success: true };
  });
