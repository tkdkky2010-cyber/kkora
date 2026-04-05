import { View, StyleSheet } from 'react-native';
import { Text } from '../atoms/Text';
import { Card } from '../atoms/Card';
import { Badge } from '../atoms/Badge';
import { TimerDisplay } from '../molecules/TimerDisplay';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { AppConfig } from '../../constants/config';

interface ChallengePanelProps {
  hours: number;
  minutes: number;
  seconds: number;
  gracesUsed: number;
  totalPool: number;
}

export function ChallengePanel({
  hours,
  minutes,
  seconds,
  gracesUsed,
  totalPool,
}: ChallengePanelProps) {
  const remainingGraces = Math.max(0, AppConfig.grace.maxCount - gracesUsed);

  return (
    <View>
      {/* 상단 상태 */}
      <View style={styles.header}>
        <Badge label="챌린지 진행 중" color={Colors.green} />
      </View>

      {/* 메인 타이머 */}
      <View style={styles.timerSection}>
        <TimerDisplay
          hours={hours}
          minutes={minutes}
          seconds={seconds}
          label="남은 시간"
          color={Colors.green}
        />
      </View>

      {/* 남은 기회 */}
      <Card>
        <Text variant="caption" color={Colors.textSub} style={{ marginBottom: Spacing.elementGap }}>
          남은 이탈 기회
        </Text>
        <View style={styles.graceDots}>
          {Array.from({ length: AppConfig.grace.maxCount }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.graceDot,
                i < remainingGraces ? styles.graceDotActive : styles.graceDotUsed,
              ]}
            />
          ))}
        </View>
        <Text variant="caption" color={Colors.textSub} style={{ marginTop: Spacing.elementGap }}>
          앱 이탈 시 {AppConfig.grace.durationSeconds}초 내 복귀 필요 · {remainingGraces}회 남음
        </Text>
      </Card>

      {/* 상금 풀 */}
      <Card style={{ marginTop: Spacing.cardGap }}>
        <View style={styles.poolRow}>
          <Text variant="caption" color={Colors.textSub}>오늘 밤 총 상금</Text>
          <Text variant="h2" color={Colors.gold}>
            {totalPool.toLocaleString()}원
          </Text>
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: Spacing.cardGap,
  },
  timerSection: {
    alignItems: 'center',
    marginBottom: Spacing.sectionGap,
  },
  graceDots: {
    flexDirection: 'row',
    gap: Spacing.elementGap,
  },
  graceDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  graceDotActive: {
    backgroundColor: Colors.green,
  },
  graceDotUsed: {
    backgroundColor: Colors.textDisabled,
  },
  poolRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
