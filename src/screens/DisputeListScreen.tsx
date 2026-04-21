import { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { auth, db } from '../services/firebase/config';
import { Text } from '../components/atoms/Text';
import { Button } from '../components/atoms/Button';
import { Card } from '../components/atoms/Card';
import { Badge } from '../components/atoms/Badge';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { RootStackParamList } from '../types/navigation';

type Nav = NativeStackNavigationProp<RootStackParamList, 'DisputeList'>;

interface Dispute {
  id: string;
  type: string;
  reason: string;
  status: string;
  resolution: string | null;
  refundAmount: number | null;
  createdAt: Timestamp | null;
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  open: { label: '접수됨', color: Colors.textSub },
  reviewing: { label: '검토 중', color: Colors.gold },
  resolved_approve: { label: '승인', color: Colors.green },
  resolved_reject: { label: '거절', color: Colors.red },
  escalated: { label: '2차 검토', color: Colors.gold },
};

const TYPE_LABEL: Record<string, string> = {
  challenge_result: '챌린지 판정',
  payment: '결제',
  refund: '환불',
  other: '기타',
};

export default function DisputeListScreen() {
  const navigation = useNavigation<Nav>();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'disputes'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(50),
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        setDisputes(
          snap.docs.map((d) => ({
            id: d.id,
            type: d.data().type,
            reason: d.data().reason,
            status: d.data().status,
            resolution: d.data().resolution ?? null,
            refundAmount: d.data().refundAmount ?? null,
            createdAt: d.data().createdAt ?? null,
          })),
        );
        setLoading(false);
      },
      () => setLoading(false),
    );

    return () => unsub();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="chevron-back" size={28} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text variant="h2">이의 제기 내역</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <Text variant="body" color={Colors.textSub} style={{ textAlign: 'center', marginTop: 40 }}>
            불러오는 중...
          </Text>
        ) : disputes.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="document-text-outline" size={48} color={Colors.textDisabled} />
            <Text variant="body" color={Colors.textSub} style={{ marginTop: 12 }}>
              아직 이의 제기 내역이 없습니다
            </Text>
          </View>
        ) : (
          disputes.map((d) => {
            const statusInfo = STATUS_LABEL[d.status] ?? STATUS_LABEL.open;
            const dateStr = d.createdAt
              ? new Date(d.createdAt.toMillis()).toLocaleDateString('ko-KR')
              : '';
            return (
              <Card key={d.id} style={{ marginBottom: Spacing.cardGap }}>
                <View style={styles.cardHeader}>
                  <Badge label={TYPE_LABEL[d.type] ?? d.type} color={Colors.textSub} />
                  <Badge label={statusInfo.label} color={statusInfo.color} />
                </View>
                <Text
                  variant="body"
                  numberOfLines={2}
                  style={{ marginTop: 10 }}
                >
                  {d.reason}
                </Text>
                {d.resolution && (
                  <View style={styles.resolution}>
                    <Text variant="caption" color={Colors.textSub} style={{ fontWeight: '600' }}>
                      판정 결과
                    </Text>
                    <Text variant="caption" color={Colors.textPrimary} style={{ marginTop: 4 }}>
                      {d.resolution}
                    </Text>
                    {d.refundAmount !== null && d.refundAmount > 0 && (
                      <Text variant="caption" color={Colors.green} style={{ marginTop: 4 }}>
                        환불: {d.refundAmount.toLocaleString()}원
                      </Text>
                    )}
                  </View>
                )}
                <Text variant="caption" color={Colors.textDisabled} style={{ marginTop: 8 }}>
                  {dateStr}
                </Text>
              </Card>
            );
          })
        )}
      </ScrollView>

      <View style={styles.bottom}>
        <Button
          label="이의 제기하기"
          onPress={() => navigation.navigate('DisputeSubmit')}
        />
      </View>
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
    flexGrow: 1,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: 8,
  },
  resolution: {
    marginTop: 12,
    padding: 12,
    backgroundColor: Colors.bgElevated,
    borderRadius: 10,
  },
  bottom: {
    padding: Spacing.screenPadding,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
