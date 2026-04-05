import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '../atoms/Text';
import { Card } from '../atoms/Card';
import { Colors } from '../../constants/colors';

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

interface HistoryCalendarProps {
  year: number;
  month: number;
  dateStatusMap: Map<number, 'success' | 'failed'>;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export function HistoryCalendar({ year, month, dateStatusMap }: HistoryCalendarProps) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);

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

  return (
    <Card>
      {/* 요일 헤더 */}
      <View style={styles.calendarRow}>
        {DAY_LABELS.map((day) => (
          <View key={day} style={styles.calendarCell}>
            <Text variant="badge" color={Colors.textSub}>{day}</Text>
          </View>
        ))}
      </View>
      {rows}
    </Card>
  );
}

const styles = StyleSheet.create({
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
});
