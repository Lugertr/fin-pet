// app/_layout.tsx
// Root Layout с ThemeProvider

import { queryClient } from '@/lib/api/queryClient';
import { ThemeProvider, useTheme } from '@/theme';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

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
        <Stack.Screen name="(auth)/onboarding" options={{ gestureEnabled: false }} />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(modal)/ai-chat" options={{ presentation: 'modal' }} />
        <Stack.Screen name="(modal)/deposit" options={{ presentation: 'modal' }} />
        <Stack.Screen name="(modal)/gifts-list" options={{ presentation: 'modal' }} />
        <Stack.Screen name="(modal)/inventory" options={{ presentation: 'modal' }} />
        <Stack.Screen name="(modal)/theme-reward" options={{ presentation: 'modal' }} />
        <Stack.Screen name="(modal)/arcade/[id]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="(modal)/lesson/[id]" options={{ presentation: 'modal' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <RootStack />
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
