import { useEffect, useState, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text } from '../components/atoms/Text';
import { Card } from '../components/atoms/Card';
import { Badge } from '../components/atoms/Badge';
import { TimerDisplay } from '../components/molecules/TimerDisplay';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { AppConfig } from '../constants/config';
import { RootStackParamList } from '../types/navigation';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Challenge'>;
type Route = RouteProp<RootStackParamList, 'Challenge'>;

// Mock — Firebase 연동 시 교체
const MOCK_POOL = {
  survivors: 1089,
  totalParticipants: 1247,
  totalPool: 3741000,
};

export default function ChallengeScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();

  // 7시간 카운트다운 (데모: 시작 시점부터 카운트)
  const [remainingSeconds, setRemainingSeconds] = useState(
    AppConfig.challenge.durationHours * 3600,
  );
  const [gracesUsed, setGracesUsed] = useState(0);
  const hasNavigated = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (remainingSeconds === 0 && !hasNavigated.current) {
      hasNavigated.current = true;
      navigation.navigate('Result', { challengeId: route.params.challengeId });
    }
  }, [remainingSeconds]);

  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;

  const survivalRate = Math.round(
    (MOCK_POOL.survivors / MOCK_POOL.totalParticipants) * 100,
  );

  const remainingGraces = AppConfig.grace.maxCount - gracesUsed;

  return (
    <SafeAreaView style={styles.container}>
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

      {/* 정보 카드들 */}
      <View style={styles.cardsSection}>
        {/* 생존자 카드 */}
        <Card style={{ marginBottom: Spacing.cardGap }}>
          <View style={styles.cardRow}>
            <View>
              <Text variant="caption" color={Colors.textSub}>생존자</Text>
              <Text variant="h2" style={{ marginTop: 4 }}>
                {MOCK_POOL.survivors.toLocaleString()}
                <Text variant="body" color={Colors.textSub}>
                  /{MOCK_POOL.totalParticipants.toLocaleString()}명
                </Text>
              </Text>
            </View>
            <View style={styles.rateContainer}>
              <Text variant="h2" color={Colors.green}>{survivalRate}%</Text>
              <Text variant="caption" color={Colors.textSub}>생존률</Text>
            </View>
          </View>

          {/* 생존 바 */}
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${survivalRate}%` },
              ]}
            />
          </View>
        </Card>

        {/* 남은 기회 */}
        <Card>
          <Text variant="caption" color={Colors.textSub} style={{ marginBottom: 8 }}>
            남은 이탈 기회
          </Text>
          <View style={styles.graceDots}>
            {Array.from({ length: AppConfig.grace.maxCount }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.graceDot,
                  i < remainingGraces
                    ? styles.graceDotActive
                    : styles.graceDotUsed,
                ]}
              />
            ))}
          </View>
          <Text variant="caption" color={Colors.textSub} style={{ marginTop: 8 }}>
            앱 이탈 시 {AppConfig.grace.durationSeconds}초 내 복귀 필요 ·
            {remainingGraces}회 남음
          </Text>
        </Card>

        {/* 상금 풀 */}
        <Card style={{ marginTop: Spacing.cardGap }}>
          <View style={styles.cardRow}>
            <Text variant="caption" color={Colors.textSub}>오늘 밤 총 상금</Text>
            <Text variant="h2" color={Colors.gold}>
              {MOCK_POOL.totalPool.toLocaleString()}원
            </Text>
          </View>
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
  },
  header: {
    alignItems: 'center',
    paddingTop: 16,
  },
  timerSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardsSection: {
    paddingHorizontal: Spacing.screenPadding,
    paddingBottom: Spacing.screenPaddingBottom,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rateContainer: {
    alignItems: 'flex-end',
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.bgElevated,
    borderRadius: 3,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.green,
    borderRadius: 3,
  },
  graceDots: {
    flexDirection: 'row',
    gap: 8,
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
});
