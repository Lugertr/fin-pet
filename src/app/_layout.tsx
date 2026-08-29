// app/_layout.tsx
// Root Layout для «ФинСпутник»

import { COLORS } from '@/constants/theme';
import { queryClient } from '@/lib/api/queryClient';
import { useMoodRefreshTimer } from '@/lib/hooks/usePet';
import { feedback } from '@/lib/services/feedback';
import { notifications } from '@/lib/services/notifications';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  useMoodRefreshTimer(15000);

  // Инициализация сервисов при старте приложения
  useEffect(() => {
    const initServices = async () => {
      // Инициализируем аудио
      await feedback.initialize();

      // Инициализируем уведомления
      await notifications.initialize();
    };

    initServices();

    // Cleanup при выходе
    return () => {
      feedback.cleanup();
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: COLORS.background },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="(auth)" options={{ gestureEnabled: false }} />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(modal)" options={{ presentation: 'modal' }} />
        </Stack>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
