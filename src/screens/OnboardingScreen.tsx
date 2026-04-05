import { useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  Dimensions,
  ViewToken,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text } from '../components/atoms/Text';
import { Button } from '../components/atoms/Button';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { RootStackParamList } from '../types/navigation';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;

const { width } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  emoji: string;
  title: string;
  description: string;
}

const SLIDES: OnboardingSlide[] = [
  {
    id: '1',
    emoji: '📱',
    title: '폰을 끄면\n돈을 번다',
    description: '밤에 폰을 끄고 7시간 이상 자면\n실패자의 돈을 가져옵니다',
  },
  {
    id: '2',
    emoji: '💰',
    title: '실패하면\n돈을 잃는다',
    description: '중간에 폰을 켜면 참여금을 몰수당합니다\n긴장감이 당신의 수면을 지킵니다',
  },
  {
    id: '3',
    emoji: '🏆',
    title: '매일 밤\n전쟁이 시작된다',
    description: '밤 10시 ~ 자정, 참전 가능\n아침 7시에 승자가 결정됩니다',
  },
];

export default function OnboardingScreen() {
  const navigation = useNavigation<Nav>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const isLast = currentIndex === SLIDES.length - 1;

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
  ).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleNext = () => {
    if (isLast) {
      navigation.navigate('Login');
    } else {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    }
  };

  const renderSlide = ({ item }: { item: OnboardingSlide }) => (
    <View style={styles.slide}>
      <Text style={{ fontSize: 80, marginBottom: 24 }}>{item.emoji}</Text>
      <Text variant="h1" style={{ textAlign: 'center', lineHeight: 38, marginBottom: 16 }}>
        {item.title}
      </Text>
      <Text
        variant="body"
        color={Colors.textSub}
        style={{ textAlign: 'center', lineHeight: 24 }}
      >
        {item.description}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />

      {/* Page Indicator */}
      <View style={styles.indicatorRow}>
        {SLIDES.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === currentIndex ? styles.dotActive : styles.dotInactive,
            ]}
          />
        ))}
      </View>

      {/* Bottom */}
      <View style={styles.bottom}>
        <Button
          label={isLast ? '시작하기' : '다음'}
          onPress={handleNext}
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
  slide: {
    width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.screenPadding,
  },
  indicatorRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: Colors.green,
    width: 24,
  },
  dotInactive: {
    backgroundColor: Colors.textDisabled,
  },
  bottom: {
    paddingHorizontal: Spacing.screenPadding,
    paddingBottom: Spacing.screenPaddingBottom,
  },
});
