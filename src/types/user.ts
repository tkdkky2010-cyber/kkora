// Firebase Timestamp는 Firebase 연동 시 교체
export interface Timestamp {
  seconds: number;
  nanoseconds: number;
}

export interface User {
  displayName: string;
  kakaoId: string;
  deviceId: string;
  balance: number;
  freeTrialDaysLeft: number;
  streak: number;
  maxStreak: number;
  level: string;
  totalEarnings: number;
  createdAt: Timestamp;
  lastActiveAt: Timestamp;
}
