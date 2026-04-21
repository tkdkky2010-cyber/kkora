import { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../components/atoms/Text';
import { Button } from '../components/atoms/Button';
import { Card } from '../components/atoms/Card';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { submitDispute } from '../services/firebase/functions';
import { RootStackParamList } from '../types/navigation';

type Nav = NativeStackNavigationProp<RootStackParamList, 'DisputeSubmit'>;
type Route = RouteProp<RootStackParamList, 'DisputeSubmit'>;

type DisputeType = 'challenge_result' | 'payment' | 'refund' | 'other';

const TYPE_LABELS: Record<DisputeType, string> = {
  challenge_result: '챌린지 판정 이의',
  payment: '결제 관련',
  refund: '환불 관련',
  other: '기타',
};

export default function DisputeSubmitScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const challengeId = route.params?.challengeId;

  const [type, setType] = useState<DisputeType>(challengeId ? 'challenge_result' : 'other');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const trimmed = reason.trim();
    if (trimmed.length < 5) {
      Alert.alert('알림', '사유를 5자 이상 입력해주세요.');
      return;
    }
    if (trimmed.length > 2000) {
      Alert.alert('알림', '사유는 2000자 이하로 작성해주세요.');
      return;
    }
    setLoading(true);
    try {
      await submitDispute({
        challengeId: type === 'challenge_result' ? challengeId ?? null : null,
        type,
        reason: trimmed,
      });
      Alert.alert('접수 완료', '24시간 이내에 검토 결과를 알려드립니다.', [
        { text: '확인', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert('오류', e?.message || '이의 제기 접수에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="chevron-back" size={28} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text variant="h2">이의 제기</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Card style={{ marginBottom: Spacing.cardGap }}>
            <Text variant="body" style={{ fontWeight: '600', marginBottom: 12 }}>
              유형 선택
            </Text>
            <View style={styles.typeRow}>
              {(Object.keys(TYPE_LABELS) as DisputeType[]).map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setType(t)}
                  style={[
                    styles.typeChip,
                    type === t && styles.typeChipActive,
                  ]}
                  activeOpacity={0.8}
                >
                  <Text
                    variant="caption"
                    color={type === t ? Colors.bgPrimary : Colors.textSub}
                    style={{ fontWeight: type === t ? '700' : '400' }}
                  >
                    {TYPE_LABELS[t]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          <Card style={{ marginBottom: Spacing.cardGap }}>
            <Text variant="body" style={{ fontWeight: '600', marginBottom: 12 }}>
              사유 (5~2000자)
            </Text>
            <TextInput
              value={reason}
              onChangeText={setReason}
              placeholder="어떤 일이 있었는지 자세히 적어주세요."
              placeholderTextColor={Colors.textDisabled}
              multiline
              style={styles.textArea}
              textAlignVertical="top"
              maxLength={2000}
            />
            <Text
              variant="caption"
              color={Colors.textDisabled}
              style={{ textAlign: 'right', marginTop: 6 }}
            >
              {reason.length} / 2000
            </Text>
          </Card>

          <View style={styles.noticeBox}>
            <Text variant="caption" color={Colors.textSub} style={{ lineHeight: 20 }}>
              {'• 자동 판정 시 즉시 결과 안내\n• 수동 검토는 24시간 이내 응답\n• 허위 신고 누적 시 참여 제한'}
            </Text>
          </View>
        </ScrollView>

        <View style={styles.bottom}>
          <Button
            label={loading ? '접수 중...' : '이의 제기 접수'}
            onPress={handleSubmit}
            disabled={loading || reason.trim().length < 5}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPrimary },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: 14,
  },
  content: {
    padding: Spacing.screenPadding,
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgElevated,
  },
  typeChipActive: {
    backgroundColor: Colors.green,
    borderColor: Colors.green,
  },
  textArea: {
    minHeight: 140,
    color: Colors.textPrimary,
    fontSize: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  noticeBox: {
    padding: 14,
    backgroundColor: Colors.bgElevated,
    borderRadius: 12,
  },
  bottom: {
    padding: Spacing.screenPadding,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
