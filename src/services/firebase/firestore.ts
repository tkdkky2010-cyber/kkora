import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';
import { getServerTodayString } from '../../utils/serverTime';
import type { UserProfile } from '../../types/user';

// dailyPool 실시간 구독 (dateOverride로 특정 날짜 구독 가능)
export function subscribeDailyPool(
  onData: (data: { totalParticipants: number; totalPool: number; survivors: number }) => void,
  onError?: (error: Error) => void,
  dateOverride?: string,
) {
  const dateStr = dateOverride || getServerTodayString();
  const docRef = doc(db, 'dailyPool', dateStr);

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
export async function getUserDoc(userId: string): Promise<UserProfile | null> {
  const docRef = doc(db, 'users', userId);
  const snapshot = await getDoc(docRef);
  return snapshot.exists() ? (snapshot.data() as UserProfile) : null;
}

// 유저 문서 생성 (최초 가입 시)
export async function createUserDoc(userId: string, data: {
  displayName: string;
  kakaoId: string;
  deviceId: string;
}) {
  const docRef = doc(db, 'users', userId);
  const playerNumber = Math.floor(Math.random() * 100000) + 1;
  await setDoc(docRef, {
    ...data,
    balance: 0,
    freeTrialDaysLeft: 3,
    streak: 0,
    maxStreak: 0,
    level: '잠알',
    totalEarnings: 0,
    playerNumber,
    createdAt: serverTimestamp(),
    lastActiveAt: serverTimestamp(),
  });
}

// 서버 시간 가져오기 (Firestore 서버 타임스탬프 기반)
export function getServerTimestamp() {
  return serverTimestamp();
}
