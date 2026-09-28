// app/_layout.tsx
// Root Layout с ThemeProvider. Здесь же — запуск приложения (useAppBootstrap:
// профиль, питомец, прогресс уроков и текущая смена из SQLite): экраны
// показываются только после него, поэтому и прямая ссылка на вебе (например,
// /lesson/3 или /shop) открывается с загруженными данными. Раньше запуск жил
// в маршруте «/», и прямая ссылка его пропускала — сторы оставались пустыми,
// прогресс не сохранялся. Без профиля любой экран, кроме онбординга, ведёт
// на онбординг.

import { AlertHost } from '@/components/shared';
import { useAppBootstrap } from '@/lib/hooks/useAppBootstrap';
import { useEnergyBonuses } from '@/lib/pet/useEnergyBonuses';
import { useApplySettings } from '@/lib/settings/useApplySettings';
import { useUserStore } from '@/lib/stores/userStore';
import { ThemeProvider, useTheme } from '@/theme';
import { FONT_SOURCES } from '@/theme/fonts';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

function RootStack() {
  const { theme, isDark } = useTheme();
  // Сохранённые звуки/вибрация/уведомления — к сервисам при старте и при изменении.
  useApplySettings();
  // Бонусы декора к энергии — на любом экране, не только на хабе.
  useEnergyBonuses();
  const isReady = useAppBootstrap();
  const isOnboarded = useUserStore((state) => state.isOnboarded);
  const segments = useSegments();
  const router = useRouter();

  // Прямая ссылка на экран без профиля — на онбординг («/» решает сам, см. index.tsx).
  const firstSegment = segments[0] as string | undefined;
  const needsOnboarding =
    isReady && !isOnboarded && firstSegment !== undefined && firstSegment !== '(auth)';
  useEffect(() => {
    if (needsOnboarding) router.replace('/(auth)/onboarding' as never);
  }, [needsOnboarding, router]);

  if (!isReady) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

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

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
