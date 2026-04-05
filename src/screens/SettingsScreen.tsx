import { useState } from 'react';
import { SafeAreaView, StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from '../components/atoms/Text';
import { Card } from '../components/atoms/Card';
import { Toggle } from '../components/atoms/Toggle';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';

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

export default function SettingsScreen() {
  const [lockScreen, setLockScreen] = useState(false);
  const [pushNotification, setPushNotification] = useState(true);
  const [reminderNotification, setReminderNotification] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text variant="h1" style={{ marginBottom: Spacing.sectionGap }}>설정</Text>

        {/* 잠금화면 */}
        <Text variant="h2" style={{ marginBottom: 12 }}>잠금화면</Text>
        <Card style={{ marginBottom: Spacing.sectionGap }}>
          <SettingRow
            label="잠금화면 위젯"
            description="남은 시간 + 생존자 수 표시"
            right={<Toggle value={lockScreen} onToggle={setLockScreen} />}
          />
        </Card>

        {/* 알림 */}
        <Text variant="h2" style={{ marginBottom: 12 }}>알림</Text>
        <Card style={{ marginBottom: Spacing.sectionGap }}>
          <SettingRow
            label="결과 알림"
            description="아침 7시 챌린지 결과"
            right={<Toggle value={pushNotification} onToggle={setPushNotification} />}
          />
          <View style={styles.divider} />
          <SettingRow
            label="리마인더"
            description="밤 9:30 참전 알림"
            right={<Toggle value={reminderNotification} onToggle={setReminderNotification} />}
          />
        </Card>

        {/* 고객센터 */}
        <Text variant="h2" style={{ marginBottom: 12 }}>고객센터</Text>
        <Card style={{ marginBottom: Spacing.sectionGap }}>
          <TouchableOpacity style={styles.linkRow} activeOpacity={0.7}>
            <Text variant="body">1:1 문의</Text>
            <Text variant="body" color={Colors.textSub}>{'>'}</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.linkRow} activeOpacity={0.7}>
            <Text variant="body">자주 묻는 질문</Text>
            <Text variant="body" color={Colors.textSub}>{'>'}</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.linkRow} activeOpacity={0.7}>
            <Text variant="body">서비스 이용약관</Text>
            <Text variant="body" color={Colors.textSub}>{'>'}</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.linkRow} activeOpacity={0.7}>
            <Text variant="body">개인정보 처리방침</Text>
            <Text variant="body" color={Colors.textSub}>{'>'}</Text>
          </TouchableOpacity>
        </Card>

        {/* 앱 정보 */}
        <Card>
          <View style={styles.settingRow}>
            <Text variant="body">앱 버전</Text>
            <Text variant="body" color={Colors.textSub}>1.0.0</Text>
          </View>
        </Card>

        {/* 로그아웃 / 탈퇴 */}
        <TouchableOpacity style={styles.dangerButton} activeOpacity={0.7}>
          <Text variant="body" color={Colors.red}>로그아웃</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dangerButton} activeOpacity={0.7}>
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
    paddingBottom: 32,
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
