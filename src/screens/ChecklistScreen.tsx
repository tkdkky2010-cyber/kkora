import { useState, useRef } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  ScrollView,
  Animated,
  PanResponder,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text } from '../components/atoms/Text';
import { Card } from '../components/atoms/Card';
import { ChecklistItem } from '../components/molecules/ChecklistItem';
import { AmountSelector } from '../components/molecules/AmountSelector';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { RootStackParamList } from '../types/navigation';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Checklist'>;

interface CheckItem {
  id: string;
  label: string;
  autoDetected?: boolean;
}

const CHECK_ITEMS: CheckItem[] = [
  { id: 'auto_clean', label: '앱 자동 정리 프로그램 껐습니다' },
  { id: 'battery', label: '배터리 50% 이상입니다', autoDetected: true },
  { id: 'auto_update', label: '앱 자동 업데이트 껐습니다' },
  { id: 'low_power', label: '저전력 모드 껐습니다', autoDetected: true },
  { id: 'no_cancel', label: '시작 후 되돌릴 수 없음 이해합니다' },
  { id: 'responsibility', label: '미준수로 인한 실패는 본인 책임입니다' },
];

const SLIDE_THRESHOLD = 120;
const SLIDER_WIDTH = 280;
const THUMB_SIZE = 56;

export default function ChecklistScreen() {
  const navigation = useNavigation<Nav>();
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [selectedAmount, setSelectedAmount] = useState(1000);
  const [started, setStarted] = useState(false);

  const allChecked = CHECK_ITEMS.every((item) => checks[item.id]);
  const canStart = allChecked;

  // Slide-to-start
  const slideX = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => canStart && !started,
      onMoveShouldSetPanResponder: () => canStart && !started,
      onPanResponderMove: (_, gestureState) => {
        const x = Math.max(0, Math.min(gestureState.dx, SLIDER_WIDTH - THUMB_SIZE));
        slideX.setValue(x);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx >= SLIDE_THRESHOLD) {
          Animated.spring(slideX, {
            toValue: SLIDER_WIDTH - THUMB_SIZE,
            useNativeDriver: true,
          }).start(() => {
            setStarted(true);
            navigation.navigate('Challenge', { challengeId: 'mock-' + Date.now() });
          });
        } else {
          Animated.spring(slideX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  const toggleAll = () => {
    const allCurrentlyChecked = CHECK_ITEMS.every((item) => checks[item.id]);
    const newChecks: Record<string, boolean> = {};
    CHECK_ITEMS.forEach((item) => {
      newChecks[item.id] = !allCurrentlyChecked;
    });
    setChecks(newChecks);
  };

  const toggleItem = (id: string) => {
    setChecks((prev) => ({ ...prev, [id]: !prev[id] }));
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
        <AmountSelector
          selectedAmount={selectedAmount}
          onSelect={setSelectedAmount}
        />

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
            <Text variant="h2" color={Colors.bgPrimary}>→</Text>
          </Animated.View>
          <Text
            variant="body"
            color={canStart ? Colors.textSub : Colors.textDisabled}
            style={styles.sliderLabel}
          >
            {canStart ? '밀어서 챌린지 시작' : '체크리스트를 완료하세요'}
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
    paddingBottom: 32,
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
