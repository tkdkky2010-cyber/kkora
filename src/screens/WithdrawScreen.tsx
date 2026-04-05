import { useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  Alert,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text } from '../components/atoms/Text';
import { Button } from '../components/atoms/Button';
import { Card } from '../components/atoms/Card';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { useBalance } from '../hooks/useBalance';
import { BANKS, MIN_WITHDRAWAL } from '../types/payment';
import { requestWithdrawal } from '../services/firebase/functions';
import { RootStackParamList } from '../types/navigation';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Withdraw'>;

export default function WithdrawScreen() {
  const navigation = useNavigation<Nav>();
  const { balance } = useBalance();
  const [amount, setAmount] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [showBankPicker, setShowBankPicker] = useState(false);

  const selectedBank = BANKS.find((b) => b.code === bankCode);
  const amountNum = parseInt(amount, 10) || 0;

  const canSubmit =
    amountNum >= MIN_WITHDRAWAL &&
    amountNum <= balance &&
    bankCode !== '' &&
    accountNumber.length >= 10;

  const handleWithdraw = async () => {
    if (!canSubmit) return;

    Alert.alert(
      '출금 확인',
      `${selectedBank?.name} ${accountNumber}\n${amountNum.toLocaleString()}원을 출금합니다.`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '출금하기',
          onPress: async () => {
            setLoading(true);
            try {
              await requestWithdrawal(amountNum, bankCode, accountNumber);
              Alert.alert(
                '출금 신청 완료',
                '영업일 기준 1~2일 내에 입금됩니다.',
                [{ text: '확인', onPress: () => navigation.goBack() }],
              );
            } catch (error: any) {
              Alert.alert('출금 실패', error.message || '잠시 후 다시 시도해주세요.');
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text variant="h1" style={{ marginTop: 44, marginBottom: Spacing.sectionGap }}>출금</Text>

        {/* 현재 잔액 */}
        <Card style={{ marginBottom: Spacing.sectionGap }}>
          <Text variant="caption" color={Colors.textSub}>출금 가능 잔액</Text>
          <Text variant="largeNumber" color={Colors.green} style={{ marginTop: 4 }}>
            {balance.toLocaleString()}원
          </Text>
        </Card>

        {/* 출금 금액 */}
        <Text variant="h2" style={{ marginBottom: 12 }}>출금 금액</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={(text) => setAmount(text.replace(/[^0-9]/g, ''))}
            placeholder="최소 3,000원"
            placeholderTextColor={Colors.textDisabled}
            keyboardType="number-pad"
          />
          <Text variant="body" color={Colors.textSub}>원</Text>
        </View>
        {amountNum > 0 && amountNum < MIN_WITHDRAWAL && (
          <Text variant="caption" color={Colors.red} style={{ marginTop: 4 }}>
            최소 출금 금액은 {MIN_WITHDRAWAL.toLocaleString()}원입니다
          </Text>
        )}
        {amountNum > balance && (
          <Text variant="caption" color={Colors.red} style={{ marginTop: 4 }}>
            잔액이 부족합니다
          </Text>
        )}

        {/* 은행 선택 */}
        <Text variant="h2" style={{ marginTop: Spacing.sectionGap, marginBottom: 12 }}>계좌 정보</Text>
        <TouchableOpacity
          style={styles.bankSelector}
          onPress={() => setShowBankPicker(!showBankPicker)}
          activeOpacity={0.7}
        >
          <Text variant="body" color={selectedBank ? Colors.textPrimary : Colors.textDisabled}>
            {selectedBank ? selectedBank.name : '은행 선택'}
          </Text>
          <Text variant="body" color={Colors.textSub}>
            {showBankPicker ? '▲' : '▼'}
          </Text>
        </TouchableOpacity>

        {showBankPicker && (
          <Card style={{ marginTop: Spacing.elementGap }}>
            {BANKS.map((bank) => (
              <TouchableOpacity
                key={bank.code}
                style={styles.bankOption}
                onPress={() => {
                  setBankCode(bank.code);
                  setShowBankPicker(false);
                }}
                activeOpacity={0.7}
              >
                <Text
                  variant="body"
                  color={bank.code === bankCode ? Colors.green : Colors.textPrimary}
                >
                  {bank.name}
                </Text>
              </TouchableOpacity>
            ))}
          </Card>
        )}

        {/* 계좌번호 */}
        <View style={[styles.inputContainer, { marginTop: 12 }]}>
          <TextInput
            style={styles.input}
            value={accountNumber}
            onChangeText={(text) => setAccountNumber(text.replace(/[^0-9]/g, ''))}
            placeholder="계좌번호 입력 (- 제외)"
            maxLength={14}
            placeholderTextColor={Colors.textDisabled}
            keyboardType="number-pad"
          />
        </View>
      </ScrollView>

      <View style={styles.bottom}>
        <Button
          label={loading ? '처리 중...' : '출금 신청'}
          onPress={handleWithdraw}
          loading={loading}
          disabled={!canSubmit}
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
    paddingBottom: 120,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    height: 52,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 16,
  },
  bankSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    height: 52,
    paddingHorizontal: 16,
  },
  bankOption: {
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
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
