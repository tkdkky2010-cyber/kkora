import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../services/firebase/config';

// 서버 시간과 로컬 시간의 오프셋 (ms)
let serverTimeOffset = 0;
let offsetInitialized = false;

/**
 * Firebase 서버 시간과 로컬 시간의 차이를 계산하여 캐시.
 * 앱 시작 시 1회 호출 권장.
 */
export async function syncServerTime(): Promise<void> {
  try {
    const auth = getAuth();
    const uid = auth.currentUser?.uid;
    if (!uid) return; // 미로그인 시 건너뜀

    const tempRef = doc(db, '_serverTime', uid);
    const localBefore = Date.now();

    await setDoc(tempRef, { timestamp: serverTimestamp() });
    const snapshot = await getDoc(tempRef);

    if (snapshot.exists()) {
      const serverTs = snapshot.data().timestamp;
      if (serverTs && serverTs.toMillis) {
        const serverMillis = serverTs.toMillis();
        const localAfter = Date.now();
        const localMid = (localBefore + localAfter) / 2;
        serverTimeOffset = serverMillis - localMid;
        offsetInitialized = true;
      }
    }
  } catch {
    // 오프라인이거나 권한 없으면 오프셋 0 유지 (로컬 시간 사용)
    serverTimeOffset = 0;
  }
}

/**
 * 서버 시간 기준 현재 Date 객체 반환.
 * syncServerTime()이 아직 안 됐으면 로컬 시간 반환.
 */
export function getServerNow(): Date {
  return new Date(Date.now() + serverTimeOffset);
}

/**
 * 서버 시간 기준 오늘 날짜 문자열 (YYYY-MM-DD)
 */
export function getServerTodayString(): string {
  const now = getServerNow();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * 서버 시간 동기화 여부
 */
export function isServerTimeSynced(): boolean {
  return offsetInitialized;
}

/**
 * 서버-로컬 시간 차이 (분). 부정행위 감지용.
 */
export function getTimeDriftMinutes(): number {
  return Math.abs(serverTimeOffset) / 60000;
}
