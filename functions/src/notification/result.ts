import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { getKSTYesterdayString } from '../utils/time';

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

/**
 * 아침 7시 결과 알림 — Scheduled Cloud Function (KST)
 * settle 이후 실행. 어젯밤 참여자에게 결과 푸시 발송.
 */
export const sendResultNotification = functions
  .region('asia-northeast3')
  .pubsub.schedule('5 7 * * *') // settle(7:00) 직후 7:05에 실행
  .timeZone('Asia/Seoul')
  .onRun(async () => {
    const dateStr = getKSTYesterdayString();

    // 어젯밤 챌린지 조회
    const challenges = await db
      .collection('challenges')
      .where('date', '==', dateStr)
      .get();

    if (challenges.empty) return;

    const messages: admin.messaging.Message[] = [];

    for (const challengeDoc of challenges.docs) {
      const data = challengeDoc.data();
      const userDoc = await db.collection('users').doc(data.userId).get();
      if (!userDoc.exists) continue;

      const fcmToken = userDoc.data()?.fcmToken;
      if (!fcmToken) continue;

      const isSuccess = data.status === 'success';
      const earnings = data.earnings || 0;
      const amount = data.amount || 0;

      messages.push({
        token: fcmToken,
        notification: {
          title: isSuccess ? '챌린지 성공! 🎉' : '챌린지 실패 💀',
          body: isSuccess
            ? `+${(amount + earnings).toLocaleString()}원! 오늘 밤도 도전하세요.`
            : `${amount.toLocaleString()}원이 몰수되었습니다. 내일 다시 도전!`,
        },
        data: {
          type: 'result',
          challengeId: challengeDoc.id,
        },
        android: { priority: 'high' as const },
        apns: { payload: { aps: { sound: 'default' } } },
      });
    }

    for (let i = 0; i < messages.length; i += 500) {
      const batch = messages.slice(i, i + 500);
      await admin.messaging().sendEach(batch);
    }
  });
