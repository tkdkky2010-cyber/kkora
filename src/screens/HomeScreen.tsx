import { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../components/atoms/Text';
import { Card } from '../components/atoms/Card';
import { Badge } from '../components/atoms/Badge';
import { LevelIcon } from '../components/atoms/LevelIcon';
import { LevelInfoModal } from '../components/organisms/LevelInfoModal';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { AppConfig } from '../constants/config';
import { getLevelByStreak } from '../constants/levels';
import { subscribeDailyPool } from '../services/firebase/firestore';
import { getServerNow } from '../utils/serverTime';
import { useUserProfile } from '../hooks/useUserProfile';
import { RootStackParamList } from '../types/navigation';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

function formatCurrency(amount: number): string {
  return amount.toLocaleString('ko-KR') + '원';
}

// 홈 화면 상태: 'open' (22~24시), 'countdown' (7~22시), 'closed' (0~7시)
type HomeTimeState =
  | { status: 'open' }
  | { status: 'countdown'; hours: number; minutes: number; seconds: number }
  | { status: 'closed' };

function getHomeTimeState(): HomeTimeState {
  const now = getServerNow();
  const h = now.getHours();

  // 22:00 ~ 23:59 → 참여 가능
  if (h >= AppConfig.challenge.startHour) {
    return { status: 'open' };
  }

  // 00:00 ~ 06:59 → 마감 (정산 전)
  if (h < AppConfig.challenge.settlementHour) {
    return { status: 'closed' };
  }

  // 07:00 ~ 21:59 → 카운트다운
  const target = new Date(now);
  target.setHours(AppConfig.challenge.startHour, 0, 0, 0);
  const diff = target.getTime() - now.getTime();
  return {
    status: 'countdown',
    hours: Math.floor(diff / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { userData } = useUserProfile();
  const [timeState, setTimeState] = useState<HomeTimeState>(getHomeTimeState());
  const [showLevelInfo, setShowLevelInfo] = useState(false);
  const [poolData, setPoolData] = useState({
    totalParticipants: 0,
    totalPool: 0,
    survivors: 0,
  });

  const streak = userData?.streak ?? 0;
  const playerNumber = userData?.playerNumber ?? 0;
  const freeTrialDaysLeft = userData?.freeTrialDaysLeft ?? 0;
  const level = getLevelByStreak(streak);
  const isNumberPhase = level.requiredDays === 0;
  const levelName = isNumberPhase
    ? level.name.replace('???', String(playerNumber))
    : level.name;

  const shownConversionPopup = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeState(getHomeTimeState());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // 4일차 유료 전환 유도 팝업
  useEffect(() => {
    if (userData && freeTrialDaysLeft === 0 && (userData.balance ?? 0) === 0 && !shownConversionPopup.current) {
      shownConversionPopup.current = true;
      Alert.alert(
        '무료 체험이 끝났어요!',
        '이제 실제로 돈을 벌어보세요.\n잔액을 충전하고 챌린지에 참여하세요.',
        [
          { text: '나중에', style: 'cancel' },
          { text: '충전하기', onPress: () => navigation.navigate('Charge') },
        ],
      );
    }
  }, [userData, freeTrialDaysLeft, navigation]);

  // Firestore dailyPool 실시간 구독
  useEffect(() => {
    const unsubscribe = subscribeDailyPool((data) => {
      setPoolData(data);
    });
    return unsubscribe;
  }, []);


  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="h1" color={Colors.green} style={{ letterSpacing: -1 }}>
          꺼라
        </Text>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <LevelIcon icon={level.icon} size="small" />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Level Badge */}
        <View style={styles.levelBadge}>
          <LevelIcon icon={level.icon} size="large" />
          <View style={styles.levelNameRow}>
            <Text variant="h2">{levelName}</Text>
            <TouchableOpacity
              onPress={() => setShowLevelInfo(true)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="help-circle-outline" size={20} color={Colors.textSub} />
            </TouchableOpacity>
          </View>
          {streak > 0 ? (
            <View style={styles.streakBadge}>
              <Text variant="largeNumber" color={Colors.gold}>
                {streak}
              </Text>
              <Text variant="h2" color={Colors.gold}>일 연속 성공</Text>
            </View>
          ) : (
            <Text variant="body" color={Colors.textSub} style={{ marginTop: 8 }}>
              첫 챌린지에 도전해보세요
            </Text>
          )}
        </View>

        {/* 무료 체험 배너 */}
        {freeTrialDaysLeft > 0 && (
          <Card style={{ marginBottom: Spacing.cardGap, borderColor: Colors.green + '40' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text variant="body" color={Colors.green} style={{ fontWeight: '600' }}>
                  무료 체험 중
                </Text>
                <Text variant="caption" color={Colors.textSub} style={{ marginTop: 2 }}>
                  {freeTrialDaysLeft}일 남음 — 무료로 챌린지에 참여하세요
                </Text>
              </View>
              <Badge label={`${freeTrialDaysLeft}일`} color={Colors.green} />
            </View>
          </Card>
        )}

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text variant="caption" color={Colors.textSub} style={{ marginBottom: 8 }}>
              오늘 밤 참전자
            </Text>
            <Text variant="h2">
              {poolData.totalParticipants.toLocaleString()}
              <Text variant="caption" color={Colors.textSub}>명</Text>
            </Text>
          </Card>
          <Card style={styles.statCard}>
            <Text variant="caption" color={Colors.textSub} style={{ marginBottom: 8 }}>
              총 풀
            </Text>
            <Text variant="h2" color={Colors.gold}>
              {formatCurrency(poolData.totalPool)}
            </Text>
          </Card>
        </View>

        {/* Info Card */}
        <Card>
          <View style={styles.infoRow}>
            <Text variant="caption" color={Colors.textSub}>생존자</Text>
            <Text variant="body" style={{ fontWeight: '600' }}>
              {poolData.survivors.toLocaleString()}명
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text variant="caption" color={Colors.textSub}>생존률</Text>
            <Text variant="body" color={Colors.green} style={{ fontWeight: '600' }}>
              {poolData.totalParticipants > 0
                ? Math.round((poolData.survivors / poolData.totalParticipants) * 100) + '%'
                : '-'}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text variant="caption" color={Colors.textSub}>참여 상한</Text>
            <Text variant="body" style={{ fontWeight: '600' }}>
              {AppConfig.maxAmount.toLocaleString()}원
            </Text>
          </View>
        </Card>
      </View>

      {/* Bottom CTA */}
      <View style={styles.bottom}>
        {timeState.status === 'open' ? (
          <TouchableOpacity
            style={styles.sleepButton}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Checklist')}
          >
            <Text variant="h2" color={Colors.bgPrimary} style={{ fontWeight: '800' }}>
              잠자기
            </Text>
            <Text variant="caption" color={Colors.bgPrimary} style={{ opacity: 0.7, marginTop: 2 }}>
              지금 참전하기
            </Text>
          </TouchableOpacity>
        ) : timeState.status === 'countdown' ? (
          <View style={styles.closedContainer}>
            <Text variant="caption" color={Colors.textSub}>참전 시간까지</Text>
            <Text
              variant="largeNumber"
              style={{ letterSpacing: 2, fontVariant: ['tabular-nums'], marginTop: 4 }}
            >
              {String(timeState.hours).padStart(2, '0')}:
              {String(timeState.minutes).padStart(2, '0')}:
              {String(timeState.seconds).padStart(2, '0')}
            </Text>
            <Text variant="caption" color={Colors.textSub} style={{ marginTop: 8 }}>
              밤 10시 ~ 자정에 참전할 수 있어요
            </Text>
          </View>
        ) : (
          <View style={styles.closedContainer}>
            <Text variant="h2" color={Colors.textSub}>오늘 밤 참전 마감</Text>
            <Text variant="caption" color={Colors.textSub} style={{ marginTop: 8 }}>
              내일 밤 10시에 다시 만나요
            </Text>
          </View>
        )}
      </View>

      <LevelInfoModal
        visible={showLevelInfo}
        onClose={() => setShowLevelInfo(false)}
        currentLevel={level}
        playerNumber={playerNumber}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: 16,
    paddingBottom: 8,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.screenPadding,
  },
  levelBadge: {
    alignItems: 'center',
    marginBottom: Spacing.sectionGap,
  },
  levelNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.cardGap,
    marginBottom: Spacing.cardGap,
  },
  statCard: {
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  bottom: {
    paddingHorizontal: Spacing.screenPadding,
    paddingBottom: Spacing.screenPaddingBottom,
  },
  sleepButton: {
    backgroundColor: Colors.green,
    borderRadius: 14,
    paddingVertical: 20,
    alignItems: 'center',
  },
  closedContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 8,
  },
});
