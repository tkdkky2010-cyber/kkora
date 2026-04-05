import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

/**
 * 밤 9:30 리마인더 푸시 — Scheduled Cloud Function (KST)
 * 오늘 아직 챌린지에 참여하지 않은 유저에게 알림 발송.
 */
export const sendReminder = functions
  .region('asia-northeast3')
  .pubsub.schedule('30 21 * * *')
  .timeZone('Asia/Seoul')
  .onRun(async () => {
    // FCM 토큰이 있는 활성 유저 조회
    const usersSnapshot = await db
      .collection('users')
      .where('deleted', '!=', true)
      .limit(10000)
      .get();

    if (usersSnapshot.empty) return;

    const messages: admin.messaging.Message[] = [];

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const fcmToken = userData.fcmToken;
      if (!fcmToken) continue;

      messages.push({
        token: fcmToken,
        notification: {
          title: '꺼라 — 오늘 밤 참전 준비!',
          body: '30분 후 챌린지가 시작됩니다. 폰을 끄고 돈을 벌 준비 되셨나요?',
        },
        data: {
          type: 'reminder',
        },
        android: {
          priority: 'high' as const,
        },
        apns: {
          payload: { aps: { sound: 'default' } },
        },
      });
    }

    // 500개씩 배치 전송
    for (let i = 0; i < messages.length; i += 500) {
      const batch = messages.slice(i, i + 500);
      await admin.messaging().sendEach(batch);
    }
  });
