import { useEffect, useState, useRef } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../types/navigation';
import { Colors } from '../constants/colors';
import { useAuth } from '../contexts/AuthContext';
// syncServerTime은 AuthContext에서 로그인 후 호출됨

import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import ChecklistScreen from '../screens/ChecklistScreen';
import ChallengeScreen from '../screens/ChallengeScreen';
import ResultScreen from '../screens/ResultScreen';
import ProfileScreen from '../screens/ProfileScreen';
import HistoryScreen from '../screens/HistoryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ChargeScreen from '../screens/ChargeScreen';
import WithdrawScreen from '../screens/WithdrawScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const ONBOARDING_KEY = '@kkora_onboarding_done';

const screenOptions = {
  headerShown: false,
  contentStyle: { backgroundColor: Colors.bgPrimary },
  animation: 'slide_from_right' as const,
  animationDuration: 300,
};

const backHeaderOptions = {
  headerShown: true,
  headerTransparent: true,
  headerTitle: '',
  headerBackTitle: ' ',
  headerTintColor: Colors.textPrimary,
  headerBackTitleVisible: false as boolean,
  headerStyle: { backgroundColor: 'transparent' },
};

export default function AppNavigator() {
  const { user, loading } = useAuth();
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);

  const setOnboardingDoneRef = useRef(setOnboardingDone);
  setOnboardingDoneRef.current = setOnboardingDone;

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY).then((value) => {
      setOnboardingDone(value === 'true');
    });
    // 콜백 등록
    _setOnboardingDoneRef = setOnboardingDoneRef;
  }, []);

  // 로딩 중
  if (loading || onboardingDone === null) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.bgPrimary, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={Colors.green} size="large" />
      </View>
    );
  }

  // 인증/온보딩 상태에 따라 Navigator를 조건부 렌더링
  // 상태 변경 시 Navigator가 완전히 리마운트되어 initialRouteName이 정확히 적용됨
  if (!onboardingDone) {
    return (
      <Stack.Navigator screenOptions={screenOptions}>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      </Stack.Navigator>
    );
  }

  if (!user) {
    return (
      <Stack.Navigator screenOptions={screenOptions}>
        <Stack.Screen name="Login" component={LoginScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator screenOptions={screenOptions} initialRouteName="Home">
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Checklist" component={ChecklistScreen} options={backHeaderOptions} />
      <Stack.Screen name="Challenge" component={ChallengeScreen} />
      <Stack.Screen name="Result" component={ResultScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={backHeaderOptions} />
      <Stack.Screen name="History" component={HistoryScreen} options={backHeaderOptions} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={backHeaderOptions} />
      <Stack.Screen name="Charge" component={ChargeScreen} options={backHeaderOptions} />
      <Stack.Screen name="Withdraw" component={WithdrawScreen} options={backHeaderOptions} />
    </Stack.Navigator>
  );
}

// 온보딩 완료 표시용 콜백 (ref로 안전하게 관리)
let _setOnboardingDoneRef: React.MutableRefObject<(val: boolean) => void> | null = null;

export async function markOnboardingDone() {
  await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
  _setOnboardingDoneRef?.current?.(true);
}
