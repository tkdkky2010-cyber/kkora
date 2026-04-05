import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/contexts/AuthContext';
import { ChallengeProvider } from './src/contexts/ChallengeContext';
import { OfflineBanner } from './src/components/atoms/OfflineBanner';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <AuthProvider>
      <ChallengeProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <OfflineBanner />
          <AppNavigator />
        </NavigationContainer>
      </ChallengeProvider>
    </AuthProvider>
  );
}
