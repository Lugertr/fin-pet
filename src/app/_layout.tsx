// app/_layout.tsx
// Root Layout с ThemeProvider

import { AlertHost } from '@/components/shared';
import { ThemeProvider, useTheme } from '@/theme';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

function RootStack() {
  const { theme, isDark } = useTheme();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="(modal)/budget-planning"
          options={{ presentation: 'modal', gestureEnabled: false }}
        />
        <Stack.Screen
          name="(modal)/period-summary"
          options={{ presentation: 'modal', gestureEnabled: false }}
        />
        <Stack.Screen name="(modal)/savings" options={{ presentation: 'modal' }} />
        <Stack.Screen name="(modal)/gifts-list" options={{ presentation: 'modal' }} />
        <Stack.Screen name="(modal)/inventory" options={{ presentation: 'modal' }} />
        <Stack.Screen name="(modal)/theme-reward" options={{ presentation: 'modal' }} />
        <Stack.Screen name="(modal)/arcade-lobby" options={{ presentation: 'modal' }} />
        <Stack.Screen name="(modal)/arcade" options={{ presentation: 'modal' }} />
        <Stack.Screen name="(modal)/lesson/[id]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="(modal)/adult-section" options={{ presentation: 'modal' }} />
      </Stack>
      {/* Один на всё приложение — см. lib/utils/alert.ts про то, почему
          react-native's Alert.alert не годится (no-op на react-native-web). */}
      <AlertHost />
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <RootStack />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
