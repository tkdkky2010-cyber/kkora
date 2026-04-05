import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { Text } from './Text';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';

/**
 * 오프라인 상태 배너.
 * 네트워크가 끊기면 화면 상단에 경고 표시.
 */
export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(!state.isConnected);
    });
    return unsubscribe;
  }, []);

  if (!isOffline) return null;

  return (
    <View style={styles.container}>
      <Text variant="caption" color={Colors.bgPrimary} style={{ fontWeight: '600' }}>
        오프라인 상태입니다. 인터넷 연결을 확인해주세요.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.red,
    paddingVertical: Spacing.elementGap,
    paddingHorizontal: Spacing.screenPadding,
    alignItems: 'center',
  },
});
