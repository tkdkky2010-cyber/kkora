import { Timestamp } from 'firebase/firestore';

export type TransactionType = 'deposit' | 'withdrawal' | 'challenge_debit' | 'challenge_refund' | 'prize' | 'refund_on_delete';

export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

export interface Transaction {
  userId: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  description: string;
  createdAt: Timestamp;
  completedAt: Timestamp | null;
  /** 카카오페이 TID (충전 시) */
  pgTid?: string;
  /** 출금 계좌 정보 */
  bankCode?: string;
  accountNumber?: string;
}

export interface BankInfo {
  code: string;
  name: string;
}

export const BANKS: BankInfo[] = [
  { code: '004', name: '국민은행' },
  { code: '088', name: '신한은행' },
  { code: '020', name: '우리은행' },
  { code: '081', name: '하나은행' },
  { code: '003', name: '기업은행' },
  { code: '011', name: '농협은행' },
  { code: '023', name: 'SC제일은행' },
  { code: '090', name: '카카오뱅크' },
  { code: '092', name: '토스뱅크' },
  { code: '089', name: '케이뱅크' },
];

export const CHARGE_AMOUNTS = [5000, 10000, 30000, 50000] as const;

export const MIN_WITHDRAWAL = 3000;
