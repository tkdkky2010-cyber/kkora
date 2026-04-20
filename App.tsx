import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/contexts/AuthContext';
import { ChallengeProvider } from './src/contexts/ChallengeContext';
import { LevelThemeProvider } from './src/contexts/LevelThemeContext';
import { OfflineBanner } from './src/components/atoms/OfflineBanner';
import AppNavigator from './src/navigation/AppNavigator';
import { linking } from './src/navigation/linking';

export default function App() {
  return (
    <AuthProvider>
      <ChallengeProvider>
        <LevelThemeProvider>
          <NavigationContainer linking={linking}>
            <StatusBar style="light" />
            <OfflineBanner />
            <AppNavigator />
          </NavigationContainer>
        </LevelThemeProvider>
      </ChallengeProvider>
    </AuthProvider>
  );
}
