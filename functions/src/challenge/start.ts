import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { getKSTHour, getKSTDateString, getKSTDay } from '../utils/time';
import { checkRateLimit } from '../utils/security';
import { CHALLENGE_AMOUNTS } from '../utils/config';

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * 챌린지 시작 — Cloud Function
 * 1. KST 기준 참여 시간 검증 (22:00~23:59)
 * 2. 금액 검증 (config.CHALLENGE_AMOUNTS)
 * 3. 중복 참여 방지 (문서 ID = userId_dateStr)
 * 4. 잔액 차감 (Firestore Transaction)
 * 5. 챌린지 문서 생성
 * 6. dailyPool 업데이트
 */
export const startChallenge = functions
  .region('asia-northeast3')
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.HttpsError('unauthenticated', '로그인이 필요합니다.');
    }

    const userId = context.auth.uid;
    const { amount } = data;

    // Rate limiting (5초 간격)
    const allowed = await checkRateLimit(db, userId, 'startChallenge', 5000);
    if (!allowed) {
      throw new functions.HttpsError('resource-exhausted', '요청이 너무 빠릅니다.');
    }

    // 금액 검증
    if (!CHALLENGE_AMOUNTS.includes(amount)) {
      throw new functions.HttpsError('invalid-argument', '유효하지 않은 참여 금액입니다.');
    }

    // KST 기준 시간 검증
    const kstHour = getKSTHour();
    if (kstHour < 22) {
      throw new functions.HttpsError(
        'failed-precondition',
        '참여 시간은 밤 10시~자정입니다.',
      );
    }

    // KST 기준 오늘 날짜
    const dateStr = getKSTDateString();

    // 챌린지 문서 ID 고정 → 중복 참여 방지 (트랜잭션 격리 보장)
    const challengeId = `${userId}_${dateStr}`;
    const challengeRef = db.collection('challenges').doc(challengeId);

    await db.runTransaction(async (tx) => {
      // 중복 참여 확인 (tx.get으로 트랜잭션 격리)
      const existingDoc = await tx.get(challengeRef);
      if (existingDoc.exists) {
        throw new functions.HttpsError('already-exists', '오늘 이미 참여했습니다.');
      }

      const userRef = db.collection('users').doc(userId);
      const userDoc = await tx.get(userRef);

      if (!userDoc.exists) {
        throw new functions.HttpsError('not-found', '유저 정보를 찾을 수 없습니다.');
      }

      const userData = userDoc.data()!;
      const isFreePlay = userData.freeTrialDaysLeft > 0;

      // 무료 체험이 아닌 경우 잔액 확인
      if (!isFreePlay && userData.balance < amount) {
        throw new functions.HttpsError(
          'failed-precondition',
          '잔액이 부족합니다. 충전 후 다시 시도해주세요.',
        );
      }

      // 잔액 차감
      if (isFreePlay) {
        tx.update(userRef, {
          freeTrialDaysLeft: admin.firestore.FieldValue.increment(-1),
          lastActiveAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      } else {
        tx.update(userRef, {
          balance: admin.firestore.FieldValue.increment(-amount),
          lastActiveAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      // 챌린지 문서 생성
      tx.set(challengeRef, {
        userId,
        date: dateStr,
        amount: isFreePlay ? 0 : amount,
        startTime: admin.firestore.FieldValue.serverTimestamp(),
        status: 'active',
        failReason: null,
        gracesUsed: 0,
        settledAt: null,
        earnings: null,
        isFreePlay,
      });

      // dailyPool 업데이트
      const poolRef = db.collection('dailyPool').doc(dateStr);
      const poolDoc = await tx.get(poolRef);
      const isFriday = getKSTDay() === 5;

      if (poolDoc.exists) {
        tx.update(poolRef, {
          totalParticipants: admin.firestore.FieldValue.increment(1),
          totalPool: admin.firestore.FieldValue.increment(isFreePlay ? 0 : amount),
          survivors: admin.firestore.FieldValue.increment(1),
        });
      } else {
        tx.set(poolRef, {
          totalParticipants: 1,
          totalPool: isFreePlay ? 0 : amount,
          survivors: 1,
          failures: 0,
          settled: false,
          isFriday,
          feeRate: isFriday ? 0 : 0.2,
        });
      }
    });

    return { challengeId };
  });
