import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { checkRateLimit } from '../utils/security';

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

// 클라이언트 types/payment.ts의 CHARGE_AMOUNTS와 반드시 동기화
const VALID_AMOUNTS = [5000, 10000, 30000, 50000];

/**
 * 예치금 충전 — Cloud Function
 * 실제 카카오페이 PG 연동 전까지는 직접 잔액 증가 (개발용).
 * PG 연동 시: 결제 승인 확인 후 잔액 증가로 변경.
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

    if (!VALID_AMOUNTS.includes(amount)) {
      throw new functions.HttpsError('invalid-argument', '유효하지 않은 충전 금액입니다.');
    }

    // TODO: 카카오페이 PG 결제 승인 처리
    // const pgResult = await kakaopay.approve(...)
    // if (!pgResult.success) throw ...

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
