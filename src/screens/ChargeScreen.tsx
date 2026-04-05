import { useState } from 'react';
import { StyleSheet, View, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text } from '../components/atoms/Text';
import { Button } from '../components/atoms/Button';
import { Card } from '../components/atoms/Card';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { useBalance } from '../hooks/useBalance';
import { CHARGE_AMOUNTS } from '../types/payment';
import { requestDeposit } from '../services/firebase/functions';
import { RootStackParamList } from '../types/navigation';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Charge'>;

export default function ChargeScreen() {
  const navigation = useNavigation<Nav>();
  const { balance } = useBalance();
  const [selectedAmount, setSelectedAmount] = useState<number>(CHARGE_AMOUNTS[1]);
  const [loading, setLoading] = useState(false);

  const handleCharge = async () => {
    setLoading(true);
    try {
      await requestDeposit(selectedAmount);
      Alert.alert(
        '충전 완료',
        `${selectedAmount.toLocaleString()}원이 충전되었습니다.`,
        [{ text: '확인', onPress: () => navigation.goBack() }],
      );
    } catch (error: any) {
      Alert.alert('충전 실패', error.message || '잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text variant="h1" style={{ marginTop: 44, marginBottom: Spacing.sectionGap }}>충전</Text>

        {/* 현재 잔액 */}
        <Card style={{ marginBottom: Spacing.sectionGap }}>
          <Text variant="caption" color={Colors.textSub}>현재 잔액</Text>
          <Text variant="largeNumber" color={Colors.green} style={{ marginTop: 4 }}>
            {balance.toLocaleString()}원
          </Text>
        </Card>

        {/* 금액 선택 */}
        <Text variant="h2" style={{ marginBottom: 12 }}>충전 금액</Text>
        <View style={styles.amountGrid}>
          {CHARGE_AMOUNTS.map((amount) => (
            <Card
              key={amount}
              style={[
                styles.amountCard,
                selectedAmount === amount && styles.amountCardSelected,
              ]}
              onPress={() => setSelectedAmount(amount)}
            >
              <Text
                variant="h2"
                color={selectedAmount === amount ? Colors.green : Colors.textPrimary}
              >
                {amount.toLocaleString()}원
              </Text>
            </Card>
          ))}
        </View>
      </View>

      <View style={styles.bottom}>
        <Text variant="caption" color={Colors.textSub} style={{ textAlign: 'center', marginBottom: 12 }}>
          카카오페이로 결제됩니다
        </Text>
        <Button
          label={loading ? '처리 중...' : `${selectedAmount.toLocaleString()}원 충전하기`}
          onPress={handleCharge}
          loading={loading}
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
  content: {
    flex: 1,
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.screenPadding,
  },
  amountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.cardGap,
  },
  amountCard: {
    flexBasis: '46%',
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 20,
  },
  amountCardSelected: {
    borderColor: Colors.green,
    borderWidth: 1,
  },
  bottom: {
    paddingHorizontal: Spacing.screenPadding,
    paddingBottom: Spacing.screenPaddingBottom,
  },
});
