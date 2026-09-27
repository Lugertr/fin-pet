// app/_layout.tsx
// Root Layout с ThemeProvider

import { AlertHost } from '@/components/shared';
import { useApplySettings } from '@/lib/settings/useApplySettings';
import { ThemeProvider, useTheme } from '@/theme';
import { FONT_SOURCES } from '@/theme/fonts';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

function RootStack() {
  const { theme, isDark } = useTheme();
  // Сохранённые звуки/вибрация/уведомления — к сервисам при старте и при изменении.
  useApplySettings();

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
          name="(modal)/adventure-planning"
          options={{ presentation: 'modal', gestureEnabled: false }}
        />
        <Stack.Screen name="(modal)/adventure" />
        <Stack.Screen name="(modal)/gifts-list" options={{ presentation: 'modal' }} />
        <Stack.Screen name="(modal)/inventory" options={{ presentation: 'modal' }} />
        <Stack.Screen name="(modal)/theme-reward" options={{ presentation: 'modal' }} />
        <Stack.Screen name="(modal)/arcade-lobby" options={{ presentation: 'modal' }} />
        <Stack.Screen name="(modal)/arcade" options={{ presentation: 'modal' }} />
        <Stack.Screen name="(modal)/lesson/[id]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="(modal)/adult-section" options={{ presentation: 'modal' }} />
        {/* Подэкраны вкладки «Прогресс» — обычный переход вправо, как на макетах. */}
        <Stack.Screen name="(modal)/settings" />
        <Stack.Screen name="(modal)/achievements" />
        <Stack.Screen name="(modal)/glossary" />
        <Stack.Screen name="(modal)/documents" />
        <Stack.Screen name="(modal)/transactions" />
      </Stack>
      {/* Один на всё приложение — см. lib/utils/alert.ts про то, почему
          react-native's Alert.alert не годится (no-op на react-native-web). */}
      <AlertHost />
    </>
  );
}

export default function RootLayout() {
  // Manrope из бандла грузится за доли секунды — ждём, чтобы текст не
  // мигал системным шрифтом; если загрузка не удалась, работаем на системном.
  const [fontsLoaded, fontError] = useFonts(FONT_SOURCES);
  if (!fontsLoaded && !fontError) return null;

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
