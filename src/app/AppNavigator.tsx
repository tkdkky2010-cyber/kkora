import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../types/navigation';
import { Colors } from '../constants/colors';
import { useAuth } from '../contexts/AuthContext';

import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import ChecklistScreen from '../screens/ChecklistScreen';
import ChallengeScreen from '../screens/ChallengeScreen';
import ResultScreen from '../screens/ResultScreen';
import ProfileScreen from '../screens/ProfileScreen';
import HistoryScreen from '../screens/HistoryScreen';
import SettingsScreen from '../screens/SettingsScreen';

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
  headerTintColor: Colors.textPrimary,
};

export default function AppNavigator() {
  const { user, loading } = useAuth();
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY).then((value) => {
      setOnboardingDone(value === 'true');
    });
  }, []);

  // 로딩 중
  if (loading || onboardingDone === null) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.bgPrimary, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={Colors.green} size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      {!onboardingDone ? (
        // 최초 실행: 온보딩
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      ) : null}

      {!user ? (
        // 미로그인: 로그인 화면
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : null}

      {/* 메인 플로우 (로그인 후) */}
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Checklist" component={ChecklistScreen} options={backHeaderOptions} />
      <Stack.Screen name="Challenge" component={ChallengeScreen} />
      <Stack.Screen name="Result" component={ResultScreen} />

      {/* 프로필 플로우 */}
      <Stack.Screen name="Profile" component={ProfileScreen} options={backHeaderOptions} />
      <Stack.Screen name="History" component={HistoryScreen} options={backHeaderOptions} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={backHeaderOptions} />
    </Stack.Navigator>
  );
}

// 온보딩 완료 표시 (OnboardingScreen에서 호출)
export async function markOnboardingDone() {
  await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
}
