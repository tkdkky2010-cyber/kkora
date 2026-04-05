import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';

// 오늘 날짜 문자열 (YYYY-MM-DD)
function getTodayString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

// dailyPool 실시간 구독
export function subscribeDailyPool(
  onData: (data: { totalParticipants: number; totalPool: number; survivors: number }) => void,
  onError?: (error: Error) => void,
) {
  const today = getTodayString();
  const docRef = doc(db, 'dailyPool', today);

  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        onData({
          totalParticipants: data.totalParticipants || 0,
          totalPool: data.totalPool || 0,
          survivors: data.survivors || 0,
        });
      } else {
        onData({ totalParticipants: 0, totalPool: 0, survivors: 0 });
      }
    },
    onError,
  );
}

// 유저 문서 가져오기
export async function getUserDoc(userId: string) {
  const docRef = doc(db, 'users', userId);
  const snapshot = await getDoc(docRef);
  return snapshot.exists() ? snapshot.data() : null;
}

// 유저 문서 생성 (최초 가입 시)
export async function createUserDoc(userId: string, data: {
  displayName: string;
  kakaoId: string;
  deviceId: string;
}) {
  const docRef = doc(db, 'users', userId);
  await setDoc(docRef, {
    ...data,
    balance: 0,
    freeTrialDaysLeft: 3,
    streak: 0,
    maxStreak: 0,
    level: '참가자',
    totalEarnings: 0,
    createdAt: serverTimestamp(),
    lastActiveAt: serverTimestamp(),
  });
}

// 서버 시간 가져오기 (Firestore 서버 타임스탬프 기반)
export function getServerTimestamp() {
  return serverTimestamp();
}
