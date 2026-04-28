export const AppConfig = {
  // 챌린지 시간 (24시간 기준)
  challenge: {
    startHour: 22,       // 밤 10시
    endHour: 0,          // 자정 12시 (다음날 0시)
    durationHours: 7,    // 7시간 수면
    settlementHour: 7,   // 아침 7시 정산
  },

  // 유예 (grace)
  grace: {
    maxCount: 3,         // 최대 3회
    durationSeconds: 60, // 1분(60초) 유예
  },

  // 참여 금액 (원) — 2026-04-27 변경: 1,000원 제거, 3,000원 신설
  amounts: [3000, 5000, 10000] as const,
  maxAmount: 10000,

  // 수수료 (수치 미결 — PG 미팅 후 확정. 검토안: 30% OR 챌린저스 룰)
  fee: {
    normalRate: 0.2,     // 미환급액 20% (변경 검토 중)
    fridayRate: 0,       // ⚠️ 폐지 검토 중 (PG 충전 수수료 적자 위험)
  },

  // 무료 체험
  freeTrial: {
    days: 3,
  },

  // 출금 — 2026-04-27 변경
  withdrawal: {
    minAmount: 5000,     // 최소 출금액 (3,000 → 5,000)
    freeMonthlyCount: 1, // 월 1회 무료
    feePerExtra: 500,    // 추가 출금 시 건당 500원
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
