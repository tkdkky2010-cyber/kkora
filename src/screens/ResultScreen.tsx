import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text } from '../components/atoms/Text';
import { Button } from '../components/atoms/Button';
import { Card } from '../components/atoms/Card';
import { Badge } from '../components/atoms/Badge';
import { LevelIcon } from '../components/atoms/LevelIcon';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { getLevelByStreak } from '../constants/levels';
import { RootStackParamList } from '../types/navigation';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Result'>;

// Mock — Firebase 연동 시 교체
const MOCK_RESULT = {
  isSuccess: true,
  amount: 5000,
  earnings: 1410,
  survivors: 978,
  totalParticipants: 1247,
  sleepDuration: '7시간 12분',
  streak: 1,
  playerNumber: 247,
};

export default function ResultScreen() {
  const navigation = useNavigation<Nav>();
  const r = MOCK_RESULT;
  const level = getLevelByStreak(r.streak);
  const isNumberPhase = level.requiredDays === 0;
  const levelName = isNumberPhase
    ? level.name.replace('???', String(r.playerNumber))
    : level.name;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* 결과 헤더 */}
        <View style={styles.resultHeader}>
          <Text style={{ fontSize: 72, marginBottom: 16 }}>
            {r.isSuccess ? '🎉' : '💀'}
          </Text>
          <Text
            variant="h1"
            color={r.isSuccess ? Colors.green : Colors.red}
          >
            {r.isSuccess ? '챌린지 성공!' : '챌린지 실패'}
          </Text>
          <Text variant="body" color={Colors.textSub} style={{ marginTop: 8 }}>
            수면 시간: {r.sleepDuration}
          </Text>
        </View>

        {/* 수익 카드 */}
        <Card style={{ marginBottom: Spacing.cardGap }}>
          <Text variant="caption" color={Colors.textSub} style={{ marginBottom: 4 }}>
            {r.isSuccess ? '오늘의 수익' : '잃은 금액'}
          </Text>
          <Text
            variant="largeNumber"
            color={r.isSuccess ? Colors.green : Colors.red}
          >
            {r.isSuccess ? '+' : '-'}
            {(r.isSuccess ? r.earnings : r.amount).toLocaleString()}원
          </Text>
          {r.isSuccess && (
            <View style={styles.earningsDetail}>
              <View style={styles.detailRow}>
                <Text variant="caption" color={Colors.textSub}>참여금 환급</Text>
                <Text variant="body">{r.amount.toLocaleString()}원</Text>
              </View>
              <View style={styles.detailRow}>
                <Text variant="caption" color={Colors.textSub}>상금</Text>
                <Text variant="body" color={Colors.green}>
                  +{r.earnings.toLocaleString()}원
                </Text>
              </View>
            </View>
          )}
        </Card>

        {/* 전투 결과 */}
        <Card style={{ marginBottom: Spacing.cardGap }}>
          <Text variant="caption" color={Colors.textSub} style={{ marginBottom: 12 }}>
            전투 결과
          </Text>
          <View style={styles.battleRow}>
            <View style={styles.battleStat}>
              <Text variant="h2" color={Colors.green}>
                {r.survivors.toLocaleString()}
              </Text>
              <Text variant="caption" color={Colors.textSub}>생존</Text>
            </View>
            <View style={styles.battleDivider} />
            <View style={styles.battleStat}>
              <Text variant="h2" color={Colors.red}>
                {(r.totalParticipants - r.survivors).toLocaleString()}
              </Text>
              <Text variant="caption" color={Colors.textSub}>탈락</Text>
            </View>
            <View style={styles.battleDivider} />
            <View style={styles.battleStat}>
              <Text variant="h2">
                {Math.round((r.survivors / r.totalParticipants) * 100)}%
              </Text>
              <Text variant="caption" color={Colors.textSub}>생존률</Text>
            </View>
          </View>
        </Card>

        {/* 레벨/스트릭 */}
        <Card>
          <View style={styles.levelRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <LevelIcon icon={level.icon} size="small" />
              <View>
                <Text variant="caption" color={Colors.textSub}>현재 레벨</Text>
                <Text variant="body" style={{ marginTop: 2 }}>{levelName}</Text>
              </View>
            </View>
            <Badge
              label={`${r.streak}일 연속 성공`}
              color={Colors.gold}
            />
          </View>
        </Card>
      </View>

      <View style={styles.bottom}>
        <Button
          label="홈으로 돌아가기"
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Home' }] })}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.screenPadding,
  },
  resultHeader: {
    alignItems: 'center',
    marginBottom: Spacing.sectionGap,
  },
  earningsDetail: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  battleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  battleStat: {
    flex: 1,
    alignItems: 'center',
  },
  battleDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.border,
  },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottom: {
    paddingHorizontal: Spacing.screenPadding,
    paddingBottom: Spacing.screenPaddingBottom,
  },
});
