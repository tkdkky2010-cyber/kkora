import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

const BATCH_SIZE = 400;
const MAX_USERS_PER_INVOCATION = 2000;

interface BulkRefundRequest {
  dryRun: boolean;
  reason: string;
  incidentId: string;
  cursorUserId?: string;
}

interface BulkRefundSummary {
  scannedUsers: number;
  eligibleUsers: number;
  totalRefundAmount: number;
  skippedNegativeBalance: string[];
  skippedActiveChallenge: string[];
  processedUserIds: string[];
  nextCursorUserId: string | null;
  dryRun: boolean;
  incidentId: string;
  auditLogId: string | null;
}

/**
 * 긴급 대량 환불 — HTTPS Callable
 *
 * 앱스토어 제거, 서비스 종료 등 긴급 사태 시 전체 유저 예치금을
 * 일괄 환불 처리한다.
 *
 * 보안:
 *  - admin custom claim 보유자만 호출 가능
 *  - dryRun 모드 필수 선행 (실제 집행 전 검증)
 *  - 한 번에 최대 2000명, 배치 400명씩 트랜잭션
 *  - 모든 실행은 auditLogs/ 에 기록
 *
 * 주의:
 *  - PG(카카오페이) 실제 이체는 이 함수 외부에서 별도 처리
 *  - 이 함수는 Firestore balance 차감 + transaction 레코드 생성까지만
 *  - 실제 이체 실패 시 adjustment 트랜잭션으로 롤백 필요
 */
export const bulkRefund = functions
  .region('asia-northeast3')
  .runWith({ timeoutSeconds: 540, memory: '1GB' })
  .https.onCall(async (data: BulkRefundRequest, context) => {
    if (!context.auth) {
      throw new functions.HttpsError('unauthenticated', '인증 필요');
    }
    if (!context.auth.token.admin) {
      throw new functions.HttpsError('permission-denied', 'admin 권한 필요');
    }

    const { dryRun, reason, incidentId, cursorUserId } = data;

    if (typeof dryRun !== 'boolean') {
      throw new functions.HttpsError('invalid-argument', 'dryRun 필수');
    }
    if (!reason || typeof reason !== 'string' || reason.trim().length < 10) {
      throw new functions.HttpsError('invalid-argument', 'reason 10자 이상 필수');
    }
    if (!incidentId || typeof incidentId !== 'string') {
      throw new functions.HttpsError('invalid-argument', 'incidentId 필수');
    }

    const summary: BulkRefundSummary = {
      scannedUsers: 0,
      eligibleUsers: 0,
      totalRefundAmount: 0,
      skippedNegativeBalance: [],
      skippedActiveChallenge: [],
      processedUserIds: [],
      nextCursorUserId: null,
      dryRun,
      incidentId,
      auditLogId: null,
    };

    let query = db.collection('users').orderBy(admin.firestore.FieldPath.documentId()).limit(BATCH_SIZE);
    if (cursorUserId) {
      query = query.startAfter(cursorUserId);
    }

    let totalProcessed = 0;
    let lastUserId: string | null = null;

    while (totalProcessed < MAX_USERS_PER_INVOCATION) {
      const snapshot = await query.get();
      if (snapshot.empty) break;

      for (const userDoc of snapshot.docs) {
        summary.scannedUsers++;
        lastUserId = userDoc.id;
        const balance = userDoc.data().balance || 0;

        if (balance <= 0) {
          if (balance < 0) summary.skippedNegativeBalance.push(userDoc.id);
          continue;
        }

        const activeChallenge = await db
          .collection('challenges')
          .where('userId', '==', userDoc.id)
          .where('status', '==', 'active')
          .limit(1)
          .get();

        if (!activeChallenge.empty) {
          summary.skippedActiveChallenge.push(userDoc.id);
          continue;
        }

        summary.eligibleUsers++;
        summary.totalRefundAmount += balance;

        if (!dryRun) {
          try {
            await db.runTransaction(async (tx) => {
              const freshUserDoc = await tx.get(userDoc.ref);
              if (!freshUserDoc.exists) return;
              const freshBalance = freshUserDoc.data()!.balance || 0;
              if (freshBalance <= 0) return;

              tx.update(userDoc.ref, {
                balance: 0,
                emergencyRefundedAt: admin.firestore.FieldValue.serverTimestamp(),
                emergencyRefundIncidentId: incidentId,
              });

              const txRef = db.collection('transactions').doc();
              tx.set(txRef, {
                userId: userDoc.id,
                type: 'adjustment',
                amount: -freshBalance,
                balanceBefore: freshBalance,
                balanceAfter: 0,
                relatedId: incidentId,
                status: 'success',
                pgResponse: null,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                reason: `긴급 환불: ${reason}`,
              });
            });

            summary.processedUserIds.push(userDoc.id);
          } catch (err) {
            functions.logger.error('bulkRefund user failed', {
              userId: userDoc.id,
              incidentId,
              error: err instanceof Error ? err.message : String(err),
            });
            await db.collection('refundFailures').add({
              userId: userDoc.id,
              incidentId,
              balance,
              error: err instanceof Error ? err.message : String(err),
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });
          }
        }

        totalProcessed++;
        if (totalProcessed >= MAX_USERS_PER_INVOCATION) break;
      }

      if (snapshot.size < BATCH_SIZE) break;
      query = db
        .collection('users')
        .orderBy(admin.firestore.FieldPath.documentId())
        .startAfter(lastUserId)
        .limit(BATCH_SIZE);
    }

    summary.nextCursorUserId = totalProcessed >= MAX_USERS_PER_INVOCATION ? lastUserId : null;

    const auditRef = db.collection('auditLogs').doc();
    await auditRef.set({
      type: 'bulk_refund',
      incidentId,
      reason,
      dryRun,
      executorUid: context.auth.uid,
      summary: {
        scannedUsers: summary.scannedUsers,
        eligibleUsers: summary.eligibleUsers,
        totalRefundAmount: summary.totalRefundAmount,
        skippedNegativeBalance: summary.skippedNegativeBalance.length,
        skippedActiveChallenge: summary.skippedActiveChallenge.length,
        processedCount: summary.processedUserIds.length,
      },
      processedUserIds: summary.processedUserIds,
      skippedNegativeBalance: summary.skippedNegativeBalance,
      skippedActiveChallenge: summary.skippedActiveChallenge,
      nextCursorUserId: summary.nextCursorUserId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    summary.auditLogId = auditRef.id;

    return summary;
  });
