import { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
import { useUserProfile } from '../hooks/useUserProfile';
import { RootStackParamList } from '../types/navigation';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Profile'>;

export default function ProfileScreen() {
  const navigation = useNavigation<Nav>();
  const { userData } = useUserProfile();
  const [showLevelInfo, setShowLevelInfo] = useState(false);

  const displayName = userData?.displayName ?? '유저';
  const balance = userData?.balance ?? 0;
  const streak = userData?.streak ?? 0;
  const maxStreak = userData?.maxStreak ?? 0;
  const totalEarnings = userData?.totalEarnings ?? 0;
  const playerNumber = userData?.playerNumber ?? 0;
  const level = getLevelByStreak(streak);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 프로필 헤더 */}
        <View style={styles.profileHeader}>
          <LevelBadge level={level} streak={streak} playerNumber={playerNumber} />
          <View style={styles.nameRow}>
            <Text variant="h2">{displayName}</Text>
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
            {balance.toLocaleString()}원
          </Text>
          <View style={styles.balanceButtons}>
            <Button
              label="충전"
              onPress={() => navigation.navigate('Charge')}
              style={{ flex: 1 }}
            />
            <Button
              label="출금"
              variant="secondary"
              onPress={() => navigation.navigate('Withdraw')}
              style={{ flex: 1 }}
            />
          </View>
        </Card>

        {/* 연속 성공일 카드 */}
        <Card style={styles.streakCard}>
          <Text variant="caption" color={Colors.textSub}>연속 성공일</Text>
          <View style={styles.streakRow}>
            <Text variant="largeNumber" color={Colors.gold}>
              {streak}
            </Text>
            <Text variant="h2" color={Colors.gold} style={{ marginLeft: 4 }}>일</Text>
          </View>
          <View style={styles.streakSubRow}>
            <Text variant="caption" color={Colors.textSub}>
              최대 {maxStreak}일
            </Text>
          </View>
        </Card>

        {/* 통계 카드 */}
        <Card style={{ marginBottom: Spacing.cardGap }}>
          <Text variant="h2" style={{ marginBottom: 16 }}>내 기록</Text>
          <View style={styles.statGrid}>
            <View style={styles.statItem}>
              <Text variant="h2" color={Colors.green}>
                +{totalEarnings.toLocaleString()}원
              </Text>
              <Text variant="caption" color={Colors.textSub}>총 수익</Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="h2">-</Text>
              <Text variant="caption" color={Colors.textSub}>성공률</Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="h2">-</Text>
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
        streak={streak}
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
  scrollContent: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.screenPadding,
    paddingBottom: Spacing.screenPaddingBottom,
  },
  profileHeader: {
    alignItems: 'center',
    marginTop: 44,
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
