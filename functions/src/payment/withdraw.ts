import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { checkRateLimit } from '../utils/security';

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

const MIN_WITHDRAWAL = 3000;
const MAX_WITHDRAWAL = 1000000; // 1회 최대 100만원

/**
 * 출금 신청 — Cloud Function
 * 실제 오픈뱅킹 API 연동 전까지는 잔액 차감 + 거래 기록만 (개발용).
 *
 * ⚠️ 프로덕션 배포 가드:
 * process.env.ALLOW_MOCK_PAYMENT !== 'true' 이면 미연동 상태 호출을 거부한다.
 */
export const requestWithdrawal = functions
  .region('asia-northeast3')
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.HttpsError('unauthenticated', '로그인이 필요합니다.');
    }

    // 오픈뱅킹 미연동 상태의 프로덕션 호출 차단
    if (process.env.ALLOW_MOCK_PAYMENT !== 'true') {
      throw new functions.HttpsError(
        'unimplemented',
        '출금 시스템 점검 중입니다. 잠시 후 다시 시도해주세요.',
      );
    }

    const userId = context.auth.uid;
    const { amount, bankCode, accountNumber } = data;

    // Rate limiting
    const allowed = await checkRateLimit(db, userId, 'withdrawal', 10000);
    if (!allowed) {
      throw new functions.HttpsError('resource-exhausted', '요청이 너무 빠릅니다.');
    }

    // 검증
    if (typeof amount !== 'number' || amount < MIN_WITHDRAWAL) {
      throw new functions.HttpsError('invalid-argument', `최소 출금 금액은 ${MIN_WITHDRAWAL.toLocaleString()}원입니다.`);
    }
    if (amount > MAX_WITHDRAWAL) {
      throw new functions.HttpsError('invalid-argument', `1회 최대 출금 금액은 ${MAX_WITHDRAWAL.toLocaleString()}원입니다.`);
    }
    if (!bankCode || typeof bankCode !== 'string') {
      throw new functions.HttpsError('invalid-argument', '은행을 선택해주세요.');
    }
    if (!accountNumber || typeof accountNumber !== 'string' || accountNumber.length < 10) {
      throw new functions.HttpsError('invalid-argument', '올바른 계좌번호를 입력해주세요.');
    }

    await db.runTransaction(async (tx) => {
      const userRef = db.collection('users').doc(userId);
      const userDoc = await tx.get(userRef);

      if (!userDoc.exists) {
        throw new functions.HttpsError('not-found', '유저 정보를 찾을 수 없습니다.');
      }

      const userData = userDoc.data()!;
      if (userData.balance < amount) {
        throw new functions.HttpsError('failed-precondition', '잔액이 부족합니다.');
      }

      // 잔액 차감
      tx.update(userRef, {
        balance: admin.firestore.FieldValue.increment(-amount),
        lastActiveAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // 거래 내역 기록
      const txRef = db.collection('transactions').doc();
      tx.set(txRef, {
        userId,
        type: 'withdrawal',
        amount,
        status: 'pending', // 실제 이체는 비동기 처리
        description: `${amount.toLocaleString()}원 출금 신청`,
        bankCode,
        accountNumber,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        completedAt: null,
      });

      // TODO: 오픈뱅킹 API 이체 요청
    });

    return { success: true };
  });
