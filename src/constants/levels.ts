import type { ImageSourcePropType } from 'react-native';

export type LevelTheme = 'v1' | 'v2';

export interface SleepLevel {
  name: string;
  requiredDays: number;
  description: string;
  color: string;
  images: Record<LevelTheme, ImageSourcePropType>;
}

export const SLEEP_LEVELS: SleepLevel[] = [
  {
    name: '잠알',
    requiredDays: 0,
    description: '아직 깨어나지 못한 알',
    color: '#6b6b7b',
    images: {
      v1: require('../assets/images/levels/v1/level-0-sleepy-egg.png'),
      v2: require('../assets/images/levels/v2/level-0-sleepy-egg.png'),
    },
  },
  {
    name: '꿈틀알',
    requiredDays: 3,
    description: '생존의 기미',
    color: '#3ddc84',
    images: {
      v1: require('../assets/images/levels/v1/level-3-wiggle-egg.png'),
      v2: require('../assets/images/levels/v2/level-3-wiggle-egg.png'),
    },
  },
  {
    name: '부화',
    requiredDays: 7,
    description: '알을 깨고 나왔다',
    color: '#4a9eff',
    images: {
      v1: require('../assets/images/levels/v1/level-7-hatch.png'),
      v2: require('../assets/images/levels/v2/level-7-hatch.png'),
    },
  },
  {
    name: '병아리',
    requiredDays: 14,
    description: '삐약',
    color: '#f0b429',
    images: {
      v1: require('../assets/images/levels/v1/level-14-chick.png'),
      v2: require('../assets/images/levels/v2/level-14-chick.png'),
    },
  },
  {
    name: '유니콘',
    requiredDays: 30,
    description: '전설 속의 존재',
    color: '#a78bfa',
    images: {
      v1: require('../assets/images/levels/v1/level-30-unicorn.png'),
      v2: require('../assets/images/levels/v2/level-30-unicorn.png'),
    },
  },
  {
    name: '아기용',
    requiredDays: 60,
    description: '불을 품은 존재',
    color: '#60e1f0',
    images: {
      v1: require('../assets/images/levels/v1/level-60-dragon.png'),
      v2: require('../assets/images/levels/v2/level-60-dragon.png'),
    },
  },
  {
    name: '불사조',
    requiredDays: 100,
    description: '재탄생의 상징',
    color: '#ffd700',
    images: {
      v1: require('../assets/images/levels/v1/level-100-phoenix.png'),
      v2: require('../assets/images/levels/v2/level-100-phoenix.png'),
    },
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

/**
 * 다음 레벨까지 남은 일수
 */
export function getDaysToNextLevel(streak: number): number | null {
  const currentLevel = getLevelByStreak(streak);
  const currentIdx = getLevelIndex(currentLevel);
  if (currentIdx === SLEEP_LEVELS.length - 1) return null; // 최고 레벨
  return SLEEP_LEVELS[currentIdx + 1].requiredDays - streak;
}
