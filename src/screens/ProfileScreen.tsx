import { useState } from 'react';
import { SafeAreaView, StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../components/atoms/Text';
import { Button } from '../components/atoms/Button';
import { Card } from '../components/atoms/Card';
import { LevelBadge } from '../components/molecules/LevelBadge';
import { LevelInfoModal } from '../components/organisms/LevelInfoModal';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { getLevelByStreak } from '../constants/levels';
import { RootStackParamList } from '../types/navigation';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Profile'>;

// Mock — Firebase 연동 시 교체
const MOCK_USER = {
  displayName: '테스트 유저',
  balance: 12500,
  streak: 5,
  maxStreak: 12,
  totalEarnings: 34200,
  totalChallenges: 28,
  successRate: 82,
};

export default function ProfileScreen() {
  const navigation = useNavigation<Nav>();
  const [showLevelInfo, setShowLevelInfo] = useState(false);
  const level = getLevelByStreak(MOCK_USER.streak);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 프로필 헤더 */}
        <View style={styles.profileHeader}>
          <LevelBadge level={level} streak={MOCK_USER.streak} />
          <View style={styles.nameRow}>
            <Text variant="h2">{MOCK_USER.displayName}</Text>
            <TouchableOpacity
              onPress={() => setShowLevelInfo(true)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="help-circle-outline" size={20} color={Colors.textSub} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 잔액 카드 */}
        <Card style={styles.balanceCard}>
          <Text variant="caption" color={Colors.textSub}>내 잔액</Text>
          <Text variant="largeNumber" color={Colors.green} style={{ marginTop: 4 }}>
            {MOCK_USER.balance.toLocaleString()}원
          </Text>
          <View style={styles.balanceButtons}>
            <Button
              label="충전"
              onPress={() => {}}
              style={{ flex: 1 }}
            />
            <Button
              label="출금"
              variant="secondary"
              onPress={() => {}}
              style={{ flex: 1 }}
            />
          </View>
        </Card>

        {/* 연속 성공일 카드 */}
        <Card style={styles.streakCard}>
          <Text variant="caption" color={Colors.textSub}>연속 성공일</Text>
          <View style={styles.streakRow}>
            <Text variant="largeNumber" color={Colors.gold}>
              {MOCK_USER.streak}
            </Text>
            <Text variant="h2" color={Colors.gold} style={{ marginLeft: 4 }}>일</Text>
          </View>
          <View style={styles.streakSubRow}>
            <Text variant="caption" color={Colors.textSub}>
              최대 {MOCK_USER.maxStreak}일
            </Text>
          </View>
        </Card>

        {/* 통계 카드 */}
        <Card style={{ marginBottom: Spacing.cardGap }}>
          <Text variant="h2" style={{ marginBottom: 16 }}>내 기록</Text>
          <View style={styles.statGrid}>
            <View style={styles.statItem}>
              <Text variant="h2" color={Colors.green}>
                +{MOCK_USER.totalEarnings.toLocaleString()}원
              </Text>
              <Text variant="caption" color={Colors.textSub}>총 수익</Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="h2">{MOCK_USER.successRate}%</Text>
              <Text variant="caption" color={Colors.textSub}>성공률</Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="h2">{MOCK_USER.totalChallenges}회</Text>
              <Text variant="caption" color={Colors.textSub}>총 참여</Text>
            </View>
          </View>
        </Card>

        {/* 네비게이션 버튼 */}
        <Button
          label="챌린지 기록 보기"
          variant="secondary"
          onPress={() => navigation.navigate('History')}
          style={{ marginBottom: 12 }}
        />
        <Button
          label="설정"
          variant="secondary"
          onPress={() => navigation.navigate('Settings')}
        />
      </ScrollView>

      <LevelInfoModal
        visible={showLevelInfo}
        onClose={() => setShowLevelInfo(false)}
        currentLevel={level}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
  },
  scrollContent: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.screenPadding,
    paddingBottom: 32,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: Spacing.sectionGap,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
  },
  balanceCard: {
    marginBottom: Spacing.cardGap,
  },
  balanceButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statItem: {
    width: '45%',
    gap: 4,
  },
  streakCard: {
    marginBottom: Spacing.cardGap,
    alignItems: 'center',
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 4,
  },
  streakSubRow: {
    marginTop: 4,
  },
});
