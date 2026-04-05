import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Grace period 보고 — Cloud Function
 * - 앱 이탈 후 복귀 or 실패 시 서버에 기록
 * - gracesUsed 증가, 4회 이상 시 즉시 실패 처리
 * - 실패 시 streak 리셋
 */
export const reportGrace = functions
  .region('asia-northeast3')
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.HttpsError('unauthenticated', '로그인이 필요합니다.');
    }

    const userId = context.auth.uid;
    const { challengeId, result, exitTimeMs } = data;

    if (!challengeId || !['returned', 'failed'].includes(result)) {
      throw new functions.HttpsError('invalid-argument', '잘못된 요청입니다.');
    }

    // 클라이언트 이탈 시각 검증 (최대 2분 이내만 허용)
    let validatedExitTime: Date | null = null;
    if (typeof exitTimeMs === 'number') {
      const now = Date.now();
      const diff = Math.abs(now - exitTimeMs);
      if (diff < 120000) { // 2분 이내
        validatedExitTime = new Date(exitTimeMs);
      }
    }

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

      // grace 로그 기록 (이탈 시각은 클라이언트 제공, 복귀 시각은 서버)
      const graceRef = db.collection('graceLogs').doc();
      tx.set(graceRef, {
        challengeId,
        userId,
        exitTime: validatedExitTime || admin.firestore.FieldValue.serverTimestamp(),
        returnTime: result === 'returned'
          ? admin.firestore.FieldValue.serverTimestamp()
          : null,
        duration: validatedExitTime
          ? Math.round((Date.now() - validatedExitTime.getTime()) / 1000)
          : 0,
        result,
      });

      const markFailed = (reason: string) => {
        tx.update(challengeRef, {
          status: 'failed',
          failReason: reason,
          gracesUsed: admin.firestore.FieldValue.increment(1),
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
      };

      if (result === 'failed') {
        // 60초 초과 → 즉시 실패
        markFailed('grace_timeout');
      } else {
        // 복귀 성공 — gracesUsed 증가
        const newGraces = (challenge.gracesUsed || 0) + 1;

        // 스펙: 최대 3회 유예, 4회째 이탈 시 즉시 실패
        if (newGraces > 3) {
          markFailed('grace_exceeded');
        } else {
          tx.update(challengeRef, {
            gracesUsed: newGraces,
          });
        }
      }
    });

    return { success: true };
  });
