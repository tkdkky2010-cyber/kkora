import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { checkRateLimit } from '../utils/security';

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const rtdb = admin.database();

const VALID_TYPES = ['challenge_result', 'payment', 'refund', 'other'];

interface SubmitDisputeData {
  challengeId: string | null;
  type: string;
  reason: string;
  evidence?: string[];
}

/**
 * 이의 제기 제출 — Cloud Function
 * 사용자가 분쟁 제기 → disputes 문서 생성
 * onCreate 트리거가 자동 판정을 시도한다.
 */
export const submitDispute = functions
  .region('asia-northeast3')
  .https.onCall(async (data: SubmitDisputeData, context) => {
    if (!context.auth) {
      throw new functions.HttpsError('unauthenticated', '로그인이 필요합니다.');
    }

    const userId = context.auth.uid;
    const { challengeId, type, reason, evidence } = data;

    // Rate limit: 30초당 1회
    const allowed = await checkRateLimit(db, userId, 'submitDispute', 30000);
    if (!allowed) {
      throw new functions.HttpsError('resource-exhausted', '요청이 너무 빠릅니다.');
    }

    if (!VALID_TYPES.includes(type)) {
      throw new functions.HttpsError('invalid-argument', '유효하지 않은 분쟁 유형입니다.');
    }
    if (!reason || typeof reason !== 'string' || reason.trim().length < 5) {
      throw new functions.HttpsError('invalid-argument', '사유는 5자 이상 입력해주세요.');
    }
    if (reason.length > 2000) {
      throw new functions.HttpsError('invalid-argument', '사유는 2000자 이하로 입력해주세요.');
    }

    // 챌린지 분쟁의 경우 소유 확인
    if (challengeId) {
      const doc = await db.collection('challenges').doc(challengeId).get();
      if (!doc.exists) {
        throw new functions.HttpsError('not-found', '챌린지를 찾을 수 없습니다.');
      }
      if (doc.data()?.userId !== userId) {
        throw new functions.HttpsError('permission-denied', '권한이 없습니다.');
      }
    }

    // 중복 방지: 같은 챌린지에 open/reviewing 상태의 분쟁이 있으면 거부
    if (challengeId) {
      const existing = await db
        .collection('disputes')
        .where('userId', '==', userId)
        .where('challengeId', '==', challengeId)
        .where('status', 'in', ['open', 'reviewing'])
        .limit(1)
        .get();
      if (!existing.empty) {
        throw new functions.HttpsError('already-exists', '이미 검토 중인 이의 제기가 있습니다.');
      }
    }

    const docRef = db.collection('disputes').doc();
    await docRef.set({
      userId,
      challengeId: challengeId || null,
      type,
      reason: reason.trim(),
      evidence: Array.isArray(evidence) ? evidence.slice(0, 5) : [],
      status: 'open',
      autoJudgement: null,
      resolution: null,
      refundAmount: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      respondedAt: null,
      assignedTo: null,
    });

    return { disputeId: docRef.id };
  });

/**
 * 자동 판정 — Firestore onCreate 트리거
 * 분쟁 생성 직후 heartbeat + graceLog를 대조하여 자동 판정 시도.
 * 명백한 근거가 있으면 즉시 해결, 애매하면 reviewing 상태로 수동 검토 큐에 넣는다.
 */
export const autoJudgeDispute = functions
  .region('asia-northeast3')
  .firestore.document('disputes/{disputeId}')
  .onCreate(async (snap, context) => {
    const dispute = snap.data();
    const disputeId = context.params.disputeId;

    // 챌린지 결과 분쟁만 자동 판정 (나머지는 무조건 수동 검토)
    if (dispute.type !== 'challenge_result' || !dispute.challengeId) {
      await snap.ref.update({ status: 'reviewing' });
      return;
    }

    const challengeDoc = await db.collection('challenges').doc(dispute.challengeId).get();
    if (!challengeDoc.exists) {
      await snap.ref.update({
        status: 'resolved_reject',
        autoJudgement: { reason: 'challenge_not_found' },
        resolution: '챌린지 정보를 찾을 수 없습니다.',
        respondedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      return;
    }

    const challenge = challengeDoc.data()!;

    // 자동 판정 근거 수집
    const [heartbeatSnap, graceLogsSnap] = await Promise.all([
      rtdb.ref(`heartbeats/${dispute.challengeId}`).once('value'),
      db.collection('graceLogs').where('challengeId', '==', dispute.challengeId).get(),
    ]);

    const heartbeat = heartbeatSnap.val();
    const graceLogs = graceLogsSnap.docs.map((d) => d.data());

    const evidence = {
      failReason: challenge.failReason,
      pingCount: heartbeat?.pingCount ?? 0,
      lastPingAt: heartbeat?.lastPingAt ?? null,
      gracesUsed: challenge.gracesUsed || 0,
      graceLogCount: graceLogs.length,
    };

    // 자동 환불 트리거: heartbeat_lost + pingCount가 정상 (90% 이상 예상치)
    // 챌린지 시작~종료 예상 ping 수: 7시간 × 120회 = 840. 10% 이상 빠지면 네트워크 불안정 의심.
    const EXPECTED_PINGS_PER_HOUR = 120;
    const challengeDurationMs = challenge.startTime
      ? Date.now() - challenge.startTime.toMillis()
      : 0;
    const expectedPings = Math.floor((challengeDurationMs / 3600000) * EXPECTED_PINGS_PER_HOUR);
    const pingRatio = expectedPings > 0 ? evidence.pingCount / expectedPings : 0;

    // 명백한 자동 환불 케이스
    if (
      challenge.failReason === 'heartbeat_lost' &&
      pingRatio >= 0.5 && pingRatio < 0.9
    ) {
      // 네트워크 불안정으로 추정 → 원금 환불
      const amount = challenge.amount || 0;
      if (amount > 0) {
        await db.runTransaction(async (tx) => {
          const userRef = db.collection('users').doc(dispute.userId);
          tx.update(userRef, {
            balance: admin.firestore.FieldValue.increment(amount),
          });

          // 감사 로그
          const txAudit = db.collection('transactions').doc();
          tx.set(txAudit, {
            userId: dispute.userId,
            type: 'adjustment',
            amount,
            relatedId: dispute.challengeId,
            status: 'success',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            reason: `dispute_auto_refund: ${disputeId}`,
          });
        });
      }

      await snap.ref.update({
        status: 'resolved_approve',
        autoJudgement: evidence,
        resolution: '네트워크 불안정으로 추정되어 원금이 자동 환불되었습니다.',
        refundAmount: amount,
        respondedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      return;
    }

    // 명백한 거절 케이스 — ping이 거의 없음 (의도적 이탈 추정)
    if (
      challenge.failReason === 'heartbeat_lost' &&
      pingRatio < 0.1 &&
      expectedPings > 10
    ) {
      await snap.ref.update({
        status: 'resolved_reject',
        autoJudgement: evidence,
        resolution: '챌린지 진행 중 앱이 지속적으로 꺼져있어 이의 제기가 거절되었습니다.',
        respondedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      return;
    }

    // 애매한 케이스 → 수동 검토
    await snap.ref.update({
      status: 'reviewing',
      autoJudgement: evidence,
    });
  });
