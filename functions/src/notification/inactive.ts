import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

/**
 * 3일 연속 미참여 리마인더 — Scheduled Cloud Function (KST)
 * 매일 오후 6시에 실행. lastActiveAt이 3일 이상 전인 유저에게 알림.
 */
export const sendInactiveReminder = functions
  .region('asia-northeast3')
  .pubsub.schedule('0 18 * * *')
  .timeZone('Asia/Seoul')
  .onRun(async () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

    const inactiveUsers = await db
      .collection('users')
      .where('lastActiveAt', '<', threeDaysAgo)
      .where('deleted', '!=', true)
      .limit(5000)
      .get();

    if (inactiveUsers.empty) return;

    const messages: admin.messaging.Message[] = [];

    for (const userDoc of inactiveUsers.docs) {
      const fcmToken = userDoc.data().fcmToken;
      if (!fcmToken) continue;

      messages.push({
        token: fcmToken,
        notification: {
          title: '꺼라가 보고 싶어요 😢',
          body: '벌써 3일째 안 오셨네요. 오늘 밤 다시 도전해보세요!',
        },
        data: { type: 'inactive_reminder' },
        android: { priority: 'normal' as const },
        apns: { payload: { aps: { sound: 'default' } } },
      });
    }

    for (let i = 0; i < messages.length; i += 500) {
      const batch = messages.slice(i, i + 500);
      await admin.messaging().sendEach(batch);
    }
  });
