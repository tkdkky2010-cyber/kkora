export const AppConfig = {
  // 챌린지 시간 (24시간 기준)
  challenge: {
    startHour: 22,       // 밤 10시
    endHour: 24,         // 자정 12시
    durationHours: 7,    // 7시간 수면
    settlementHour: 7,   // 아침 7시 정산
  },

  // 유예 (grace)
  grace: {
    maxCount: 3,         // 최대 3회
    durationSeconds: 60, // 1분(60초) 유예
  },

  // 참여 금액 (원)
  amounts: [1000, 5000, 10000] as const,
  maxAmount: 10000,

  // 수수료
  fee: {
    normalRate: 0.2,     // 미환급액의 20%
    fridayRate: 0,       // 금요일 밤의 대학살: 0%
  },

  // 무료 체험
  freeTrial: {
    days: 3,
  },

  // 출금
  withdrawal: {
    minAmount: 3000,     // 최소 출금액
  },

  // 알림
  notification: {
    reminderHour: 21,
    reminderMinute: 30,  // 밤 9:30 리마인더
    resultHour: 7,       // 아침 7시 결과
  },

  // 시간 허용 오차
  timeDriftMaxMinutes: 5,
} as const;
