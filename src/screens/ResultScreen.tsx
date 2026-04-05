import { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase/config';
import { subscribeDailyPool } from '../services/firebase/firestore';
import ConfettiCannon from 'react-native-confetti-cannon';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { Text } from '../components/atoms/Text';
import { Button } from '../components/atoms/Button';
import { Card } from '../components/atoms/Card';
import { Badge } from '../components/atoms/Badge';
import { LevelIcon } from '../components/atoms/LevelIcon';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { getLevelByStreak } from '../constants/levels';
import { useAuth } from '../contexts/AuthContext';
import { getUserDoc } from '../services/firebase/firestore';
import { RootStackParamList } from '../types/navigation';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Result'>;
type Route = RouteProp<RootStackParamList, 'Result'>;

interface ChallengeResult {
  isSuccess: boolean;
  amount: number;
  earnings: number;
  sleepDuration: string;
}

export default function ResultScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { user } = useAuth();
  const { challengeId } = route.params;
  const viewShotRef = useRef<ViewShot>(null);

  const [result, setResult] = useState<ChallengeResult | null>(null);
  const [challengeDate, setChallengeDate] = useState<string | null>(null);
  const [poolData, setPoolData] = useState({ survivors: 0, totalParticipants: 0 });
  const [streak, setStreak] = useState(0);
  const [playerNumber, setPlayerNumber] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Firestore에서 챌린지 결과 조회
  useEffect(() => {
    const docRef = doc(db, 'challenges', challengeId);
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          const isSuccess = data.status === 'success';

          let sleepDuration = '7시간 0분';
          if (data.startTime?.toMillis && data.settledAt?.toMillis) {
            const diffMs = data.settledAt.toMillis() - data.startTime.toMillis();
            const hours = Math.floor(diffMs / 3600000);
            const minutes = Math.floor((diffMs % 3600000) / 60000);
            sleepDuration = `${hours}시간 ${minutes}분`;
          }

          setResult({ isSuccess, amount: data.amount || 0, earnings: data.earnings || 0, sleepDuration });
          if (data.date) setChallengeDate(data.date);
          if (isSuccess) setShowConfetti(true);
        } else {
          setError('결과를 찾을 수 없습니다.');
        }
        setLoading(false);
      },
      () => { setError('결과를 불러오는 데 실패했습니다.'); setLoading(false); },
    );
    return unsubscribe;
  }, [challengeId]);

  useEffect(() => {
    if (!challengeDate) return;
    const unsubscribe = subscribeDailyPool(
      (data) => {
        setPoolData({ survivors: data.survivors, totalParticipants: data.totalParticipants });
      },
      undefined,
      challengeDate,
    );
    return unsubscribe;
  }, [challengeDate]);

  useEffect(() => {
    if (!user) return;
    getUserDoc(user.uid).then((d) => {
      if (d) { setStreak(d.streak); setPlayerNumber(d.playerNumber ?? 0); }
    });
  }, [user]);

  const level = getLevelByStreak(streak);
  const isNumberPhase = level.requiredDays === 0;
  const levelName = isNumberPhase ? level.name.replace('???', String(playerNumber)) : level.name;

  const isAllSuccess = poolData.totalParticipants > 0 && poolData.survivors === poolData.totalParticipants;
  const survivalRate = poolData.totalParticipants > 0
    ? Math.round((poolData.survivors / poolData.totalParticipants) * 100) : 0;

  // 생존 카드 공유
  const handleShare = async () => {
    try {
      if (!viewShotRef.current?.capture) return;
      const uri = await viewShotRef.current.capture();
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: '꺼라 생존 카드 공유' });
      }
    } catch {
      // 공유 실패 무시
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={Colors.green} size="large" />
          <Text variant="body" color={Colors.textSub} style={{ marginTop: 16 }}>결과를 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !result) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text variant="h2" color={Colors.red}>{error || '오류가 발생했습니다.'}</Text>
          <Button label="홈으로 돌아가기" onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Home' }] })} style={{ marginTop: 24 }} />
        </View>
      </SafeAreaView>
    );
  }

  const r = result;

  return (
    <SafeAreaView style={styles.container}>
      {/* Confetti */}
      {showConfetti && (
        <ConfettiCannon
          count={150}
          origin={{ x: -10, y: 0 }}
          autoStart
          fadeOut
          onAnimationEnd={() => setShowConfetti(false)}
          colors={[Colors.green, Colors.gold, '#ffffff', Colors.green]}
        />
      )}

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 생존 카드 (캡처 영역) */}
        <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1 }}>
          <View style={styles.survivorCard}>
            {/* 결과 헤더 */}
            <View style={styles.resultHeader}>
              <Text variant="largeNumber" style={{ marginBottom: Spacing.cardGap }}>
                {r.isSuccess ? '🎉' : '💀'}
              </Text>
              <Text variant="h1" color={r.isSuccess ? Colors.green : Colors.red}>
                {isAllSuccess && r.isSuccess ? '전원 생존!' : r.isSuccess ? '챌린지 성공!' : '챌린지 실패'}
              </Text>
              <Text variant="body" color={Colors.textSub} style={{ marginTop: Spacing.elementGap }}>
                수면 시간: {r.sleepDuration}
              </Text>
            </View>

            {/* 수익 카드 */}
            <Card style={{ marginBottom: Spacing.cardGap }}>
              <Text variant="caption" color={Colors.textSub} style={{ marginBottom: 4 }}>
                {r.isSuccess ? (isAllSuccess ? '원금 환급 (전원 성공)' : '오늘의 수익') : '잃은 금액'}
              </Text>
              <Text variant="largeNumber" color={r.isSuccess ? Colors.green : Colors.red}>
                {r.isSuccess
                  ? (isAllSuccess ? '' : '+') + (r.earnings + r.amount).toLocaleString() + '원'
                  : '-' + r.amount.toLocaleString() + '원'}
              </Text>
              {r.isSuccess && !isAllSuccess && (
                <View style={styles.earningsDetail}>
                  <View style={styles.detailRow}>
                    <Text variant="caption" color={Colors.textSub}>참여금 환급</Text>
                    <Text variant="body">{r.amount.toLocaleString()}원</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text variant="caption" color={Colors.textSub}>상금</Text>
                    <Text variant="body" color={Colors.green}>+{r.earnings.toLocaleString()}원</Text>
                  </View>
                </View>
              )}
              {isAllSuccess && r.isSuccess && (
                <Text variant="caption" color={Colors.textSub} style={{ marginTop: Spacing.elementGap }}>
                  전원 성공으로 수수료 0% + 원금 전액 환급
                </Text>
              )}
            </Card>

            {/* 전투 결과 */}
            <Card style={{ marginBottom: Spacing.cardGap }}>
              <Text variant="caption" color={Colors.textSub} style={{ marginBottom: 12 }}>전투 결과</Text>
              <View style={styles.battleRow}>
                <View style={styles.battleStat}>
                  <Text variant="h2" color={Colors.green}>{poolData.survivors.toLocaleString()}</Text>
                  <Text variant="caption" color={Colors.textSub}>생존</Text>
                </View>
                <View style={styles.battleDivider} />
                <View style={styles.battleStat}>
                  <Text variant="h2" color={Colors.red}>{(poolData.totalParticipants - poolData.survivors).toLocaleString()}</Text>
                  <Text variant="caption" color={Colors.textSub}>탈락</Text>
                </View>
                <View style={styles.battleDivider} />
                <View style={styles.battleStat}>
                  <Text variant="h2">{survivalRate}%</Text>
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
                <Badge label={`${streak}일 연속 성공`} color={Colors.gold} />
              </View>
            </Card>

            {/* 꺼라 워터마크 */}
            <View style={styles.watermark}>
              <Text variant="caption" color={Colors.textDisabled}>꺼라 — 폰을 끄면 돈을 번다</Text>
            </View>
          </View>
        </ViewShot>
      </ScrollView>

      <View style={styles.bottom}>
        {r.isSuccess && (
          <Button
            label="생존 카드 공유하기"
            variant="secondary"
            onPress={handleShare}
            style={{ marginBottom: 12 }}
          />
        )}
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
  scrollContent: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.screenPadding,
    paddingBottom: 140,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.screenPadding,
  },
  survivorCard: {
    backgroundColor: Colors.bgPrimary,
    paddingBottom: Spacing.cardGap,
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
    gap: Spacing.elementGap,
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
  watermark: {
    alignItems: 'center',
    marginTop: Spacing.cardGap,
  },
  bottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.screenPadding,
    paddingBottom: Spacing.screenPaddingBottom,
    paddingTop: 16,
    backgroundColor: Colors.bgPrimary,
  },
});
