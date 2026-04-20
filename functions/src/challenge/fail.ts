import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { getKSTNow } from '../utils/time';
import { checkRateLimit } from '../utils/security';

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// 레벨 강등용 (클라이언트 src/constants/levels.ts와 반드시 동기화)
const LEVEL_THRESHOLDS = [
  '잠알', '꿈틀알', '부화', '병아리', '유니콘', '아기용', '불사조',
];

function demoteLevel(currentLevel: string): string {
  const idx = LEVEL_THRESHOLDS.indexOf(currentLevel);
  if (idx <= 0) return LEVEL_THRESHOLDS[0];
  return LEVEL_THRESHOLDS[idx - 1];
}

function getWeekStartDate(): string {
  const now = getKSTNow();
  const day = now.getUTCDay();
  const diff = day === 0 ? 6 : day - 1;
  const monday = new Date(now.getTime() - diff * 24 * 60 * 60 * 1000);
  const y = monday.getUTCFullYear();
  const m = String(monday.getUTCMonth() + 1).padStart(2, '0');
  const d = String(monday.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

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

    // Rate limiting (3초 간격)
    const allowed = await checkRateLimit(db, userId, 'reportFailure', 3000);
    if (!allowed) {
      throw new functions.HttpsError('resource-exhausted', '요청이 너무 빠릅니다.');
    }

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

      // streak 리셋 + 주간 2회 실패 시 레벨 강등
      const userRef = db.collection('users').doc(userId);
      const userDoc = await tx.get(userRef);
      const userData = userDoc.exists ? userDoc.data()! : null;

      interface UserFailUpdate {
        streak: number;
        weeklyFailures?: number;
        weekStartDate?: string;
        level?: string;
      }
      const updateData: UserFailUpdate = { streak: 0 };

      if (userData) {
        // 주간 실패 카운트를 유저 문서에 직접 관리 (트랜잭션 안전)
        const currentWeekStart = getWeekStartDate();
        const userWeekStart = userData.weekStartDate || '';
        let weeklyFailures = userData.weeklyFailures || 0;

        if (userWeekStart !== currentWeekStart) {
          // 새 주 시작 → 카운터 리셋
          weeklyFailures = 1;
          updateData.weekStartDate = currentWeekStart;
        } else {
          weeklyFailures += 1;
        }
        updateData.weeklyFailures = weeklyFailures;

        // 같은 주 2회 이상 실패 → 1단계 강등
        if (weeklyFailures >= 2) {
          updateData.level = demoteLevel(userData.level || '잠알');
        }
      }

      tx.update(userRef, updateData);
    });

    return { success: true };
  });
