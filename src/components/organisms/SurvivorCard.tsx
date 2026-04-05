import { View, StyleSheet } from 'react-native';
import { Text } from '../atoms/Text';
import { Card } from '../atoms/Card';
import { Colors } from '../../constants/colors';

interface SurvivorCardProps {
  survivors: number;
  totalParticipants: number;
}

export function SurvivorCard({ survivors, totalParticipants }: SurvivorCardProps) {
  const survivalRate =
    totalParticipants > 0
      ? Math.round((survivors / totalParticipants) * 100)
      : 0;

  return (
    <Card>
      <View style={styles.cardRow}>
        <View>
          <Text variant="caption" color={Colors.textSub}>생존자</Text>
          <Text variant="h2" style={{ marginTop: 4 }}>
            {survivors.toLocaleString()}
            <Text variant="body" color={Colors.textSub}>
              /{totalParticipants.toLocaleString()}명
            </Text>
          </Text>
        </View>
        <View style={styles.rateContainer}>
          <Text variant="h2" color={Colors.green}>{survivalRate}%</Text>
          <Text variant="caption" color={Colors.textSub}>생존률</Text>
        </View>
      </View>

      {/* 생존 바 */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${survivalRate}%` }]} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rateContainer: {
    alignItems: 'flex-end',
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.bgElevated,
    borderRadius: 3,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.green,
    borderRadius: 3,
  },
});
