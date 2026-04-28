import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

const FLAG_DOC = db.collection('systemFlags').doc('service');

interface KillSwitchRequest {
  enabled: boolean;
  reason: string;
  blockDeposit?: boolean;
  blockChallenge?: boolean;
  blockWithdrawal?: boolean;
}

/**
 * 서비스 kill switch — HTTPS Callable
 *
 * 긴급 사태 시 재배포 없이 Firestore 플래그만으로 주요 기능을 차단한다.
 * startChallenge, requestDeposit, requestWithdrawal 는 호출 초입에서
 * 이 플래그를 읽어 차단 여부를 판정해야 한다.
 *
 * 플래그 읽기 패턴 (각 함수 초입):
 *   const flag = await db.collection('systemFlags').doc('service').get();
 *   if (flag.exists && flag.data()?.blockChallenge) {
 *     throw new functions.HttpsError('unavailable', flag.data()!.reason);
 *   }
 *
 * 출금(requestWithdrawal)은 기본적으로 차단하지 않는다 — 유저 환불 출구 보존.
 */
export const setServiceKillSwitch = functions
  .region('asia-northeast3')
  .https.onCall(async (data: KillSwitchRequest, context) => {
    if (!context.auth) {
      throw new functions.HttpsError('unauthenticated', '인증 필요');
    }
    if (!context.auth.token.admin) {
      throw new functions.HttpsError('permission-denied', 'admin 권한 필요');
    }

    const { enabled, reason, blockDeposit, blockChallenge, blockWithdrawal } = data;

    if (typeof enabled !== 'boolean') {
      throw new functions.HttpsError('invalid-argument', 'enabled 필수');
    }
    if (!reason || typeof reason !== 'string' || reason.trim().length < 5) {
      throw new functions.HttpsError('invalid-argument', 'reason 5자 이상 필수');
    }

    const payload = {
      enabled,
      blockDeposit: blockDeposit ?? !enabled,
      blockChallenge: blockChallenge ?? !enabled,
      blockWithdrawal: blockWithdrawal ?? false,
      reason,
      updatedBy: context.auth.uid,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await FLAG_DOC.set(payload, { merge: true });

    await db.collection('auditLogs').add({
      type: 'kill_switch',
      payload,
      executorUid: context.auth.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { ok: true, payload };
  });
