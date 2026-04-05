import { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../components/atoms/Text';
import { Card } from '../components/atoms/Card';
import { LevelIcon } from '../components/atoms/LevelIcon';
import { LevelInfoModal } from '../components/organisms/LevelInfoModal';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { getLevelByStreak } from '../constants/levels';
import { RootStackParamList } from '../types/navigation';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

// Mock data — 나중에 Firebase로 교체
const MOCK = {
  participants: 1247,
  totalPool: 3741000,
  streak: 5,
  playerNumber: 247,
};

function formatCurrency(amount: number): string {
  return amount.toLocaleString('ko-KR') + '원';
}

function getTimeUntilOpen(): { hours: number; minutes: number; seconds: number } | null {
  const now = new Date();
  const h = now.getHours();
  if (h >= 22 || h < 0) return null;
  const target = new Date(now);
  target.setHours(22, 0, 0, 0);
  if (target.getTime() <= now.getTime()) return null;
  const diff = target.getTime() - now.getTime();
  return {
    hours: Math.floor(diff / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const [timeUntilOpen, setTimeUntilOpen] = useState(getTimeUntilOpen());
  const [showLevelInfo, setShowLevelInfo] = useState(false);
  const isOpen = timeUntilOpen === null;

  const level = getLevelByStreak(MOCK.streak);
  const isNumberPhase = level.requiredDays === 0;
  const levelName = isNumberPhase
    ? level.name.replace('???', String(MOCK.playerNumber))
    : level.name;

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeUntilOpen(getTimeUntilOpen());
    }, 1000);
    return () => clearInterval(interval);
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
          {MOCK.streak > 0 ? (
            <View style={styles.streakBadge}>
              <Text variant="largeNumber" color={Colors.gold}>
                {MOCK.streak}
              </Text>
              <Text variant="h2" color={Colors.gold}>일 연속 성공</Text>
            </View>
          ) : (
            <Text variant="body" color={Colors.textSub} style={{ marginTop: 8 }}>
              첫 챌린지에 도전해보세요
            </Text>
          )}
        </View>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text variant="caption" color={Colors.textSub} style={{ marginBottom: 8 }}>
              오늘 밤 참전자
            </Text>
            <Text variant="h2">
              {MOCK.participants.toLocaleString()}
              <Text variant="caption" color={Colors.textSub}>명</Text>
            </Text>
          </Card>
          <Card style={styles.statCard}>
            <Text variant="caption" color={Colors.textSub} style={{ marginBottom: 8 }}>
              총 풀
            </Text>
            <Text variant="h2" color={Colors.gold}>
              {formatCurrency(MOCK.totalPool)}
            </Text>
          </Card>
        </View>

        {/* Info Card */}
        <Card>
          <View style={styles.infoRow}>
            <Text variant="caption" color={Colors.textSub}>어젯밤 성공률</Text>
            <Text variant="body" style={{ fontWeight: '600' }}>78%</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text variant="caption" color={Colors.textSub}>어젯밤 수익률</Text>
            <Text variant="body" color={Colors.green} style={{ fontWeight: '600' }}>
              +28.2%
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text variant="caption" color={Colors.textSub}>참여 상한</Text>
            <Text variant="body" style={{ fontWeight: '600' }}>10,000원</Text>
          </View>
        </Card>
      </View>

      {/* Bottom CTA */}
      <View style={styles.bottom}>
        {isOpen ? (
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
        ) : (
          <View style={styles.closedContainer}>
            <Text variant="caption" color={Colors.textSub}>참전 시간까지</Text>
            <Text
              variant="largeNumber"
              style={{ letterSpacing: 2, fontVariant: ['tabular-nums'], marginTop: 4 }}
            >
              {String(timeUntilOpen!.hours).padStart(2, '0')}:
              {String(timeUntilOpen!.minutes).padStart(2, '0')}:
              {String(timeUntilOpen!.seconds).padStart(2, '0')}
            </Text>
            <Text variant="caption" color={Colors.textSub} style={{ marginTop: 8 }}>
              밤 10시 ~ 자정에 참전할 수 있어요
            </Text>
          </View>
        )}
      </View>

      <LevelInfoModal
        visible={showLevelInfo}
        onClose={() => setShowLevelInfo(false)}
        currentLevel={level}
        playerNumber={MOCK.playerNumber}
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
    width: 40,
    height: 40,
    borderRadius: 20,
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
    gap: 12,
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
    paddingBottom: 32,
  },
  sleepButton: {
    backgroundColor: Colors.green,
    borderRadius: 20,
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
