import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';

const COLORS = {
  bg: '#08080c',
  card: '#14141e',
  green: '#3ddc84',
  red: '#e24b4a',
  gold: '#f0b429',
  textPrimary: '#ffffff',
  textSecondary: '#8a8a9a',
  border: '#1e1e2e',
};

// Mock data — 나중에 Firebase로 교체
const MOCK = {
  participants: 1247,
  totalPool: 3741000,
  streak: 0,
  level: { name: '불면좀비', emoji: '🧟', nextAt: 3 },
};

function formatCurrency(amount: number): string {
  return amount.toLocaleString('ko-KR') + '원';
}

function getTimeUntilOpen(): { hours: number; minutes: number; seconds: number } | null {
  const now = new Date();
  const h = now.getHours();
  // 참여 가능: 22시 ~ 자정
  if (h >= 22 || h < 0) return null; // 참여 가능 시간
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

export default function App() {
  const [timeUntilOpen, setTimeUntilOpen] = useState(getTimeUntilOpen());
  const isOpen = timeUntilOpen === null;

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeUntilOpen(getTimeUntilOpen());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>꺼라</Text>
        <TouchableOpacity style={styles.profileButton}>
          <Text style={styles.profileEmoji}>{MOCK.level.emoji}</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Level Badge */}
        <View style={styles.levelBadge}>
          <Text style={styles.levelEmoji}>{MOCK.level.emoji}</Text>
          <Text style={styles.levelName}>{MOCK.level.name}</Text>
          <Text style={styles.levelStreak}>
            {MOCK.streak > 0
              ? `${MOCK.streak}일 연속 성공`
              : `${MOCK.level.nextAt}일 뒤 레벨업`}
          </Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>오늘 밤 참전자</Text>
            <Text style={styles.statValue}>
              {MOCK.participants.toLocaleString()}
              <Text style={styles.statUnit}>명</Text>
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>총 풀</Text>
            <Text style={[styles.statValue, { color: COLORS.gold }]}>
              {formatCurrency(MOCK.totalPool)}
            </Text>
          </View>
        </View>

        {/* Today's Rate Info */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>어젯밤 성공률</Text>
            <Text style={styles.infoValue}>78%</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>어젯밤 수익률</Text>
            <Text style={[styles.infoValue, { color: COLORS.green }]}>+28.2%</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>참여 상한</Text>
            <Text style={styles.infoValue}>10,000원</Text>
          </View>
        </View>
      </View>

      {/* Bottom CTA */}
      <View style={styles.bottom}>
        {isOpen ? (
          <TouchableOpacity style={styles.sleepButton} activeOpacity={0.8}>
            <Text style={styles.sleepButtonText}>잠자기</Text>
            <Text style={styles.sleepButtonSub}>지금 참전하기</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.closedContainer}>
            <Text style={styles.closedText}>참전 시간까지</Text>
            <Text style={styles.countdown}>
              {String(timeUntilOpen!.hours).padStart(2, '0')}:
              {String(timeUntilOpen!.minutes).padStart(2, '0')}:
              {String(timeUntilOpen!.seconds).padStart(2, '0')}
            </Text>
            <Text style={styles.closedSub}>밤 10시 ~ 자정에 참전할 수 있어요</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  logo: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.green,
    letterSpacing: -1,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileEmoji: {
    fontSize: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  levelBadge: {
    alignItems: 'center',
    marginBottom: 32,
  },
  levelEmoji: {
    fontSize: 64,
    marginBottom: 8,
  },
  levelName: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  levelStreak: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  statUnit: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.textSecondary,
  },
  infoCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  bottom: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  sleepButton: {
    backgroundColor: COLORS.green,
    borderRadius: 20,
    paddingVertical: 20,
    alignItems: 'center',
  },
  sleepButtonText: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.bg,
  },
  sleepButtonSub: {
    fontSize: 13,
    color: COLORS.bg,
    opacity: 0.7,
    marginTop: 2,
  },
  closedContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  closedText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  countdown: {
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: 2,
    fontVariant: ['tabular-nums'],
  },
  closedSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
});
