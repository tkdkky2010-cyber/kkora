import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { checkRateLimit } from '../utils/security';

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const rtdb = admin.database();

const HEARTBEAT_TIMEOUT_SECONDS = 120;

/**
 * Heartbeat 수신 — Cloud Function
 * - 클라이언트가 30초 주기로 호출
 * - RTDB에 lastPingAt 갱신 (Firestore 쓰기 비용 절감)
 * - 유효성 검증: 챌린지 존재 + active + 본인 소유
 */
export const pingChallenge = functions
  .region('asia-northeast3')
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.HttpsError('unauthenticated', '로그인이 필요합니다.');
    }

    const userId = context.auth.uid;
    const { challengeId, appState, batteryLevel } = data;

    // 1회/10초 제한 (클라는 30초 주기라 충분)
    const allowed = await checkRateLimit(db, userId, `ping_${challengeId}`, 10000);
    if (!allowed) {
      return { ok: true, throttled: true };
    }

    if (!challengeId || typeof challengeId !== 'string') {
      throw new functions.HttpsError('invalid-argument', '챌린지 ID가 필요합니다.');
    }

    // 챌린지 존재/권한/상태 검증
    const challengeDoc = await db.collection('challenges').doc(challengeId).get();
    if (!challengeDoc.exists) {
      throw new functions.HttpsError('not-found', '챌린지를 찾을 수 없습니다.');
    }
    const challenge = challengeDoc.data()!;
    if (challenge.userId !== userId) {
      throw new functions.HttpsError('permission-denied', '권한이 없습니다.');
    }
    if (challenge.status !== 'active') {
      return { ok: false, reason: 'not_active' };
    }

    // RTDB 업데이트 (단일 경로, 덮어쓰기)
    const ref = rtdb.ref(`heartbeats/${challengeId}`);
    const snapshot = await ref.child('pingCount').once('value');
    const pingCount = (snapshot.val() || 0) + 1;

    await ref.update({
      userId,
      lastPingAt: admin.database.ServerValue.TIMESTAMP,
      appState: typeof appState === 'string' ? appState : 'active',
      batteryLevel: typeof batteryLevel === 'number' ? batteryLevel : null,
      pingCount,
    });

    return { ok: true, pingCount };
  });

/**
 * Heartbeat 타임아웃 감시 — Scheduled (1분 주기)
 * - 모든 active 챌린지 순회
 * - RTDB 마지막 ping이 120초 이상 지나면 challenges/{id} 실패 처리
 * - graceLogs에 heartbeat_lost 사유 기록
 */
export const heartbeatTimeoutWatcher = functions
  .region('asia-northeast3')
  .pubsub.schedule('every 1 minutes')
  .timeZone('Asia/Seoul')
  .onRun(async () => {
    const now = Date.now();
    const cutoff = now - HEARTBEAT_TIMEOUT_SECONDS * 1000;

    // 현재 KST 시각이 22:00~07:59 사이에만 실행 (챌린지 시간대)
    const kstNow = new Date(now + 9 * 60 * 60 * 1000);
    const kstHour = kstNow.getUTCHours();
    if (kstHour >= 8 && kstHour < 22) {
      return;
    }

    // active 챌린지 전수 조회
    const activeQuery = await db
      .collection('challenges')
      .where('status', '==', 'active')
      .get();

    if (activeQuery.empty) return;

    // 청크 처리 (Firestore 트랜잭션 500 op)
    // 챌린지당 ops: 1 (challenge update) + 1 (pool update) + 1 (user update) + 1 (graceLog set) = 4
    // 안전하게 챌린지당 125개씩
    const docs = activeQuery.docs;
    const CHUNK_SIZE = 100;

    for (let i = 0; i < docs.length; i += CHUNK_SIZE) {
      const chunk = docs.slice(i, i + CHUNK_SIZE);

      // RTDB 병렬 조회
      const heartbeats = await Promise.all(
        chunk.map(async (doc) => {
          const snap = await rtdb.ref(`heartbeats/${doc.id}/lastPingAt`).once('value');
          return { challengeDoc: doc, lastPingAt: snap.val() as number | null };
        }),
      );

      // 타임아웃된 챌린지 추출
      const timedOut = heartbeats.filter(({ lastPingAt }) => {
        // ping이 없는 경우는 시작 직후일 수 있어 건드리지 않음 (startTime + 180초 유예는 추후 추가)
        if (lastPingAt === null) return false;
        return lastPingAt < cutoff;
      });

      if (timedOut.length === 0) continue;

      // 배치 처리
      await db.runTransaction(async (tx) => {
        for (const { challengeDoc } of timedOut) {
          const data = challengeDoc.data();

          // 최신 상태 재확인 (race condition 방지)
          const fresh = await tx.get(challengeDoc.ref);
          if (!fresh.exists || fresh.data()?.status !== 'active') continue;

          tx.update(challengeDoc.ref, {
            status: 'failed',
            failReason: 'heartbeat_lost',
          });

          // dailyPool 차감
          const poolRef = db.collection('dailyPool').doc(data.date);
          tx.update(poolRef, {
            survivors: admin.firestore.FieldValue.increment(-1),
            failures: admin.firestore.FieldValue.increment(1),
          });

          // streak 리셋
          const userRef = db.collection('users').doc(data.userId);
          tx.update(userRef, { streak: 0 });

          // graceLog 기록 (분쟁 증거)
          const graceRef = db.collection('graceLogs').doc();
          tx.set(graceRef, {
            challengeId: challengeDoc.id,
            userId: data.userId,
            exitTime: admin.firestore.FieldValue.serverTimestamp(),
            returnTime: null,
            duration: HEARTBEAT_TIMEOUT_SECONDS,
            result: 'failed',
            reason: 'heartbeat_lost',
          });
        }
      });
    }
  });
