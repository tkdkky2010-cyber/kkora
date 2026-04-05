export type IconFamily = 'MaterialCommunityIcons' | 'Ionicons' | 'FontAwesome5';

export interface LevelIcon {
  family: IconFamily;
  name: string;
  color: string;
}

export interface SleepLevel {
  name: string;
  icon: LevelIcon;
  requiredDays: number;
  description: string;
}

export const SLEEP_LEVELS: SleepLevel[] = [
  {
    name: '참가자 ???번',
    icon: { family: 'MaterialCommunityIcons', name: 'account-outline', color: '#6b6b7b' },
    requiredDays: 0,
    description: '최대 6자리 번호 부여 (1~100,000)',
  },
  {
    name: '생존자',
    icon: { family: 'MaterialCommunityIcons', name: 'shield-check-outline', color: '#3ddc84' },
    requiredDays: 3,
    description: '번호 사라지고 생존자로 승격',
  },
  {
    name: '상위 50%',
    icon: { family: 'Ionicons', name: 'flame-outline', color: '#4a9eff' },
    requiredDays: 7,
    description: '번호 사라지고 등급 시작',
  },
  {
    name: '상위 20%',
    icon: { family: 'Ionicons', name: 'flame', color: '#a78bfa' },
    requiredDays: 14,
    description: '상위권 진입',
  },
  {
    name: '상위 5%',
    icon: { family: 'MaterialCommunityIcons', name: 'sword-cross', color: '#f0b429' },
    requiredDays: 30,
    description: '엘리트',
  },
  {
    name: '상위 1%',
    icon: { family: 'MaterialCommunityIcons', name: 'diamond-stone', color: '#60e1f0' },
    requiredDays: 60,
    description: '극소수',
  },
  {
    name: 'VIP',
    icon: { family: 'MaterialCommunityIcons', name: 'crown', color: '#ffd700' },
    requiredDays: 100,
    description: '번호도 %도 필요 없는 존재',
  },
  {
    name: '호스트',
    icon: { family: 'MaterialCommunityIcons', name: 'eye', color: '#e8e8ec' },
    requiredDays: 365,
    description: '게임의 주인',
  },
];

/**
 * 레벨 산출: 누적 최대 스트릭 기준
 * - 스트릭: 실패 시 즉시 0으로 리셋
 * - 레벨: 실패 1회 → 레벨 유지, 같은 주 2회 실패 → 1단계 강등
 * - 복귀해서 다시 해당 일수 채우면 레벨 복구
 */
export function getLevelByStreak(streak: number): SleepLevel {
  for (let i = SLEEP_LEVELS.length - 1; i >= 0; i--) {
    if (streak >= SLEEP_LEVELS[i].requiredDays) {
      return SLEEP_LEVELS[i];
    }
  }
  return SLEEP_LEVELS[0];
}

export function getLevelIndex(level: SleepLevel): number {
  return SLEEP_LEVELS.findIndex((l) => l.requiredDays === level.requiredDays);
}

/**
 * 강등 계산: 같은 주에 2회 이상 실패 시 1단계 강등
 */
export function getDemotedLevel(
  currentLevel: SleepLevel,
  weeklyFailures: number,
): SleepLevel {
  if (weeklyFailures < 2) return currentLevel;
  const idx = getLevelIndex(currentLevel);
  const demotedIdx = Math.max(0, idx - 1);
  return SLEEP_LEVELS[demotedIdx];
}
