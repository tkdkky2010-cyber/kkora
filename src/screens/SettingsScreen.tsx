import { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import appJson from '../../app.json';
import { Text } from '../components/atoms/Text';
import { Card } from '../components/atoms/Card';
import { Toggle } from '../components/atoms/Toggle';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { useAuth } from '../contexts/AuthContext';
import { deleteAccount } from '../services/firebase/functions';

interface SettingRowProps {
  label: string;
  description?: string;
  right: React.ReactNode;
}

function SettingRow({ label, description, right }: SettingRowProps) {
  return (
    <View style={styles.settingRow}>
      <View style={{ flex: 1 }}>
        <Text variant="body">{label}</Text>
        {description && (
          <Text variant="caption" color={Colors.textSub} style={{ marginTop: 2 }}>
            {description}
          </Text>
        )}
      </View>
      {right}
    </View>
  );
}

const SETTINGS_KEYS = {
  lockScreen: '@kkora_lock_screen',
  pushNotification: '@kkora_push_notification',
  reminderNotification: '@kkora_reminder_notification',
};

export default function SettingsScreen() {
  const [lockScreen, setLockScreen] = useState(false);
  const [pushNotification, setPushNotification] = useState(true);
  const [reminderNotification, setReminderNotification] = useState(true);
  const { logOut } = useAuth();

  const appVersion = appJson.expo?.version ?? '1.0.0';

  // 설정 로드
  useEffect(() => {
    AsyncStorage.multiGet([
      SETTINGS_KEYS.lockScreen,
      SETTINGS_KEYS.pushNotification,
      SETTINGS_KEYS.reminderNotification,
    ]).then((values) => {
      if (values[0][1] !== null) setLockScreen(values[0][1] === 'true');
      if (values[1][1] !== null) setPushNotification(values[1][1] === 'true');
      if (values[2][1] !== null) setReminderNotification(values[2][1] === 'true');
    });
  }, []);

  const updateSetting = (key: string, value: boolean, setter: (v: boolean) => void) => {
    setter(value);
    AsyncStorage.setItem(key, String(value));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text variant="h1" style={{ marginTop: 44, marginBottom: Spacing.sectionGap }}>설정</Text>

        {/* 잠금화면 */}
        <Text variant="h2" style={{ marginBottom: 12 }}>잠금화면</Text>
        <Card style={{ marginBottom: Spacing.sectionGap }}>
          <SettingRow
            label="잠금화면 위젯"
            description="남은 시간 + 생존자 수 표시"
            right={<Toggle value={lockScreen} onToggle={(v) => updateSetting(SETTINGS_KEYS.lockScreen, v, setLockScreen)} />}
          />
        </Card>

        {/* 알림 */}
        <Text variant="h2" style={{ marginBottom: 12 }}>알림</Text>
        <Card style={{ marginBottom: Spacing.sectionGap }}>
          <SettingRow
            label="결과 알림"
            description="아침 7시 챌린지 결과"
            right={<Toggle value={pushNotification} onToggle={(v) => updateSetting(SETTINGS_KEYS.pushNotification, v, setPushNotification)} />}
          />
          <View style={styles.divider} />
          <SettingRow
            label="리마인더"
            description="밤 9:30 참전 알림"
            right={<Toggle value={reminderNotification} onToggle={(v) => updateSetting(SETTINGS_KEYS.reminderNotification, v, setReminderNotification)} />}
          />
        </Card>

        {/* 고객센터 */}
        <Text variant="h2" style={{ marginBottom: 12 }}>고객센터</Text>
        <Card style={{ marginBottom: Spacing.sectionGap }}>
          <TouchableOpacity style={styles.linkRow} activeOpacity={0.7} onPress={() => Alert.alert('1:1 문의', '이메일: support@kkora.kr\n\n문의 사항을 이메일로 보내주시면 영업일 기준 1~2일 내에 답변드립니다.')}>
            <Text variant="body">1:1 문의</Text>
            <Text variant="body" color={Colors.textSub}>{'>'}</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.linkRow} activeOpacity={0.7} onPress={() => Alert.alert('자주 묻는 질문', '챌린지는 매일 밤 10시~자정에 참여할 수 있습니다.\n\n성공 시 원금 100% 환급 + 상금을 받습니다.\n\n실패 시 참여금이 몰수됩니다.\n\n최초 3일은 무료로 체험할 수 있습니다.')}>
            <Text variant="body">자주 묻는 질문</Text>
            <Text variant="body" color={Colors.textSub}>{'>'}</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.linkRow} activeOpacity={0.7} onPress={() => Alert.alert('서비스 이용약관', '서비스 이용약관은 앱 정식 출시 전에 웹페이지로 제공될 예정입니다.\n\n문의: support@kkora.kr')}>
            <Text variant="body">서비스 이용약관</Text>
            <Text variant="body" color={Colors.textSub}>{'>'}</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.linkRow} activeOpacity={0.7} onPress={() => Alert.alert('개인정보 처리방침', '개인정보 처리방침은 앱 정식 출시 전에 웹페이지로 제공될 예정입니다.\n\n문의: support@kkora.kr')}>
            <Text variant="body">개인정보 처리방침</Text>
            <Text variant="body" color={Colors.textSub}>{'>'}</Text>
          </TouchableOpacity>
        </Card>

        {/* 앱 정보 */}
        <Card>
          <View style={styles.settingRow}>
            <Text variant="body">앱 버전</Text>
            <Text variant="body" color={Colors.textSub}>{appVersion}</Text>
          </View>
        </Card>

        {/* 로그아웃 / 탈퇴 */}
        <TouchableOpacity style={styles.dangerButton} activeOpacity={0.7} onPress={() => {
          Alert.alert('로그아웃', '정말 로그아웃하시겠어요?', [
            { text: '취소', style: 'cancel' },
            { text: '로그아웃', style: 'destructive', onPress: logOut },
          ]);
        }}>
          <Text variant="body" color={Colors.red}>로그아웃</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dangerButton} activeOpacity={0.7} onPress={() => {
          Alert.alert(
            '회원 탈퇴',
            '탈퇴 시 잔액은 전액 환불됩니다.\n정말 탈퇴하시겠어요?',
            [
              { text: '취소', style: 'cancel' },
              {
                text: '탈퇴하기',
                style: 'destructive',
                onPress: async () => {
                  try {
                    const { refundedAmount } = await deleteAccount();
                    await logOut();
                    Alert.alert(
                      '탈퇴 완료',
                      refundedAmount > 0
                        ? `${refundedAmount.toLocaleString()}원이 환불 처리됩니다.`
                        : '계정이 삭제되었습니다.',
                    );
                  } catch (error: any) {
                    Alert.alert('탈퇴 실패', error.message || '잠시 후 다시 시도해주세요.');
                  }
                },
              },
            ],
          );
        }}>
          <Text variant="caption" color={Colors.textDisabled}>회원 탈퇴</Text>
        </TouchableOpacity>
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
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  dangerButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
});
