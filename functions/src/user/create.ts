import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

/**
 * 유저 생성 — Cloud Function (Auth trigger)
 * Firebase Auth에 유저가 생성되면 자동으로 Firestore 문서 생성.
 */
export const onUserCreate = functions
  .region('asia-northeast3')
  .auth.user()
  .onCreate(async (user) => {
    const userId = user.uid;

    // 랜덤 참가자 번호 (1~100,000)
    const playerNumber = Math.floor(Math.random() * 100000) + 1;

    await db.collection('users').doc(userId).set({
      displayName: user.displayName || '유저',
      kakaoId: '',
      deviceId: '',
      balance: 0,
      freeTrialDaysLeft: 3,
      streak: 0,
      maxStreak: 0,
      level: '잠알',
      totalEarnings: 0,
      playerNumber,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastActiveAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });
