import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * 개인정보 다운로드 — HTTPS Callable
 *
 * 개인정보보호법·GDPR 정보이동권 준수. 유저 본인이 자신의 데이터를
 * JSON으로 다운로드 요청할 수 있도록 한다. 서비스 종료/제거 시 특히 중요.
 *
 * 본인만 호출 가능. admin은 불가 (프라이버시 보호).
 */
export const exportUserData = functions
  .region('asia-northeast3')
  .runWith({ timeoutSeconds: 60, memory: '512MB' })
  .https.onCall(async (_data, context) => {
    if (!context.auth) {
      throw new functions.HttpsError('unauthenticated', '로그인이 필요합니다.');
    }

    const userId = context.auth.uid;

    const [userDoc, challenges, transactions, disputes, graceLogs] = await Promise.all([
      db.collection('users').doc(userId).get(),
      db.collection('challenges').where('userId', '==', userId).limit(1000).get(),
      db.collection('transactions').where('userId', '==', userId).limit(2000).get(),
      db.collection('disputes').where('userId', '==', userId).limit(500).get(),
      db.collection('graceLogs').where('userId', '==', userId).limit(2000).get(),
    ]);

    return {
      exportedAt: new Date().toISOString(),
      userId,
      user: userDoc.exists ? userDoc.data() : null,
      challenges: challenges.docs.map((d) => ({ id: d.id, ...d.data() })),
      transactions: transactions.docs.map((d) => ({ id: d.id, ...d.data() })),
      disputes: disputes.docs.map((d) => ({ id: d.id, ...d.data() })),
      graceLogs: graceLogs.docs.map((d) => ({ id: d.id, ...d.data() })),
    };
  });
