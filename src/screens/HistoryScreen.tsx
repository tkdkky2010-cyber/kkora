import { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase/config';
import { Text } from '../components/atoms/Text';
import { Card } from '../components/atoms/Card';
import { Badge } from '../components/atoms/Badge';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { useAuth } from '../contexts/AuthContext';
import { getServerNow } from '../utils/serverTime';

const MONTH_NAMES = [
  '1월', '2월', '3월', '4월', '5월', '6월',
  '7월', '8월', '9월', '10월', '11월', '12월',
];

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

interface HistoryItem {
  date: string;
  status: 'success' | 'failed';
  amount: number;
  earnings: number;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export default function HistoryScreen() {
  const now = getServerNow();
  const { user } = useAuth();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const goToPrevMonth = () => {
    if (month === 0) { setYear(year - 1); setMonth(11); }
    else { setMonth(month - 1); }
  };

  const goToNextMonth = () => {
    const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();
    if (isCurrentMonth) return;
    if (month === 11) { setYear(year + 1); setMonth(0); }
    else { setMonth(month + 1); }
  };

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();

  // Firestore에서 해당 월 챌린지 조회
  useEffect(() => {
    if (!user) return;

    setLoading(true);
    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(getDaysInMonth(year, month)).padStart(2, '0')}`;

    const q = query(
      collection(db, 'challenges'),
      where('userId', '==', user.uid),
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'desc'),
    );

    getDocs(q)
      .then((snapshot) => {
        const items: HistoryItem[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.status === 'success' || data.status === 'failed') {
            items.push({
              date: data.date,
              status: data.status,
              amount: data.amount || 0,
              earnings: data.earnings || 0,
            });
          }
        });
        setHistory(items);
      })
      .catch(() => {
        setHistory([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user, year, month]);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);

  // 날짜별 상태 매핑 (YYYY-MM-DD 문자열에서 직접 파싱 — 시간대 이슈 방지)
  const dateStatusMap = new Map<number, 'success' | 'failed'>();
  history.forEach((item) => {
    const parts = item.date.split('-');
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    if (y === year && m === month) {
      dateStatusMap.set(day, item.status);
    }
  });

  // 월간 수익 합계
  const monthlyEarnings = history.reduce((sum, item) => {
    if (item.status === 'success') return sum + item.earnings;
    if (item.status === 'failed') return sum - item.amount;
    return sum;
  }, 0);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text variant="h1" style={{ marginTop: 44, marginBottom: 4 }}>기록</Text>
        <Text variant="body" color={Colors.textSub} style={{ marginBottom: Spacing.sectionGap }}>
          나의 수면 챌린지 히스토리
        </Text>

        {/* 월 선택 */}
        <View style={styles.monthNav}>
          <TouchableOpacity
            onPress={goToPrevMonth}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.monthNavButton}
          >
            <Text variant="h2" color={Colors.textPrimary}>{'<'}</Text>
          </TouchableOpacity>
          <Text variant="h2">{year}년 {MONTH_NAMES[month]}</Text>
          <TouchableOpacity
            onPress={goToNextMonth}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.monthNavButton}
            disabled={isCurrentMonth}
          >
            <Text variant="h2" color={isCurrentMonth ? Colors.textDisabled : Colors.textPrimary}>
              {'>'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 캘린더 */}
        <Card style={{ marginBottom: Spacing.cardGap }}>
          <View style={styles.calendarRow}>
            {DAY_LABELS.map((day) => (
              <View key={day} style={styles.calendarCell}>
                <Text variant="badge" color={Colors.textSub}>{day}</Text>
              </View>
            ))}
          </View>

          {(() => {
            const rows: React.ReactElement[] = [];
            let cells: React.ReactElement[] = [];

            for (let i = 0; i < firstDay; i++) {
              cells.push(<View key={`empty-${i}`} style={styles.calendarCell} />);
            }

            for (let day = 1; day <= daysInMonth; day++) {
              const status = dateStatusMap.get(day);
              cells.push(
                <View key={day} style={styles.calendarCell}>
                  <View
                    style={[
                      styles.dayCircle,
                      status === 'success' && styles.daySuccess,
                      status === 'failed' && styles.dayFailed,
                    ]}
                  >
                    <Text
                      variant="caption"
                      color={status ? Colors.bgPrimary : Colors.textPrimary}
                    >
                      {day}
                    </Text>
                  </View>
                </View>,
              );

              if ((firstDay + day) % 7 === 0 || day === daysInMonth) {
                while (cells.length < 7) {
                  cells.push(<View key={`pad-${cells.length}`} style={styles.calendarCell} />);
                }
                rows.push(
                  <View key={`row-${day}`} style={styles.calendarRow}>{cells}</View>,
                );
                cells = [];
              }
            }
            return rows;
          })()}
        </Card>

        {/* 월간 요약 */}
        <Card style={{ marginBottom: Spacing.cardGap }}>
          <Text variant="caption" color={Colors.textSub} style={{ marginBottom: 4 }}>
            이번 달 수익
          </Text>
          <Text
            variant="h2"
            color={monthlyEarnings >= 0 ? Colors.green : Colors.red}
          >
            {monthlyEarnings >= 0 ? '+' : ''}{monthlyEarnings.toLocaleString()}원
          </Text>
        </Card>

        {/* 상세 내역 */}
        <Text variant="h2" style={{ marginBottom: 12 }}>상세 내역</Text>

        {loading ? (
          <View style={{ paddingVertical: 32, alignItems: 'center' }}>
            <ActivityIndicator color={Colors.green} />
          </View>
        ) : history.length === 0 ? (
          <View style={{ paddingVertical: 32, alignItems: 'center' }}>
            <Text variant="body" color={Colors.textSub}>이번 달 기록이 없습니다</Text>
          </View>
        ) : (
          history.map((item, index) => (
            <Card key={index} style={{ marginBottom: Spacing.elementGap }}>
              <View style={styles.historyRow}>
                <View style={{ flex: 1 }}>
                  <View style={styles.historyLeft}>
                    <Text variant="body">{item.date}</Text>
                    <Badge
                      label={item.status === 'success' ? '성공' : '실패'}
                      color={item.status === 'success' ? Colors.green : Colors.red}
                    />
                  </View>
                  <Text variant="caption" color={Colors.textSub} style={{ marginTop: 4 }}>
                    참여금 {item.amount.toLocaleString()}원
                  </Text>
                </View>
                <Text
                  variant="h2"
                  color={item.status === 'success' ? Colors.green : Colors.red}
                >
                  {item.status === 'success' ? '+' : '-'}
                  {(item.status === 'success' ? item.earnings : item.amount).toLocaleString()}원
                </Text>
              </View>
            </Card>
          ))
        )}
      </ScrollView>
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
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.cardGap,
  },
  monthNavButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  calendarCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  daySuccess: {
    backgroundColor: Colors.green,
  },
  dayFailed: {
    backgroundColor: Colors.red,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.elementGap,
  },
});
