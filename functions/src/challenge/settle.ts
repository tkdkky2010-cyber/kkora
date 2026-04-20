import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { getKSTYesterdayString } from '../utils/time';

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// 레벨 기준 (클라이언트 src/constants/levels.ts와 반드시 동기화)
const LEVEL_THRESHOLDS = [
  { requiredDays: 0, name: '잠알' },
  { requiredDays: 3, name: '꿈틀알' },
  { requiredDays: 7, name: '부화' },
  { requiredDays: 14, name: '병아리' },
  { requiredDays: 30, name: '유니콘' },
  { requiredDays: 60, name: '아기용' },
  { requiredDays: 100, name: '불사조' },
];

function getLevelByStreak(streak: number): string {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (streak >= LEVEL_THRESHOLDS[i].requiredDays) {
      return LEVEL_THRESHOLDS[i].name;
    }
  }
  return LEVEL_THRESHOLDS[0].name;
}

// 신규 유저 초기 레벨명 (users create 시 firestore.rules와 일치해야 함)
const INITIAL_LEVEL_NAME = LEVEL_THRESHOLDS[0].name;

/**
 * 아침 7시 정산 — Scheduled Cloud Function (KST)
 * 순서: 쿼리 먼저 → 처리 → settled 플래그 맨 마지막
 */
export const settleChallenge = functions
  .region('asia-northeast3')
  .pubsub.schedule('0 7 * * *')
  .timeZone('Asia/Seoul')
  .onRun(async () => {
    const dateStr = getKSTYesterdayString();
    const poolRef = db.collection('dailyPool').doc(dateStr);

    // 1. settled 여부 확인 (아직 설정하지 않음)
    const poolDoc = await poolRef.get();
    if (!poolDoc.exists || poolDoc.data()?.settled) {
      return;
    }

    const pool = poolDoc.data()!;
    const feeRate = pool.feeRate ?? 0.2;

    // 2. 쿼리 먼저 실행 (settled 플래그 설정 전)
    const activeQuery = await db
      .collection('challenges')
      .where('date', '==', dateStr)
      .where('status', '==', 'active')
      .get();

    const failedQuery = await db
      .collection('challenges')
      .where('date', '==', dateStr)
      .where('status', '==', 'failed')
      .get();

    // 크래시/배터리 방전 면제 처리 (첫 1회, 원금만 환급, 상금 없음)
    // Firestore Transaction으로 atomicity 보장
    let failedPool = 0;
    const exemptDocIds: string[] = [];

    for (const failDoc of failedQuery.docs) {
      const data = failDoc.data();
      const amount = data.amount || 0;

      if (data.failReason === 'battery_dead' || data.failReason === 'crash') {
        const prevExempt = await db
          .collection('challenges')
          .where('userId', '==', data.userId)
          .where('crashExempt', '==', true)
          .limit(1)
          .get();

        if (prevExempt.empty) {
          exemptDocIds.push(failDoc.id);
          continue; // failedPool에서 제외
        }
      }

      failedPool += amount;
    }

    // 면제 대상 트랜잭션 처리
    if (exemptDocIds.length > 0) {
      await db.runTransaction(async (tx) => {
        for (const docId of exemptDocIds) {
          const ref = db.collection('challenges').doc(docId);
          const snap = await tx.get(ref);
          if (!snap.exists) continue;
          const data = snap.data()!;

          tx.update(ref, { crashExempt: true, earnings: 0 });

          const userRef = db.collection('users').doc(data.userId);
          tx.update(userRef, {
            balance: admin.firestore.FieldValue.increment(data.amount || 0),
          });
        }
      });
    }

    const platformFee = Math.floor(failedPool * feeRate);

    // === 전원 실패 시 ===
    if (activeQuery.empty) {
      await poolRef.update({
        platformFee,
        prizePool: 0,
        settled: true, // 맨 마지막에 설정
      });
      return;
    }

    // === 성공자 있는 경우 ===
    const prizePool = Math.floor(failedPool * (1 - feeRate));

    let successTotalAmount = 0;
    const successDocs: admin.firestore.QueryDocumentSnapshot[] = [];
    activeQuery.forEach((doc) => {
      successTotalAmount += doc.data().amount || 0;
      successDocs.push(doc);
    });

    // 3. 249개씩 청크 처리 (Firestore 500 op 제한)
    // Firestore 트랜잭션 500 op 제한: 유저당 3 ops (challenge update + user get + user update)
    const CHUNK_SIZE = 166;
    for (let i = 0; i < successDocs.length; i += CHUNK_SIZE) {
      const chunk = successDocs.slice(i, i + CHUNK_SIZE);

      await db.runTransaction(async (tx) => {
        for (const challengeDoc of chunk) {
          const challenge = challengeDoc.data();
          const userAmount = challenge.amount || 0;

          // 비례 분배
          const earnings = successTotalAmount > 0
            ? Math.floor((userAmount / successTotalAmount) * prizePool)
            : 0;

          // 챌린지 성공 처리
          tx.update(challengeDoc.ref, {
            status: 'success',
            earnings,
            settledAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          // 유저 문서 업데이트
          const userRef = db.collection('users').doc(challenge.userId);
          const userDoc = await tx.get(userRef);

          if (userDoc.exists) {
            const userData = userDoc.data()!;
            const newStreak = (userData.streak || 0) + 1;
            const newMaxStreak = Math.max(newStreak, userData.maxStreak || 0);
            // 레벨: streak 기반으로 계산하되, 강등된 레벨보다 높으면 복구
            // CLAUDE.md: "복귀해서 다시 해당 일수 채우면 레벨 복구"
            const streakLevel = getLevelByStreak(newStreak);
            const currentLevel = userData.level || INITIAL_LEVEL_NAME;
            const streakIdx = LEVEL_THRESHOLDS.findIndex((l) => l.name === streakLevel);
            const currentIdx = LEVEL_THRESHOLDS.findIndex((l) => l.name === currentLevel);
            // streak으로 달성 가능한 레벨이 현재보다 높으면 승급, 아니면 유지
            const newLevel = streakIdx >= currentIdx ? streakLevel : currentLevel;

            tx.update(userRef, {
              balance: admin.firestore.FieldValue.increment(userAmount + earnings),
              totalEarnings: admin.firestore.FieldValue.increment(earnings),
              streak: newStreak,
              maxStreak: newMaxStreak,
              level: newLevel,
            });
          }
        }
      });
    }

    // 4. 모든 처리 완료 후 settled 플래그 설정 (맨 마지막)
    await poolRef.update({
      platformFee,
      prizePool,
      settled: true,
    });
  });
