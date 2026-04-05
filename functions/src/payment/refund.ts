import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

/**
 * 탈퇴 시 잔액 전액 환불 — Cloud Function
 * user/delete.ts에서 호출.
 */
export async function refundBalance(userId: string): Promise<number> {
  let refundedAmount = 0;

  await db.runTransaction(async (tx) => {
    const userRef = db.collection('users').doc(userId);
    const userDoc = await tx.get(userRef);

    if (!userDoc.exists) return;

    const balance = userDoc.data()!.balance || 0;
    if (balance <= 0) return;

    refundedAmount = balance;

    // 잔액 0으로
    tx.update(userRef, { balance: 0 });

    // 환불 거래 내역
    const txRef = db.collection('transactions').doc();
    tx.set(txRef, {
      userId,
      type: 'refund_on_delete',
      amount: balance,
      status: 'completed',
      description: '탈퇴 환불',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      completedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // TODO: 오픈뱅킹 API로 실제 이체
  });

  return refundedAmount;
}
