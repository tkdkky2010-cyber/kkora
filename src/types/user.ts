import { Timestamp } from 'firebase/firestore';

export interface UserProfile {
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
  playerNumber?: number;
}
