import { SafeAreaView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text } from '../components/atoms/Text';
import { Button } from '../components/atoms/Button';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { RootStackParamList } from '../types/navigation';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<Nav>();

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
          onPress={() => navigation.navigate('Home')}
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
    paddingBottom: 32,
  },
  kakaoButton: {
    backgroundColor: '#FEE500',
    borderRadius: 14,
  },
});
