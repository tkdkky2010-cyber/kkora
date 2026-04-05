import { Timestamp } from './user';

export type ChallengeStatus = 'active' | 'success' | 'failed';

export interface Challenge {
  userId: string;
  date: string; // YYYY-MM-DD
  amount: number;
  startTime: Timestamp;
  status: ChallengeStatus;
  failReason: string | null;
  gracesUsed: number; // 0~3
  settledAt: Timestamp | null;
  earnings: number | null;
  isFreePlay: boolean;
}

export interface DailyPool {
  totalParticipants: number;
  totalPool: number;
  survivors: number;
  failures: number;
  settled: boolean;
  isFriday: boolean;
  feeRate: number; // 0 or 0.2
}

export interface GraceLog {
  challengeId: string;
  userId: string;
  exitTime: Timestamp;
  returnTime: Timestamp | null;
  duration: number; // seconds
  result: 'returned' | 'failed';
}
