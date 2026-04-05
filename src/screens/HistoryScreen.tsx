import { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../components/atoms/Text';
import { Card } from '../components/atoms/Card';
import { Badge } from '../components/atoms/Badge';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';

// Mock 히스토리 데이터
const MOCK_HISTORY = [
  { date: '2026-04-04', status: 'success' as const, amount: 5000, earnings: 1410 },
  { date: '2026-04-03', status: 'success' as const, amount: 5000, earnings: 890 },
  { date: '2026-04-02', status: 'failed' as const, amount: 5000, earnings: -5000 },
  { date: '2026-04-01', status: 'success' as const, amount: 1000, earnings: 280 },
  { date: '2026-03-31', status: 'success' as const, amount: 10000, earnings: 2800 },
  { date: '2026-03-30', status: 'success' as const, amount: 5000, earnings: 1120 },
];

const MONTH_NAMES = [
  '1월', '2월', '3월', '4월', '5월', '6월',
  '7월', '8월', '9월', '10월', '11월', '12월',
];

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export default function HistoryScreen() {
  const now = new Date();
  const [year] = useState(now.getFullYear());
  const [month] = useState(now.getMonth());

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);

  // 날짜별 상태 매핑
  const dateStatusMap = new Map<number, 'success' | 'failed'>();
  MOCK_HISTORY.forEach((item) => {
    const d = new Date(item.date);
    if (d.getFullYear() === year && d.getMonth() === month) {
      dateStatusMap.set(d.getDate(), item.status);
    }
  });

  // 월간 수익 합계
  const monthlyEarnings = MOCK_HISTORY
    .filter((item) => {
      const d = new Date(item.date);
      return d.getFullYear() === year && d.getMonth() === month;
    })
    .reduce((sum, item) => sum + item.earnings, 0);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text variant="h1" style={{ marginBottom: 4 }}>기록</Text>
        <Text variant="body" color={Colors.textSub} style={{ marginBottom: Spacing.sectionGap }}>
          나의 수면 챌린지 히스토리
        </Text>

        {/* 월 표시 */}
        <Text variant="h2" style={{ marginBottom: 16 }}>
          {year}년 {MONTH_NAMES[month]}
        </Text>

        {/* 캘린더 */}
        <Card style={{ marginBottom: Spacing.cardGap }}>
          {/* 요일 헤더 */}
          <View style={styles.calendarRow}>
            {DAY_LABELS.map((day) => (
              <View key={day} style={styles.calendarCell}>
                <Text variant="badge" color={Colors.textSub}>{day}</Text>
              </View>
            ))}
          </View>

          {/* 날짜 그리드 */}
          {(() => {
            const rows: React.ReactElement[] = [];
            let cells: React.ReactElement[] = [];

            // 빈 칸
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
                // 마지막 줄 빈 셀 채우기
                while (cells.length < 7) {
                  cells.push(<View key={`pad-${cells.length}`} style={styles.calendarCell} />);
                }
                rows.push(
                  <View key={`row-${day}`} style={styles.calendarRow}>
                    {cells}
                  </View>,
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
            {monthlyEarnings >= 0 ? '+' : ''}
            {monthlyEarnings.toLocaleString()}원
          </Text>
        </Card>

        {/* 상세 내역 */}
        <Text variant="h2" style={{ marginBottom: 12 }}>상세 내역</Text>
        {MOCK_HISTORY.map((item, index) => (
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
                color={item.earnings >= 0 ? Colors.green : Colors.red}
              >
                {item.earnings >= 0 ? '+' : ''}{item.earnings.toLocaleString()}원
              </Text>
            </View>
          </Card>
        ))}
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
    gap: 8,
  },
});
