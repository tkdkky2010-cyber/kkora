import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

const VALID_REASONS = [
  'app_exit',
  'grace_timeout',
  'grace_exceeded',
  'battery_dead',
  'crash',
  'network_error',
  'manual',
];

/**
 * 챌린지 실패 보고 — Cloud Function
 * - failReason 허용 목록 검증
 * - streak 리셋
 * - dailyPool 업데이트
 */
export const reportFailure = functions
  .region('asia-northeast3')
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.HttpsError('unauthenticated', '로그인이 필요합니다.');
    }

    const userId = context.auth.uid;
    const { challengeId, reason } = data;

    if (!challengeId) {
      throw new functions.HttpsError('invalid-argument', '챌린지 ID가 필요합니다.');
    }

    // failReason 허용 목록 검증
    const validatedReason = VALID_REASONS.includes(reason) ? reason : 'unknown';

    await db.runTransaction(async (tx) => {
      const challengeRef = db.collection('challenges').doc(challengeId);
      const challengeDoc = await tx.get(challengeRef);

      if (!challengeDoc.exists) {
        throw new functions.HttpsError('not-found', '챌린지를 찾을 수 없습니다.');
      }

      const challenge = challengeDoc.data()!;

      if (challenge.userId !== userId) {
        throw new functions.HttpsError('permission-denied', '권한이 없습니다.');
      }

      if (challenge.status !== 'active') {
        return;
      }

      // 챌린지 실패 처리
      tx.update(challengeRef, {
        status: 'failed',
        failReason: validatedReason,
      });

      // dailyPool 업데이트
      const poolRef = db.collection('dailyPool').doc(challenge.date);
      tx.update(poolRef, {
        survivors: admin.firestore.FieldValue.increment(-1),
        failures: admin.firestore.FieldValue.increment(1),
      });

      // streak 리셋
      const userRef = db.collection('users').doc(userId);
      tx.update(userRef, { streak: 0 });
    });

    return { success: true };
  });
