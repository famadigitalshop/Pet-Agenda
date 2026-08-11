import { useFonts } from 'expo-font';
import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { RemindersProvider } from '@/contexts/RemindersContext';
import { EventsProvider } from '@/contexts/EventsContext';
import { PetsProvider } from '@/contexts/PetsContext';
import { TrialProvider, useTrial } from '@/contexts/TrialContext';
import Paywall from '@/components/Paywall';
import Colors from '@/constants/Colors';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <ThemeProvider value={DefaultTheme}>
      <TrialProvider>
        <PetsProvider>
          <EventsProvider>
            <RemindersProvider>
              <TrialGate />
            </RemindersProvider>
          </EventsProvider>
        </PetsProvider>
      </TrialProvider>
    </ThemeProvider>
  );
}

function TrialGate() {
  const { loading, isPremium } = useTrial();

  if (loading) {
    return null;
  }

  if (!isPremium) {
    return <Paywall />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="adicionar-pet"
        options={{
          presentation: 'modal',
          headerShown: true,
          title: 'Novo pet',
          headerStyle: { backgroundColor: Colors.light.background },
          headerTintColor: Colors.light.text,
          headerShadowVisible: false,
        }}
      />
    </Stack>
  );
}
