import { useState } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../components/atoms/Text';
import { Button } from '../components/atoms/Button';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { useAuth } from '../contexts/AuthContext';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await signIn();
      // 로그인 성공 시 AuthContext가 user 변경 → AppNavigator가 자동으로 Home 표시
    } catch (error) {
      Alert.alert('로그인 실패', '잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={{ fontSize: 64, marginBottom: 16 }}>🌙</Text>
        <Text variant="h1" color={Colors.green} style={{ marginBottom: 8 }}>꺼라</Text>
        <Text variant="body" color={Colors.textSub} style={{ textAlign: 'center' }}>
          폰을 끄면 돈을 번다{'\n'}
          카카오 계정으로 시작하세요
        </Text>
      </View>
      <View style={styles.bottom}>
        <Button
          label="카카오로 시작하기"
          onPress={handleLogin}
          loading={loading}
          style={styles.kakaoButton}
        />
        <Text
          variant="caption"
          color={Colors.textDisabled}
          style={{ textAlign: 'center', marginTop: 16 }}
        >
          시작하면 이용약관 및 개인정보 처리방침에 동의하게 됩니다
        </Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.screenPadding,
  },
  bottom: {
    paddingHorizontal: Spacing.screenPadding,
    paddingBottom: Spacing.screenPaddingBottom,
  },
  kakaoButton: {
    backgroundColor: Colors.kakaoYellow,
    borderRadius: 14,
  },
});
