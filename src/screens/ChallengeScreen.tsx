import { useEffect, useState, useRef, useCallback } from 'react';
import { StyleSheet, View, BackHandler, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase/config';
import { subscribeDailyPool } from '../services/firebase/firestore';
import { reportGrace } from '../services/firebase/functions';
import { useAppState } from '../hooks/useAppState';
import { useTimer } from '../hooks/useTimer';
import { useHeartbeat } from '../hooks/useHeartbeat';
import { Text } from '../components/atoms/Text';
import { Card } from '../components/atoms/Card';
import { Badge } from '../components/atoms/Badge';
import { TimerDisplay } from '../components/molecules/TimerDisplay';
import { WarBroadcast } from '../components/organisms/WarBroadcast';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { AppConfig } from '../constants/config';
import { useChallenge } from '../contexts/ChallengeContext';
import { RootStackParamList } from '../types/navigation';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Challenge'>;
type Route = RouteProp<RootStackParamList, 'Challenge'>;

export default function ChallengeScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { challengeId } = route.params;

  const [gracesUsed, setGracesUsed] = useState(0);
  const [startTimeMs, setStartTimeMs] = useState<number | null>(null);
  const [challengeActive, setChallengeActive] = useState(true);
  const [poolData, setPoolData] = useState({
    totalParticipants: 0,
    totalPool: 0,
    survivors: 0,
  });

  const hasNavigated = useRef(false);
  const { updateGraces, endChallenge } = useChallenge();
  const prevSurvivorsRef = useRef(0);
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcastType, setBroadcastType] = useState<'info' | 'danger' | 'success'>('info');
  const [broadcastVisible, setBroadcastVisible] = useState(false);

  // 실패 애니메이션
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const flashOpacity = useRef(new Animated.Value(0)).current;

  const playFailAnimation = (onComplete: () => void) => {
    Animated.parallel([
      // Shake: 좌우 흔들림
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]),
      // Red flash
      Animated.sequence([
        Animated.timing(flashOpacity, { toValue: 0.4, duration: 100, useNativeDriver: true }),
        Animated.timing(flashOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
    ]).start(onComplete);
  };

  // Firestore에서 챌린지 문서 구독
  useEffect(() => {
    const docRef = doc(db, 'challenges', challengeId);
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data.startTime?.toMillis) {
            setStartTimeMs(data.startTime.toMillis());
          }
          if (typeof data.gracesUsed === 'number') {
            setGracesUsed(data.gracesUsed);
          }
          // 서버에서 실패 처리된 경우
          if (data.status === 'failed' && !hasNavigated.current) {
            hasNavigated.current = true;
            setChallengeActive(false);
            playFailAnimation(() => {
              navigation.navigate('Result', { challengeId });
            });
          }
        }
      },
      () => {
        // Firestore 에러 — 오프라인 등
      },
    );
    return unsubscribe;
  }, [challengeId, navigation]);

  // dailyPool 실시간 구독 + 전쟁 중계
  useEffect(() => {
    const unsubscribe = subscribeDailyPool((data) => {
      const prev = prevSurvivorsRef.current;
      const curr = data.survivors;

      if (prev > 0 && curr < prev) {
        const fallen = prev - curr;
        setBroadcastMsg(`방금 ${fallen}명이 탈락했습니다`);
        setBroadcastType('danger');
        setBroadcastVisible(true);
        setTimeout(() => setBroadcastVisible(false), 3000);
      }

      const rate = data.totalParticipants > 0
        ? Math.round((curr / data.totalParticipants) * 100) : 0;
      if (prev > 0 && rate <= 50 && Math.round((prev / data.totalParticipants) * 100) > 50) {
        setBroadcastMsg('생존률 50% 이하! 절반이 탈락했습니다');
        setBroadcastType('danger');
        setBroadcastVisible(true);
        setTimeout(() => setBroadcastVisible(false), 4000);
      }

      prevSurvivorsRef.current = curr;
      setPoolData(data);
    });
    return unsubscribe;
  }, []);

  // 서버 startTime 기반 카운트다운 (useTimer 훅)
  const navigateToResult = useCallback(() => {
    if (hasNavigated.current) return;
    hasNavigated.current = true;
    setChallengeActive(false);
    endChallenge();
    navigation.navigate('Result', { challengeId });
  }, [challengeId, navigation, endChallenge]);

  const navigateToResultWithFail = useCallback(() => {
    if (hasNavigated.current) return;
    hasNavigated.current = true;
    setChallengeActive(false);
    endChallenge();
    playFailAnimation(() => {
      navigation.navigate('Result', { challengeId });
    });
  }, [challengeId, navigation, endChallenge]);

  const { hours, minutes, seconds } = useTimer({
    startTimeMs,
    onComplete: navigateToResult,
  });

  // 30초 주기 heartbeat — 서버가 120초 무응답 시 자동 실패 처리
  useHeartbeat(challengeId, challengeActive);

  // Android 하드웨어 백버튼 방지
  useEffect(() => {
    const handler = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => handler.remove();
  }, []);

  // 소프트웨어 백 네비게이션 방지
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (hasNavigated.current) return;
      e.preventDefault();
    });
    return unsubscribe;
  }, [navigation]);

  // AppState 감지: grace period
  // 수면(5분+ 이탈)은 자동 무시, 앱 전환(5분 미만)만 grace 판정
  //
  // reportGrace 실패 시 재시도: 'failed' 보고가 유실되면 정산이 이를 성공으로 처리하므로
  // 지수 백오프로 최대 3회 재시도. 끝내 실패 시 로컬 큐에 적재 (추후 재접속 시 flush).
  const reportGraceWithRetry = useCallback(
    async (
      id: string,
      result: 'returned' | 'failed',
      exitTimeMs: number,
      attempt = 0,
    ): Promise<void> => {
      try {
        await reportGrace(id, result, exitTimeMs);
      } catch {
        if (attempt < 2) {
          const delay = 500 * Math.pow(2, attempt);
          await new Promise((r) => setTimeout(r, delay));
          return reportGraceWithRetry(id, result, exitTimeMs, attempt + 1);
        }
        // TODO: AsyncStorage 큐에 적재 후 앱 재기동 시 flush
      }
    },
    [],
  );

  useAppState({
    enabled: challengeActive,
    onForeground: (elapsedSeconds, exitTimeMs) => {
      if (elapsedSeconds < AppConfig.grace.durationSeconds) {
        // 60초 이내 복귀 → grace 1회 소모
        const newGraces = gracesUsed + 1;
        setGracesUsed(newGraces);

        if (newGraces > AppConfig.grace.maxCount) {
          // 4회째 → 즉시 실패
          void reportGraceWithRetry(challengeId, 'failed', exitTimeMs);
          navigateToResultWithFail();
        } else {
          void reportGraceWithRetry(challengeId, 'returned', exitTimeMs);
        }
      } else {
        // 60초~5분 이탈 → 실패 (수면은 useAppState에서 이미 필터됨)
        void reportGraceWithRetry(challengeId, 'failed', exitTimeMs);
        navigateToResultWithFail();
      }
    },
  });

  const survivalRate =
    poolData.totalParticipants > 0
      ? Math.round((poolData.survivors / poolData.totalParticipants) * 100)
      : 0;

  const remainingGraces = Math.max(0, AppConfig.grace.maxCount - gracesUsed);

  return (
    <SafeAreaView style={styles.container}>
      {/* Red flash overlay */}
      <Animated.View
        style={[styles.flashOverlay, { opacity: flashOpacity }]}
        pointerEvents="none"
      />

      <Animated.View style={[styles.content, { transform: [{ translateX: shakeAnim }] }]}>
        {/* 전쟁 중계 */}
        <WarBroadcast message={broadcastMsg} type={broadcastType} visible={broadcastVisible} />

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
                  {poolData.survivors.toLocaleString()}
                  <Text variant="body" color={Colors.textSub}>
                    /{poolData.totalParticipants.toLocaleString()}명
                  </Text>
                </Text>
              </View>
              <View style={styles.rateContainer}>
                <Text variant="h2" color={Colors.green}>{survivalRate}%</Text>
                <Text variant="caption" color={Colors.textSub}>생존률</Text>
              </View>
            </View>

            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${survivalRate}%` }]} />
            </View>
          </Card>

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
            <View style={styles.cardRow}>
              <Text variant="caption" color={Colors.textSub}>오늘 밤 총 상금</Text>
              <Text variant="h2" color={Colors.gold}>
                {poolData.totalPool.toLocaleString()}원
              </Text>
            </View>
          </Card>
        </View>
      </Animated.View>
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
  },
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.red,
    zIndex: 10,
  },
  header: {
    alignItems: 'center',
    paddingTop: Spacing.cardGap,
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
});
