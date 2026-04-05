import * as admin from 'firebase-admin';

/**
 * Rate Limiting (Firestore Transaction 기반)
 * 동시 요청에도 안전하게 동작.
 */
export async function checkRateLimit(
  db: FirebaseFirestore.Firestore,
  userId: string,
  action: string,
  minIntervalMs: number = 2000,
): Promise<boolean> {
  const ref = db.collection('_rateLimits').doc(`${userId}_${action}`);

  return db.runTransaction(async (tx) => {
    const doc = await tx.get(ref);
    const now = Date.now();

    if (doc.exists) {
      const lastCall = doc.data()?.lastCallMs || 0;
      if (now - lastCall < minIntervalMs) {
        return false; // 너무 빠름
      }
    }

    tx.set(ref, {
      lastCallMs: now,
      userId,
      action,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return true;
  });
}
