import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { Colors } from '../constants/colors';

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
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      {/* Auth Flow */}
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />

      {/* Main Flow */}
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Checklist" component={ChecklistScreen} options={backHeaderOptions} />
      <Stack.Screen name="Challenge" component={ChallengeScreen} />
      <Stack.Screen name="Result" component={ResultScreen} />

      {/* Profile Flow */}
      <Stack.Screen name="Profile" component={ProfileScreen} options={backHeaderOptions} />
      <Stack.Screen name="History" component={HistoryScreen} options={backHeaderOptions} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={backHeaderOptions} />
    </Stack.Navigator>
  );
}
