import { useState, useRef, useMemo, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Animated,
  PanResponder,
  useWindowDimensions,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Battery from 'expo-battery';
import * as Notifications from 'expo-notifications';
import { Text } from '../components/atoms/Text';
import { Card } from '../components/atoms/Card';
import { ChecklistItem } from '../components/molecules/ChecklistItem';
import { AmountSelector } from '../components/molecules/AmountSelector';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { AppConfig } from '../constants/config';
import { RootStackParamList } from '../types/navigation';
import { startChallenge } from '../services/firebase/functions';
import { useAuth } from '../contexts/AuthContext';
import { useChallenge } from '../contexts/ChallengeContext';
import { useUserProfile } from '../hooks/useUserProfile';
import { getTimeDriftMinutes, isServerTimeSynced } from '../utils/serverTime';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Checklist'>;

interface CheckItem {
  id: string;
  label: string;
  autoDetected?: boolean;
  helpText?: string;
}

const CHECK_ITEMS: CheckItem[] = [
  {
    id: 'auto_clean',
    label: '앱 자동 정리 프로그램 껐습니다',
    helpText: Platform.OS === 'ios'
      ? '설정 > 일반 > 백그라운드 앱 새로고침에서 꺼라 앱이 허용되어 있는지 확인하세요.'
      : '설정 > 배터리 > 배터리 최적화에서 꺼라 앱을 "최적화하지 않음"으로 설정하세요.',
  },
  {
    id: 'battery',
    label: '배터리 50% 이상입니다',
    autoDetected: true,
    helpText: '챌린지 중 배터리가 방전되면 실패할 수 있습니다. 충전기를 연결한 채로 주무시는 것을 권장합니다.',
  },
  {
    id: 'auto_update',
    label: '앱 자동 업데이트 껐습니다',
    helpText: Platform.OS === 'ios'
      ? '설정 > App Store > 앱 업데이트 자동 다운로드를 꺼주세요.'
      : 'Play 스토어 > 설정 > 네트워크 환경설정 > 앱 자동 업데이트를 "자동 업데이트 안함"으로 설정하세요.',
  },
  {
    id: 'low_power',
    label: '저전력 모드 껐습니다',
    autoDetected: true,
    helpText: Platform.OS === 'ios'
      ? '설정 > 배터리 > 저전력 모드를 꺼주세요. 저전력 모드에서는 백그라운드 활동이 제한됩니다.'
      : '설정 > 배터리 > 절전 모드를 꺼주세요.',
  },
  {
    id: 'no_cancel',
    label: '시작 후 되돌릴 수 없음 이해합니다',
    helpText: '챌린지가 시작되면 취소할 수 없으며, 참여금은 성공 시에만 환급됩니다.',
  },
  {
    id: 'responsibility',
    label: '미준수로 인한 실패는 본인 책임입니다',
    helpText: '앱 이탈, 배터리 방전, 네트워크 끊김 등으로 인한 실패는 환불되지 않습니다. (첫 크래시 1회 면제)',
  },
];

const THUMB_SIZE = 56;

export default function ChecklistScreen() {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();
  const { startChallenge: startChallengeContext } = useChallenge();
  const { userData } = useUserProfile();
  const freeTrialDaysLeft = userData?.freeTrialDaysLeft ?? 0;
  const isFreePlay = freeTrialDaysLeft > 0;
  const { width: screenWidth } = useWindowDimensions();
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [selectedAmount, setSelectedAmount] = useState(1000);
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);

  // 자동 감지 상태
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isLowPower, setIsLowPower] = useState<boolean | null>(null);

  // 배터리 + 저전력 모드 자동 감지
  useEffect(() => {
    (async () => {
      try {
        const level = await Battery.getBatteryLevelAsync();
        const lowPower = await Battery.isLowPowerModeEnabledAsync();
        setBatteryLevel(level);
        setIsLowPower(lowPower);

        // 배터리 50% 이상이면 자동 체크
        if (level >= 0.5) {
          setChecks((prev) => ({ ...prev, battery: true }));
        }
        // 저전력 모드 꺼져있으면 자동 체크
        if (!lowPower) {
          setChecks((prev) => ({ ...prev, low_power: true }));
        }
      } catch {
        // 시뮬레이터 등에서는 감지 불가 → 수동 체크 허용
      }
    })();
  }, []);

  const allChecked = CHECK_ITEMS.every((item) => checks[item.id]);
  const canStart = allChecked;

  const sliderWidth = screenWidth - 48 - 40 - 2;

  // Refs (PanResponder stale closure 방지)
  const canStartRef = useRef(canStart);
  const startedRef = useRef(started);
  const sliderWidthRef = useRef(sliderWidth);
  const handleStartRef = useRef<() => void>(() => {});
  canStartRef.current = canStart;
  startedRef.current = started;
  sliderWidthRef.current = sliderWidth;

  const slideX = useRef(new Animated.Value(0)).current;

  const handleChallengeStart = async () => {
    if (!user) {
      Alert.alert('오류', '로그인이 필요합니다.');
      return;
    }

    // 서버 시간 동기화 + 자동 시간 설정 검증
    // Expo managed workflow에서는 OS 자동 시간 설정 여부를 직접 감지할 수 없으므로,
    // 서버-로컬 시간 차이(drift)로 자동 시간 비활성화를 간접 감지한다.
    if (!isServerTimeSynced()) {
      // 서버 시간 동기화 실패 → 재시도
      const { syncServerTime } = await import('../utils/serverTime');
      await syncServerTime();
    }

    if (!isServerTimeSynced()) {
      Alert.alert(
        '서버 연결 필요',
        '서버 시간을 확인할 수 없습니다.\n인터넷 연결을 확인 후 다시 시도해주세요.',
      );
      Animated.spring(slideX, { toValue: 0, useNativeDriver: true }).start();
      return;
    }

    if (getTimeDriftMinutes() > AppConfig.timeDriftMaxMinutes) {
      Alert.alert(
        '시간 설정 오류',
        '기기의 시간이 서버와 5분 이상 차이납니다.\n' +
        (Platform.OS === 'ios'
          ? '설정 > 일반 > 날짜 및 시간 > "자동으로 설정"을 켜주세요.'
          : '설정 > 시스템 > 날짜 및 시간 > "자동 날짜 및 시간"을 켜주세요.'),
      );
      Animated.spring(slideX, { toValue: 0, useNativeDriver: true }).start();
      return;
    }

    // 알림 권한 확인
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      const { status: newStatus } = await Notifications.requestPermissionsAsync();
      if (newStatus !== 'granted') {
        Alert.alert(
          '알림 권한 필요',
          '챌린지 진행 중 유예 알림을 받으려면 알림 권한이 필요합니다.\n설정에서 알림을 허용해주세요.',
        );
        Animated.spring(slideX, { toValue: 0, useNativeDriver: true }).start();
        return;
      }
    }

    // 방해금지 모드 경고 (차단은 아님)
    try {
      const settings = await Notifications.getPermissionsAsync();
      // iOS: 알림은 허용이지만 소리/배너가 꺼져있으면 DND 가능성
      if (settings.ios?.allowsSound === false || settings.ios?.allowsAlert === false) {
        Alert.alert(
          '방해금지 모드 확인',
          '방해금지 모드가 켜져있을 수 있습니다.\n챌린지 중 유예 알림을 받지 못하면 실패할 수 있으니 확인해주세요.',
          [{ text: '확인했습니다' }],
        );
      }
    } catch {
      // 무시
    }

    // 배터리 재확인
    try {
      const level = await Battery.getBatteryLevelAsync();
      if (level < 0.5) {
        Alert.alert('배터리 부족', `현재 배터리 ${Math.round(level * 100)}%입니다.\n50% 이상 충전 후 참여해주세요.`);
        Animated.spring(slideX, { toValue: 0, useNativeDriver: true }).start();
        return;
      }
    } catch {
      // 감지 불가 시 통과
    }

    // 저전력 모드 재확인
    try {
      const lowPower = await Battery.isLowPowerModeEnabledAsync();
      if (lowPower) {
        Alert.alert('저전력 모드', '저전력 모드가 켜져 있습니다.\n꺼주신 후 다시 시도해주세요.');
        Animated.spring(slideX, { toValue: 0, useNativeDriver: true }).start();
        return;
      }
    } catch {
      // 감지 불가 시 통과
    }

    // '되돌릴 수 없습니다' 최종 확인
    const confirmMessage = isFreePlay
      ? '무료 체험으로 참여합니다.\n시작 후에는 되돌릴 수 없습니다.'
      : `참여금 ${selectedAmount.toLocaleString()}원이 차감됩니다.\n시작 후에는 되돌릴 수 없습니다.`;
    Alert.alert(
      '챌린지를 시작할까요?',
      confirmMessage,
      [
        {
          text: '취소',
          style: 'cancel',
          onPress: () => {
            Animated.spring(slideX, { toValue: 0, useNativeDriver: true }).start();
          },
        },
        {
          text: '시작하기',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const challengeAmount = isFreePlay ? 0 : selectedAmount;
              const result = await startChallenge(challengeAmount);
              setStarted(true);
              startChallengeContext(result.challengeId);
              navigation.navigate('Challenge', { challengeId: result.challengeId });
            } catch (error: any) {
              const msg = error.message || '잠시 후 다시 시도해주세요.';
              const isBalanceError = msg.includes('잔액');
              Alert.alert(
                '챌린지 시작 실패',
                msg,
                isBalanceError
                  ? [
                      { text: '닫기', style: 'cancel' },
                      { text: '충전하기', onPress: () => navigation.navigate('Profile') },
                    ]
                  : [{ text: '확인' }],
              );
              Animated.spring(slideX, { toValue: 0, useNativeDriver: true }).start();
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  // ref 업데이트 (PanResponder에서 최신 함수 참조)
  handleStartRef.current = handleChallengeStart;

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => canStartRef.current && !startedRef.current,
        onMoveShouldSetPanResponder: () => canStartRef.current && !startedRef.current,
        onPanResponderMove: (_, gestureState) => {
          const w = sliderWidthRef.current;
          const x = Math.max(0, Math.min(gestureState.dx, w - THUMB_SIZE));
          slideX.setValue(x);
        },
        onPanResponderRelease: (_, gestureState) => {
          const w = sliderWidthRef.current;
          const threshold = w * 0.45;
          if (gestureState.dx >= threshold) {
            Animated.spring(slideX, {
              toValue: w - THUMB_SIZE,
              useNativeDriver: true,
            }).start(() => {
              handleStartRef.current();
            });
          } else {
            Animated.spring(slideX, {
              toValue: 0,
              useNativeDriver: true,
            }).start();
          }
        },
      }),
    [slideX],
  );

  const toggleAll = () => {
    const allCurrentlyChecked = CHECK_ITEMS.every((item) => checks[item.id]);
    const newChecks: Record<string, boolean> = {};
    CHECK_ITEMS.forEach((item) => {
      // 배터리 부족/저전력 켜짐이면 자동감지 항목 체크 차단
      if (item.id === 'battery' && batteryLevel !== null && batteryLevel < 0.5) {
        newChecks[item.id] = false;
        return;
      }
      if (item.id === 'low_power' && isLowPower === true) {
        newChecks[item.id] = false;
        return;
      }
      newChecks[item.id] = !allCurrentlyChecked;
    });
    setChecks(newChecks);
  };

  const toggleItem = (id: string) => {
    // 자동 감지 항목이 조건 미달이면 체크 차단
    if (id === 'battery' && batteryLevel !== null && batteryLevel < 0.5) {
      Alert.alert('배터리 부족', `현재 배터리 ${Math.round(batteryLevel * 100)}%입니다.\n50% 이상 충전해주세요.`);
      return;
    }
    if (id === 'low_power' && isLowPower === true) {
      Alert.alert('저전력 모드', '저전력 모드가 켜져 있습니다.\n설정에서 꺼주세요.');
      return;
    }
    setChecks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const showHelp = (item: CheckItem) => {
    if (item.helpText) {
      Alert.alert(item.label, item.helpText);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 헤더 */}
        <Text variant="h1" style={{ marginBottom: 4 }}>참전 준비</Text>
        <Text variant="body" color={Colors.textSub} style={{ marginBottom: Spacing.sectionGap }}>
          아래 항목을 모두 확인해주세요
        </Text>

        {/* 금액 선택 */}
        <Text variant="h2" style={{ marginBottom: 12 }}>참여 금액</Text>
        {isFreePlay ? (
          <Card style={{ borderColor: Colors.green + '40' }}>
            <Text variant="body" color={Colors.green} style={{ fontWeight: '600' }}>
              무료 체험 ({freeTrialDaysLeft}일 남음)
            </Text>
            <Text variant="caption" color={Colors.textSub} style={{ marginTop: 4 }}>
              무료 포인트로 참여합니다. 금액 선택 없이 바로 시작하세요!
            </Text>
          </Card>
        ) : (
          <AmountSelector
            selectedAmount={selectedAmount}
            onSelect={setSelectedAmount}
          />
        )}

        {/* 체크리스트 */}
        <Text variant="h2" style={{ marginTop: Spacing.sectionGap, marginBottom: 12 }}>
          체크리스트
        </Text>

        {/* 전체 동의 */}
        <ChecklistItem
          label="전체 동의"
          checked={allChecked}
          onToggle={toggleAll}
        />

        <View style={styles.divider} />

        {/* 개별 항목 */}
        {CHECK_ITEMS.map((item) => (
          <View key={item.id} style={{ marginBottom: Spacing.elementGap }}>
            <ChecklistItem
              label={item.label}
              checked={!!checks[item.id]}
              onToggle={() => toggleItem(item.id)}
              autoDetected={item.autoDetected}
              onHelp={item.helpText ? () => showHelp(item) : undefined}
            />
          </View>
        ))}
      </ScrollView>

      {/* 슬라이드 시작 버튼 */}
      <View style={styles.bottom}>
        <Card style={[styles.sliderTrack, !canStart && styles.sliderDisabled]}>
          <Animated.View
            style={[
              styles.sliderThumb,
              { transform: [{ translateX: slideX }] },
              !canStart && { backgroundColor: Colors.textDisabled },
            ]}
            {...panResponder.panHandlers}
          >
            {loading ? (
              <ActivityIndicator color={Colors.bgPrimary} />
            ) : (
              <Text variant="h2" color={Colors.bgPrimary}>→</Text>
            )}
          </Animated.View>
          <Text
            variant="body"
            color={canStart ? Colors.textSub : Colors.textDisabled}
            style={styles.sliderLabel}
          >
            {loading ? '시작하는 중...' : canStart ? '밀어서 챌린지 시작' : '체크리스트를 완료하세요'}
          </Text>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.screenPadding,
    paddingBottom: 120,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
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
  sliderTrack: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    padding: 4,
  },
  sliderDisabled: {
    opacity: 0.5,
  },
  sliderThumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: 12,
    backgroundColor: Colors.green,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  sliderLabel: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
  },
});
