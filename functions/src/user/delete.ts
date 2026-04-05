import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { refundBalance } from '../payment/refund';

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

/**
 * 회원 탈퇴 — Cloud Function
 * 1. 활성 챌린지 확인 (있으면 탈퇴 불가)
 * 2. 잔액 전액 환불
 * 3. 유저 데이터 삭제
 * 4. Firebase Auth 계정 삭제
 */
export const deleteUser = functions
  .region('asia-northeast3')
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.HttpsError('unauthenticated', '로그인이 필요합니다.');
    }

    const userId = context.auth.uid;
    const { bankCode, accountNumber } = data || {};

    // 활성 챌린지 확인
    const activeChallenges = await db
      .collection('challenges')
      .where('userId', '==', userId)
      .where('status', '==', 'active')
      .limit(1)
      .get();

    if (!activeChallenges.empty) {
      throw new functions.HttpsError(
        'failed-precondition',
        '진행 중인 챌린지가 있어 탈퇴할 수 없습니다. 챌린지 종료 후 다시 시도해주세요.',
      );
    }

    // 잔액 환불
    const refunded = await refundBalance(userId);

    // 유저 문서 삭제 (soft delete — 법적 보존 기간 고려)
    // 환불 계좌 정보도 함께 보관 (실제 이체 처리용)
    await db.collection('users').doc(userId).update({
      deleted: true,
      deletedAt: admin.firestore.FieldValue.serverTimestamp(),
      displayName: '탈퇴 유저',
      kakaoId: '',
      deviceId: '',
      refundBankCode: bankCode || '',
      refundAccountNumber: accountNumber || '',
      refundAmount: refunded,
    });

    // Firebase Auth 계정 삭제
    await admin.auth().deleteUser(userId);

    return { success: true, refundedAmount: refunded };
  });
